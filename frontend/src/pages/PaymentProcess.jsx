import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

export default function PaymentProcess() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();
  const { backendUrl } = useContext(AppContext);

  const params = new URLSearchParams(location.search);
  const sessionId = params.get("session_id");

  const [status, setStatus] = useState(
    sessionId ? "Confirming Stripe session…" : (orderId ? `Processing order: ${orderId}` : "Redirected from payment gateway.")
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!sessionId) return;
      try {
        const res = await axios.post(
          `${backendUrl}/api/payments/stripe/confirm`,
          { sessionId },
          { withCredentials: true }
        );
        if (cancelled) return;
        if (res?.data?.success) {
          setStatus("Enrollment recorded. You can start learning now.");
          toast.success("Payment confirmed & enrollment created!");
        } else {
          setStatus("Session confirmed, but enrollment not recorded.");
          toast.warn(res?.data?.message || "Could not record enrollment.");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Confirm error:", err);
        setStatus(err?.response?.data?.message || "Failed to confirm payment.");
        toast.error(err?.response?.data?.message || "Failed to confirm payment.");
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId, backendUrl]);

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <div className="text-xl font-semibold">Payment Status</div>
        <div className="text-slate-400 text-sm mt-2 break-all">
          {sessionId ? (
            <>
              Stripe session confirmed.<br />Session: {sessionId}<br />
              {status}
            </>
          ) : orderId ? (
            <>{status}</>
          ) : (
            <>{status}</>
          )}
        </div>
        <div className="mt-5 grid gap-2">
          <button
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2"
            onClick={() => navigate('/my-learning')}
          >
            Go to My Learning
          </button>
          <button
            className="rounded-xl border border-white/10 px-4 py-2"
            onClick={() => navigate('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

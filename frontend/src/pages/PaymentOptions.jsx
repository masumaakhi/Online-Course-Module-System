import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

export default function PaymentOptions() {
  const navigate = useNavigate();
  const { id } = useParams(); // courseId
  const { backendUrl } = useContext(AppContext);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/courses/${id}`, {
          withCredentials: true,
        });
        const payload = res?.data?.data ?? res?.data;
        if (!cancelled) setCourse(payload || null);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, backendUrl]);

  const payWithStripe = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/payments/stripe/checkout`,
        { courseId: id },
        { withCredentials: true }
      );
      const url = res?.data?.url;
      if (url) return (window.location.href = url);
      toast.error("Stripe checkout unavailable");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to start Stripe");
    }
  };

  const payWithSSL = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/payments/ssl/init`,
        { courseId: id },
        { withCredentials: true }
      );
      const url = res?.data?.url;
      if (url) return (window.location.href = url);
      toast.error(res?.data?.message || "Failed to init SSLCommerz");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to init SSLCommerz");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100 px-4">
      <div className="max-w-lg w-full rounded-3xl border border-white/10 bg-white/5 p-6">
        <button
          className="text-slate-300 text-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <div className="mt-2 text-2xl font-extrabold">Choose a payment method</div>
        {loading ? (
          <div className="mt-3 text-slate-400 text-sm">Loading course…</div>
        ) : error ? (
          <div className="mt-3 text-red-300 text-sm">{error}</div>
        ) : course ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="font-semibold">{course.title}</div>
            <div className="text-slate-400 text-sm mt-1">
              Price: ${Number(course?.pricing?.price || 0).toFixed(2)}
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          <button
            onClick={payWithStripe}
            className="rounded-2xl px-4 py-3 text-white border border-white/15"
            style={{ background: "linear-gradient(90deg,#6366f133,#06b6d433)" }}
          >
            Pay with Stripe
          </button>
          <button
            onClick={payWithSSL}
            className="rounded-2xl px-4 py-3 text-white border border-white/15"
            style={{ background: "linear-gradient(90deg,#22c55e33,#f59e0b33)" }}
          >
            Pay with SSLCommerz
          </button>
        </div>
      </div>
    </div>
  );
}



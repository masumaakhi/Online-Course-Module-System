// src/pages/MyLearning.jsx
import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import { AppContext } from "../context/AppContext";
import { EnrollmentsAPI } from "../api/enrollments";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function MyLearning() {
  const { backendUrl } = useContext(AppContext);
  const api = EnrollmentsAPI(backendUrl);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);      // first load
  const [refreshing, setRefreshing] = useState(false); // later refreshes
  const didFetchOnce = useRef(false); // 🚫 StrictMode double-effect guard

  const fetchEnrollments = useCallback(async () => {
    // প্রথমবার হলে full-screen loading, না হলে ছোট refresh state
    if (!didFetchOnce.current) setLoading(true);
    else setRefreshing(true);

    try {
      const payload = await api.myEnrollments();
      const list = Array.isArray(payload) ? payload : (payload?.data || []);
      setItems(list.filter(e => e?.course));
    } catch (err) {
      console.error("MyLearning fetch error:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to load enrollments");
    } finally {
      didFetchOnce.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useEffect(() => {
    if (didFetchOnce.current) return; // 🔒 StrictMode দ্বিতীয়বার ট্রিগার হলেও স্কিপ
    fetchEnrollments();
  }, [fetchEnrollments]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(168,85,247,0.10),rgba(14,165,233,0.10)_40%,transparent_70%)]" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">My Learning</h1>
          <button
            onClick={fetchEnrollments}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-slate-400">You haven’t enrolled in any course yet.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => {
              const c = e?.course || {};
              const pct = Number(e?.progress?.percentage || 0);
              return (
                <div key={e?._id || c?._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  {c?.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt={c.title || "Course thumbnail"}
                      className="h-36 w-full object-cover rounded-xl mb-3"
                    />
                  ) : (
                    <div className="h-36 w-full rounded-xl bg-white/5 mb-3" />
                  )}
                  <div className="font-semibold line-clamp-2">{c?.title || "Untitled course"}</div>
                  <div className="text-sm text-slate-400">{(c?.category || "—")} · {(c?.difficulty || "—")}</div>

                  <div className="mt-3 h-2 bg-white/10 rounded overflow-hidden" title={`${pct}%`}>
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-400 to-sky-400"
                      style={{ width: `${Math.min(Math.max(pct, 0), 100)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{pct}% completed</div>

                  <Link
                    to={`/course/${c?._id}`}
                    className="mt-3 inline-block rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
                  >
                    Continue
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

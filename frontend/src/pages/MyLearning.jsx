// src/pages/MyLearning.jsx
import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { EnrollmentsAPI } from "../api/enrollments";
import { Link } from "react-router-dom";

export default function MyLearning() {
  const { backendUrl } = useContext(AppContext);
  const api = EnrollmentsAPI(backendUrl);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const payload = await api.myEnrollments();
        setItems(payload.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center text-slate-300">
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(168,85,247,0.10),rgba(14,165,233,0.10)_40%,transparent_70%)]" />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">My Learning</h1>

        {items.length === 0 ? (
          <div className="text-slate-400">
            You haven’t enrolled in any course yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((e) => {
              const c = e.course || {};
              const pct = e.progress?.percentage || 0;
              return (
                <div key={e._id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  {c.thumbnail ? (
                    <img
                      src={c.thumbnail}
                      alt=""
                      className="h-36 w-full object-cover rounded-xl mb-3"
                    />
                  ) : (
                    <div className="h-36 w-full rounded-xl bg-white/5 mb-3" />
                  )}
                  <div className="font-semibold line-clamp-2">{c.title}</div>
                  <div className="text-sm text-slate-400">
                    {c.category} · {c.difficulty}
                  </div>
                  <div className="mt-3 h-2 bg-white/10 rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-fuchsia-400 to-sky-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{pct}% completed</div>

                  {/* Continue → course details (এখান থেকে course page-এ গেলে enrolled access দেখাবে) */}
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

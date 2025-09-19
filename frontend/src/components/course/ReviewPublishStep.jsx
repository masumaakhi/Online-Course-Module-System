//src/components/course/ReviewPublishStep.jsx

import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const ReviewPublishStep = ({ data, courseId, onPrev, onSaveDraft, onPublish, loading }) => {
  const { backendUrl } = useContext(AppContext);
  const [previewMode, setPreviewMode] = useState(false);

  const totalLessons = data.modules.reduce((t, m) => t + m.lessons.length, 0);
  const totalDuration = (() => {
    let totalMins = 0;
    data.modules.forEach((m) =>
      m.lessons.forEach((l) => {
        if (l.duration && l.type === "Video") {
          const [mm, ss] = String(l.duration).split(":").map(Number);
          if (!isNaN(mm)) totalMins += mm + (isNaN(ss) ? 0 : ss / 60);
        }
      })
    );
    const h = Math.floor(totalMins / 60);
    const m = Math.floor(totalMins % 60);
    return `${h}:${m.toString().padStart(2, "0")}`;
  })();

  const discounted = data.pricing.plan === "free"
    ? 0
    : Math.max(0, data.pricing.price - (data.pricing.price * data.pricing.discount) / 100);

  const handleAssignUsers = async () => {
    if (data.assignedUsers.length === 0) return;
    try {
      const ids = data.assignedUsers.map((u) => u._id);
      const { data: res } = await axios.post(
        `${backendUrl}/api/enrollments/assign`,
        { courseId, employeeIds: ids },
        { withCredentials: true }
      );
      if (res.success) toast.success(`Assigned ${res.data.length} users to the course`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to assign users");
    }
  };

  const handlePublish = async () => {
    if (data.assignedUsers.length > 0) await handleAssignUsers();
    await onPublish();
  };

  return (
    <div className="space-y-6">
      <Header title="Review & Publish" subtitle="Review your course details before publishing." />

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Course Summary</div>
          <button
            onClick={() => setPreviewMode((s) => !s)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm"
          >
            {previewMode ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left info */}
          <div className="space-y-4 text-sm">
            <KV k="Title" v={data.title} />
            <KV k="Category" v={data.category} />
            <KV k="Difficulty" v={data.difficulty} />
            <KV k="Language" v={data.language} />
            <KV k="Audience" v={data.audience} />
            {data.tags.length > 0 && (
              <div>
                <div className="text-slate-400">Tags</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {data.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.prerequisites.length > 0 && (
              <div>
                <div className="text-slate-400">Prerequisites</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-200">
                  {data.prerequisites.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Right info */}
          <div className="space-y-4 text-sm">
            <div>
              <div className="text-slate-400">Content Overview</div>
              <div className="mt-1 space-y-1">
                <div className="flex justify-between"><span>Modules</span><span className="font-medium">{data.modules.length}</span></div>
                <div className="flex justify-between"><span>Total Lessons</span><span className="font-medium">{totalLessons}</span></div>
                <div className="flex justify-between"><span>Duration</span><span className="font-medium">{totalDuration}</span></div>
              </div>
            </div>

            <div>
              <div className="text-slate-400">Pricing & Access</div>
              <div className="mt-1 space-y-1">
                <div className="flex justify-between"><span>Type</span><span className="font-medium capitalize">{data.pricing.plan}</span></div>
                {data.pricing.plan === "paid" && (
                  <>
                    <div className="flex justify-between"><span>Price</span><span className="font-medium">${Number(data.pricing.price).toFixed(2)}</span></div>
                    {data.pricing.discount > 0 && (
                      <div className="flex justify-between"><span>Discount</span><span className="font-medium">{data.pricing.discount}%</span></div>
                    )}
                    <div className="flex justify-between"><span>Final</span><span className="font-bold text-emerald-300">${discounted.toFixed(2)}</span></div>
                  </>
                )}
                <div className="flex justify-between"><span>Visibility</span><span className="font-medium capitalize">{data.visibility}</span></div>
                <div className="flex justify-between"><span>Enrollment</span><span className="font-medium capitalize">{data.enrollmentType}</span></div>
              </div>
            </div>

            {data.assignedUsers.length > 0 && (
              <div>
                <div className="text-slate-400">Assigned Users ({data.assignedUsers.length})</div>
                <div className="mt-1 space-y-1">
                  {data.assignedUsers.slice(0, 3).map((u) => (
                    <div key={u._id} className="text-slate-200">{u.name} ({u.email})</div>
                  ))}
                  {data.assignedUsers.length > 3 && (
                    <div className="text-slate-400">+{data.assignedUsers.length - 3} more users</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <div className="text-slate-400 mb-1">Description</div>
          <p className="text-slate-200 whitespace-pre-wrap">{data.description}</p>
        </div>

        {data.objectives.length > 0 && (
          <div className="mt-6">
            <div className="text-slate-400 mb-1">Learning Objectives</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-200">
              {data.objectives.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          </div>
        )}
      </section>

      {previewMode && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold mb-3">Course Preview</div>
          {data.modules.map((m, mi) => (
            <div key={mi} className="rounded-xl border border-white/10 bg-slate-900/40 p-4 mb-3">
              <div className="font-medium">Module {mi + 1}: {m.name}</div>
              {m.description && <div className="text-sm text-slate-400">{m.description}</div>}
              <div className="mt-2 space-y-1 text-sm">
                {m.lessons.map((l, li) => (
                  <div key={li} className="flex items-center gap-3">
                    <span className="text-xs w-5 h-5 grid place-items-center rounded border border-white/15 bg-white/5">{li + 1}</span>
                    <span className="text-slate-200">{l.title}</span>
                    <span className="text-slate-400">({l.type}{l.duration ? ` • ${l.duration}` : ""})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="flex justify-between pt-6 border-top border-t border-white/10">
        <button onClick={onPrev} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200">
          Previous
        </button>
        <div className="flex gap-2">
          <button onClick={onSaveDraft} disabled={loading} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200">
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="rounded-xl border border-white/15 px-5 py-2 text-white disabled:opacity-40"
            style={{ background: "linear-gradient(90deg,#f0abfc33,#22d3ee33)" }}
          >
            {loading ? "Publishing…" : "Publish Course"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPublishStep;

function Header({ title, subtitle }) {
  return (
    <div>
      <div className="text-2xl font-bold">{title}</div>
      {subtitle && <div className="text-slate-400">{subtitle}</div>}
    </div>
  );
}
function KV({ k, v }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{k}</span>
      <span className="font-medium text-slate-200">{v}</span>
    </div>
  );
}

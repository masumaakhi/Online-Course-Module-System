// src/components/course/ReviewPublishStep.jsx
import React, { useState, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const ReviewPublishStep = ({ data, courseId, onPrev, onSaveDraft, onPublish, loading }) => {
  const { backendUrl } = useContext(AppContext);
  const [previewMode, setPreviewMode] = useState(false);

  const modules = data.modules ?? [];
  const assignedUsers = data.assignedUsers ?? [];

  const totalLessons = modules.reduce((t, m) => t + (m.lessons?.length || 0), 0);

  const totalDuration = (() => {
    let totalMins = 0;
    modules.forEach((m) =>
      (m.lessons || []).forEach((l) => {
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

  const discounted =
    data.pricing.plan === "free"
      ? 0
      : Math.max(0, data.pricing.price - (data.pricing.price * data.pricing.discount) / 100);

  const handleAssignUsers = async () => {
    if (assignedUsers.length === 0) return;
    try {
      const ids = assignedUsers.map((u) => u._id);
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
    if (assignedUsers.length > 0) await handleAssignUsers();
    await onPublish();
  };

  return (
    <div className="space-y-6 max-[450px]:space-y-5">
      <Header title="Review & Publish" subtitle="Review your course details before publishing." />

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          <div className="text-base sm:text-lg font-semibold">Course Summary</div>
          <button
            onClick={() => setPreviewMode((s) => !s)}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
          >
            {previewMode ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left info */}
          <div className="space-y-4 text-sm max-[350px]:text-xs">
            <KV k="Title" v={data.title} />
            <KV k="Category" v={data.category} />
            <KV k="Difficulty" v={data.difficulty} />
            <KV k="Language" v={data.language} />
            <KV k="Audience" v={data.audience} />

            {data.tags?.length > 0 && (
              <div>
                <div className="text-slate-400">Tags</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {data.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] sm:text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.prerequisites?.length > 0 && (
              <div>
                <div className="text-slate-400">Prerequisites</div>
                <ul className="list-disc pl-5 space-y-1 text-slate-200">
                  {data.prerequisites.map((p, i) => (
                    <li key={i} className="break-words">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right info */}
          <div className="space-y-4 text-sm max-[350px]:text-xs">
            <div>
              <div className="text-slate-400">Content Overview</div>
              <div className="mt-1 space-y-1">
                <KV k="Modules" v={modules.length} />
                <KV k="Total Lessons" v={totalLessons} />
                <KV k="Duration" v={totalDuration} />
              </div>
            </div>

            <div>
              <div className="text-slate-400">Pricing & Access</div>
              <div className="mt-1 space-y-1">
                <KV k="Type" v={<span className="capitalize">{data.pricing.plan}</span>} />
                {data.pricing.plan === "paid" && (
                  <>
                    <KV k="Price" v={`$${Number(data.pricing.price).toFixed(2)}`} />
                    {data.pricing.discount > 0 && (
                      <KV k="Discount" v={`${data.pricing.discount}%`} />
                    )}
                    <KV
                      k="Final"
                      v={<span className="font-bold text-emerald-300">${discounted.toFixed(2)}</span>}
                    />
                  </>
                )}
                <KV k="Visibility" v={<span className="capitalize">{data.visibility}</span>} />
                <KV
                  k="Enrollment"
                  v={<span className="capitalize">{data.enrollmentType}</span>}
                />
              </div>
            </div>

            {assignedUsers.length > 0 && (
              <div>
                <div className="text-slate-400">
                  Assigned Users ({assignedUsers.length})
                </div>
                <div className="mt-1 space-y-1">
                  {assignedUsers.slice(0, 3).map((u) => (
                    <div key={u._id} className="text-slate-200 break-all">
                      {u.name} ({u.email})
                    </div>
                  ))}
                  {assignedUsers.length > 3 && (
                    <div className="text-slate-400">
                      +{assignedUsers.length - 3} more users
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 sm:mt-6">
          <div className="text-slate-400 mb-1">Description</div>
          <p className="text-slate-200 whitespace-pre-wrap break-words text-sm sm:text-base">
            {data.description}
          </p>
        </div>

        {data.objectives?.length > 0 && (
          <div className="mt-5 sm:mt-6">
            <div className="text-slate-400 mb-1">Learning Objectives</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-200">
              {data.objectives.map((o, i) => (
                <li key={i} className="break-words">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {previewMode && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
          <div className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Course Preview</div>
          {modules.map((m, mi) => (
            <div
              key={mi}
              className="rounded-xl border border-white/10 bg-slate-900/40 p-3 sm:p-4 mb-3"
            >
              <div className="font-medium break-words">
                Module {mi + 1}: {m.name}
              </div>
              {m.description && (
                <div className="text-xs sm:text-sm text-slate-400 break-words">
                  {m.description}
                </div>
              )}
              <div className="mt-2 space-y-1 text-xs sm:text-sm">
                {(m.lessons || []).map((l, li) => (
                  <div key={li} className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="text-[10px] sm:text-xs w-5 h-5 grid place-items-center rounded border border-white/15 bg-white/5">
                      {li + 1}
                    </span>
                    <span className="text-slate-200 break-words">{l.title}</span>
                    <span className="text-slate-400">
                      ({l.type}
                      {l.duration ? ` • ${l.duration}` : ""})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* action bar */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-white/10">
        <button
          onClick={onPrev}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200"
        >
          Previous
        </button>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onSaveDraft}
            disabled={loading}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200 w-full sm:w-auto"
          >
            Save as Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="rounded-xl border border-white/15 px-5 py-2 text-white disabled:opacity-40 w-full sm:w-auto"
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
      <div className="text-xl sm:text-2xl font-bold">{title}</div>
      {subtitle && <div className="text-slate-400 text-sm sm:text-base">{subtitle}</div>}
    </div>
  );
}

/** Responsive key–value row: labels/values wrap nicely on small screens */
function KV({ k, v }) {
  return (
    <div className="grid grid-cols-[auto,1fr] items-start gap-x-3 gap-y-1 text-sm max-[350px]:text-xs">
      <span className="text-slate-400">{k}</span>
      <span className="font-medium text-slate-200 justify-self-end text-right break-words min-w-0">
        {v}
      </span>
    </div>
  );
}

// src/pages/StudentDashboard.jsx
// FR25: Student Dashboard — enrolled courses, progress, certificates, profile

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { EnrollmentsAPI } from "../api/enrollments";

export default function StudentDashboard() {
  const { backendUrl, userData } = useContext(AppContext);

  // ✅ stable API instance (dependency-friendly)
  const api = useMemo(() => EnrollmentsAPI(backendUrl), [backendUrl]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [tab, setTab] = useState("overview"); // overview | courses | certificates | profile

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // ✅ myEnrollments() returns { success, data: [...], pagination }
        const resp = await api.myEnrollments();
        const itemsCandidate = resp?.data ?? resp?.enrollments ?? resp ?? [];
        const items = Array.isArray(itemsCandidate) ? itemsCandidate : [];

        if (alive) setEnrollments(items);
      } catch (e) {
        console.error(e);
        if (alive) setError(e?.response?.data?.message || "Failed to load dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [api]);

  // ---- derived stats (defensive) ----
  const totalCourses = Array.isArray(enrollments) ? enrollments.length : 0;
  const completedCourses = Array.isArray(enrollments)
    ? enrollments.filter(
        (e) => e.status === "completed" || Number(e?.progress?.percentage) === 100
      ).length
    : 0;
  const certificates = Array.isArray(enrollments)
    ? enrollments.filter((e) => e?.certificate?.issued).length
    : 0;
  const avgProgress = Array.isArray(enrollments) && enrollments.length
    ? Math.round(
        enrollments.reduce(
          (acc, e) => acc + (Number(e?.progress?.percentage) || 0),
          0
        ) / enrollments.length
      )
    : 0;

  const continueList = Array.isArray(enrollments)
    ? enrollments
        .filter(
          (e) =>
            (e.status === "active" || e.status === "paused") &&
            (Number(e?.progress?.percentage) || 0) < 100
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.createdAt || 0)
        )
        .slice(0, 3)
    : [];

  if (loading)
    return (
      <Shell>
        <Skeleton />
      </Shell>
    );

  if (error)
    return (
      <Shell>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-lg font-semibold">Dashboard unavailable</div>
            <div className="text-slate-400 mt-1 text-sm">{error}</div>
          </div>
        </div>
      </Shell>
    );

  return (
    <Shell>
      <Decor />

      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Student Dashboard
            </h1>
            <p className="mt-1 text-slate-300">
              Welcome back
              {userData?.name ? ", " + userData.name.split(" ")[0] : ""}! Track
              your learning at a glance.
            </p>
          </div>
          <Link
            to="/courses"
            className="inline-block rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm"
          >
            Browse Courses
          </Link>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <KPI title="Enrolled" value={totalCourses} caption="total courses" />
          <KPI title="Completed" value={completedCourses} caption="finished courses" />
          <KPI title="Certificates" value={certificates} caption="issued" />
          <KPI title="Avg. Progress" value={`${avgProgress}%`} caption="across courses" />
        </div>

        {/* Tabs */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5">
          <div className="flex gap-2 p-2">
            {[
              { key: "overview", label: "Overview" },
              { key: "courses", label: "My Courses" },
              { key: "certificates", label: "Certificates" },
              { key: "profile", label: "Profile" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-xl px-3 py-2 text-sm border ${
                  tab === t.key
                    ? "bg-white/10 border-white/20"
                    : "bg-white/5 border-white/10 text-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Panels */}
          <div className="border-t border-white/10 p-5">
            {tab === "overview" && (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Continue learning */}
                <div className="lg:col-span-2">
                  <SectionTitle>Continue learning</SectionTitle>
                  {continueList.length === 0 ? (
                    <Empty label="No active courses. Enroll to get started!" />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {continueList.map((e) => (
                        <CourseProgressCard key={e._id} enrollment={e} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick profile */}
                <div>
                  <SectionTitle>Profile</SectionTitle>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-white/10 grid place-items-center">
                        👤
                      </div>
                      <div>
                        <div className="font-semibold">
                          {userData?.name || "Student"}
                        </div>
                        <div className="text-sm text-slate-400">
                          {userData?.email || "—"}
                        </div>
                        <div className="text-xs mt-1 text-slate-400">
                          Role: {userData?.role || "student"}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/settings"
                      className="mt-4 inline-block rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
                    >
                      Edit profile
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {tab === "courses" && (
              <div>
                <SectionTitle>My Courses</SectionTitle>
                {enrollments.length === 0 ? (
                  <Empty label="You haven’t enrolled in any course yet." />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {enrollments.map((e) => (
                      <CourseCard key={e._id} enrollment={e} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "certificates" && (
              <div>
                <SectionTitle>Certificates</SectionTitle>
                {enrollments.filter(
                  (e) => e?.certificate?.issued || Number(e?.progress?.percentage) === 100
                ).length === 0 ? (
                  <Empty label="No certificates yet. Complete a course to earn one!" />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {enrollments
                      .filter(
                        (e) =>
                          e?.certificate?.issued ||
                          Number(e?.progress?.percentage) === 100
                      )
                      .map((e) => (
                        <CertificateCard
                          key={e._id}
                          enrollment={e}
                          backendUrl={backendUrl}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {tab === "profile" && (
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <SectionTitle>Profile details</SectionTitle>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Name" value={userData?.name || "—"} />
                      <Field label="Email" value={userData?.email || "—"} />
                      <Field label="Role" value={userData?.role || "student"} />
                      <Field label="Enrolled Courses" value={String(totalCourses)} />
                      <Field label="Completed" value={String(completedCourses)} />
                      <Field label="Certificates" value={String(certificates)} />
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                      * Editing profile may require a separate settings page.
                    </div>
                  </div>
                </div>

                <div>
                  <SectionTitle>At a glance</SectionTitle>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">Overall progress</span>
                      <span className="text-slate-400">{avgProgress}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-400"
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                    <div className="mt-4 grid gap-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Active</span>
                        <span className="text-slate-400">
                          {
                            enrollments.filter((e) => e.status !== "completed")
                              .length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Completed</span>
                        <span className="text-slate-400">{completedCourses}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Small components ---------------- */
function Shell({ children }) {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
}
function Decor() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(168,85,247,0.10),rgba(14,165,233,0.10)_40%,transparent_70%)]" />
      <div className="pointer-events-none fixed -top-20 -left-20 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed -bottom-20 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl -z-10" />
    </>
  );
}
function KPI({ title, value, caption }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-slate-400">{title}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{caption}</div>
    </div>
  );
}
function SectionTitle({ children }) {
  return (
    <div className="mb-3 text-sm font-semibold tracking-wide text-slate-300">
      {children}
    </div>
  );
}
function Empty({ label }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
      {label}
    </div>
  );
}
function Field({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 rounded-xl border border-white/10 bg-white/5 p-2">
        {value}
      </div>
    </div>
  );
}

function CourseCard({ enrollment }) {
  const c = enrollment.course || {};
  const pct = Number(enrollment?.progress?.percentage) || 0;
  const cid = c?._id || c?.id;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-semibold line-clamp-1">
        {c.title || "Untitled course"}
      </div>
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
      {cid && (
        <Link
          to={`/course/${cid}`}
          className="mt-3 inline-block rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
        >
          Continue
        </Link>
      )}
    </div>
  );
}

function CourseProgressCard({ enrollment }) {
  const c = enrollment.course || {};
  const pct = Number(enrollment?.progress?.percentage) || 0;
  const cid = c?._id || c?.id;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold line-clamp-1">{c.title || "Untitled course"}</div>
          <div className="text-sm text-slate-400">{c.category} · {c.difficulty}</div>
        </div>
        <span className="text-xs text-slate-400">{pct}%</span>
      </div>
      <div className="mt-3 h-2 bg-white/10 rounded overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-fuchsia-400 to-sky-400"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex gap-2">
        {cid && (
          <Link
            to={`/course/${cid}`}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
          >
            Continue
          </Link>
        )}
        <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
          Lessons {c.totalLessons ?? "—"}
        </span>
      </div>
    </div>
  );
}

function CertificateCard({ enrollment, backendUrl }) {
  const c = enrollment.course || {};
  const issued = Boolean(enrollment?.certificate?.issued);
  const eligible = (Number(enrollment?.progress?.percentage) || 0) === 100;
  const issuedAt = enrollment?.certificate?.issuedAt
    ? new Date(enrollment.certificate.issuedAt)
    : null;
  const certId = enrollment?.certificate?.certificateId || "";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="font-semibold line-clamp-1">{c.title || "Course"}</div>
      <div className="text-sm text-slate-400">{c.category} · {c.difficulty}</div>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
        {issued ? (
          <div className="space-y-1">
            <div className="text-emerald-300">Certificate issued ✅</div>
            {issuedAt && (
              <div className="text-slate-400 text-xs">
                Issued on {issuedAt.toLocaleDateString()}
              </div>
            )}
            <div className="text-xs text-slate-400">ID: {certId || "—"}</div>
          </div>
        ) : eligible ? (
          <div className="text-slate-300">Completed — awaiting certificate</div>
        ) : (
          <div className="text-slate-400">Complete the course to earn a certificate.</div>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        {issued ? (
          <a
            href={`${backendUrl}/api/certificates/${certId}`}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
          >
            View Certificate
          </a>
        ) : (
          <button
            disabled
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-slate-400"
          >
            Not available
          </button>
        )}
        {c?._id || c?.id ? (
          <Link
            to={`/course/${c?._id || c?.id}`}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm"
          >
            Go to course
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-10 w-2/3 bg-white/5 rounded animate-pulse" />
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-white/10 bg-white/5 animate-pulse" />
        ))}
      </div>
      <div className="mt-6 h-96 rounded-3xl border border-white/10 bg-white/5 animate-pulse" />
    </div>
  );
}





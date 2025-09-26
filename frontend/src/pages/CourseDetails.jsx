// src/pages/CourseDetails.jsx — Enroll + Progress + Preview Locking (FIXED)
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { EnrollmentsAPI } from "../api/enrollments";
import { useNavigate } from "react-router-dom";

export default function CourseDetails() {
  const { id } = useParams(); // courseId
  const { backendUrl, userData } = useContext(AppContext);
  const apiEnroll = EnrollmentsAPI(backendUrl);
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // enrollment state
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [progressPct, setProgressPct] = useState(0);
  const [completed, setCompleted] = useState(() => new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError("");

        // 1) course
        const res = await axios.get(`${backendUrl}/api/courses/${id}`, {
          withCredentials: true,
        });
        const payload = res?.data?.data ?? res?.data;
        if (!payload) throw new Error("Course not found");
        if (!cancelled) setCourse(normalizeCourse(payload));

        // 2) my enrollment for this course (active/completed) → object or null
        const e = await apiEnroll.getMyEnrollmentByCourse(id);
        if (!cancelled && e) {
          setEnrolled(true);
          setEnrollmentId(e._id);
          setProgressPct(e.progress?.percentage || 0);
          setCompleted(
            new Set((e.progress?.completedLessonIds || []).map(String))
          );
        } else if (!cancelled) {
          setEnrolled(false);
          setEnrollmentId(null);
          setProgressPct(0);
          setCompleted(new Set());
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Course details error:", err);
          setError(
            err?.response?.data?.message ||
              err.message ||
              "Failed to load course"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, backendUrl]); // eslint-disable-line

  const role = userData?.role || "visitor";

  // flat lessons for viewer + progress
  const flatLessons = useMemo(() => {
    if (!course) return [];
    return (course.modules || []).flatMap((m) =>
      (m.lessons || []).map((l) => ({ ...l, moduleName: m.name }))
    );
  }, [course]);

  // first playable
  const firstPlayableId = useMemo(() => {
    if (!course) return undefined;
    const canViewFull = enrolled || role === "instructor" || role === "admin";
    if (canViewFull) return flatLessons[0]?.id;
    return flatLessons.find((l) => l.preview)?.id;
  }, [course, flatLessons, enrolled, role]);

  const [activeLessonId, setActiveLessonId] = useState();
  useEffect(() => {
    if (firstPlayableId) setActiveLessonId(firstPlayableId);
  }, [firstPlayableId]);
  const activeLesson = flatLessons.find((l) => l.id === activeLessonId);

  // Access: enrolled → all open; not enrolled → only preview open
  const canViewFull = enrolled || role === "instructor" || role === "admin";

  const markComplete = async () => {
    if (!activeLesson) return;
    if (!enrolled || !enrollmentId) {
      toast.info("Please enroll to track your progress.");
      return;
    }
    try {
      const progress = await apiEnroll.markLessonComplete(enrollmentId, {
        lessonId: activeLesson.id,
        timeSpent: 1, // optional
      });
      if (progress?.percentage != null)
        setProgressPct(Math.round(progress.percentage));
      setCompleted((prev) => new Set(prev).add(activeLesson.id.toString()));
      toast.success("Marked complete.");
    } catch (err) {
      console.error("Progress update error:", err);
      toast.error(err?.response?.data?.message || "Failed to update progress");
    }
  };

  const enrollNow = async () => {
    try {
      const e = await apiEnroll.enrollOpen(id); // returns enrollment object
      if (!e?._id) throw new Error("Enroll failed");
      toast.success("Enrolled successfully!");
      setEnrolled(true);
      setEnrollmentId(e._id);
      setProgressPct(e?.progress?.percentage || 0);
      setCompleted(
        new Set((e?.progress?.completedLessonIds || []).map(String))
      );
    } catch (err) {
      console.error("Enroll error:", err);
      toast.error(
        err?.response?.data?.message || err.message || "Failed to enroll"
      );
    }
  };

  // Paid: create checkout (Stripe primary, SSLCommerz fallback)
  const createOrderAndRedirect = async () => {
    try {
      // Try Stripe first
      const res = await axios.post(
        `${backendUrl}/api/payments/stripe/checkout`,
        { courseId: id },
        { withCredentials: true }
      );
      const url = res?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      throw new Error('Stripe checkout unavailable');
    } catch (err) {
      console.warn('Stripe failed, trying SSLCommerz...', err?.response?.data || err?.message);
      try {
        const sres = await axios.post(
          `${backendUrl}/api/payments/ssl/init`,
          { courseId: id },
          { withCredentials: true }
        );
        const url = sres?.data?.url;
        if (url) {
          window.location.href = url;
          return;
        }
        toast.error('Payment init failed');
      } catch (e2) {
        console.error('SSLCommerz init error:', e2);
        toast.error(
          e2?.response?.data?.message || e2?.message || 'Failed to start payment'
        );
      }
    }
  };

  const payWithStripe = async () => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/payments/stripe/checkout`,
        { courseId: id },
        { withCredentials: true }
      );
      const url = res?.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error('Stripe checkout unavailable');
    } catch (err) {
      console.error('Stripe checkout error:', err);
      toast.error(err?.response?.data?.message || 'Failed to start Stripe checkout');
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
      if (url) {
        window.location.href = url;
        return;
      }
      toast.error('SSLCommerz init failed');
    } catch (err) {
      console.error('SSLCommerz init error:', err);
      toast.error(err?.response?.data?.message || 'Failed to start SSLCommerz');
    }
  };


  if (loading)
    return (
      <PageShell>
        <Skeleton />
      </PageShell>
    );
  if (error)
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
            <div className="text-lg font-semibold">Couldn't load course</div>
            <div className="text-slate-400 mt-1 text-sm">{error}</div>
          </div>
        </div>
      </PageShell>
    );
  if (!course) return null;

  const priceBits = getPriceBits(course?.pricing);

  // ----- CTA state helpers -----
  const isPublished = course.status === "published";
  const isAssigned = course.enrollmentType === "assigned";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-fuchsia-400/30">
      <Decor />

      {/* Banner */}
      <div className="relative h-56 w-full overflow-hidden">
        {course.banner ? (
          <img
            src={course.banner}
            alt="banner"
            className="h-full w-full object-cover opacity-60"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(120deg,#111827,#0b1020)]" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,transparent,rgba(2,6,23,.88))]" />
      </div>

      {/* Header Card */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-14">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 sm:p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,.6)]">
          <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
            {/* Overview */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {course.title}
              </h1>
              <p className="mt-2 text-slate-300 max-w-2xl">
                {course.short || course.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                {course.category && <Badge>{course.category}</Badge>}
                {course.difficulty && <Badge>{course.difficulty}</Badge>}
                {course.language && <Badge>{course.language}</Badge>}
                {(course.tags || []).map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </div>

            {/* Enrollment Panel */}
            {/* Enrollment Panel */}
            <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-baseline justify-between">
                <div className="text-sm text-slate-400">Pricing</div>
                {priceBits.hasDiscount && (
                  <div className="text-xs text-emerald-300">
                    Save {priceBits.discountLabel}
                  </div>
                )}
              </div>
              <div className="mt-1 text-3xl font-extrabold">
                {priceBits.label}
              </div>

              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>
                  •{" "}
                  {course.visibility === "public"
                    ? "Public course"
                    : "Private course"}
                </li>
                <li>
                  • {isAssigned ? "Assigned enrollment" : "Open enrollment"}
                </li>
                <li>• Certificate on completion</li>
              </ul>

              <div className="mt-4 grid gap-2">
                {enrolled ? (
                  <button className="rounded-2xl px-4 py-2 border border-white/15 bg-emerald-500/15 text-emerald-200">
                    You’re Enrolled
                  </button>
                ) : !isPublished ? (
                  <button
                    disabled
                    className="rounded-2xl px-4 py-2 border border-white/15 bg-white/5 text-slate-400"
                  >
                    Coming soon (unpublished)
                  </button>
                ) : isAssigned ? (
                  <button
                    disabled
                    className="rounded-2xl px-4 py-2 border border-white/15 bg-white/5 text-slate-400"
                  >
                    Assigned by company
                  </button>
                ) : (
                  priceBits.label === "Free" ? (
                    <button
                      onClick={enrollNow}
                      className="rounded-2xl px-4 py-2 text-white border border-white/15"
                      style={{
                        background: "linear-gradient(90deg,#f0abfc33,#22d3ee33)",
                      }}
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/checkout/${id}`)}
                      className="rounded-2xl px-4 py-2 text-white border border-white/15"
                      style={{
                        background: "linear-gradient(90deg,#f0abfc33,#22d3ee33)",
                      }}
                    >
                      Enroll Now
                    </button>
                  )
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 grid gap-8 lg:grid-cols-[1fr,380px]">
        {/* Left: Viewer + Tools */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <ContentViewer
              lesson={activeLesson}
              locked={!canViewFull && !activeLesson?.preview}
            />
            <div className="px-5 pb-5 pt-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">Progress</span>
                <span className="text-slate-400">{progressPct}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-sky-400"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={markComplete}
                  disabled={
                    !activeLesson || (!canViewFull && !activeLesson?.preview)
                  }
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white disabled:opacity-40"
                  style={{
                    background: "linear-gradient(90deg,#a78bfa33,#22d3ee33)",
                  }}
                >
                  Mark as Complete
                </button>
                <button
                  onClick={() => {
                    const i = flatLessons.findIndex(
                      (l) => l.id === activeLessonId
                    );
                    if (i > 0) setActiveLessonId(flatLessons[i - 1].id);
                  }}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const i = flatLessons.findIndex(
                      (l) => l.id === activeLessonId
                    );
                    if (i < flatLessons.length - 1)
                      setActiveLessonId(flatLessons[i + 1].id);
                  }}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          <CourseTabs enrolled={enrolled} progressPct={progressPct} />
        </div>

        {/* Right: Curriculum */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-lg font-semibold">Curriculum</div>
            <div className="mt-3 grid gap-3">
              {(course.modules || []).map((m, idx) => (
                <ModuleAccordion
                  key={m.id || m._id || idx}
                  module={m}
                  index={idx + 1}
                  canViewFull={canViewFull}
                  activeLessonId={activeLessonId}
                  setActiveLessonId={setActiveLessonId}
                  completed={completed}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ---------------- Helpers & small UI bits ---------------- */
function normalizeCourse(raw) {
  const pricing = raw.pricing || { plan: "free", price: 0, discount: 0 };
  const modules = Array.isArray(raw.modules) ? raw.modules : [];

  const shapedModules = modules.map((m, mi) => ({
    id: m.id || m._id || `m${mi + 1}`,
    name: m.name || m.title || `Module ${mi + 1}`,
    lessons: (m.lessons || []).map((l, li) => ({
      id: l.id || l._id || `m${mi + 1}l${li + 1}`,
      title: l.title || `Lesson ${li + 1}`,
      type: l.type || "Video",
      duration: l.duration || "—",
      link: l.link || l.fileUrl || "",
      preview: Boolean(l.preview),
    })),
  }));

  return {
    id: raw._id || raw.id,
    title: raw.title || "",
    short: raw.short || raw.subtitle || "",
    description: raw.description || "",
    banner: raw.banner || raw.thumbnail || "",
    category: raw.category || "",
    tags: raw.tags || [],
    rating: raw.rating?.average ?? raw.rating ?? 0,
    ratingsCount: raw.rating?.count ?? 0,
    audience: raw.audience || "general",
    visibility:
      raw.visibility || (raw.status === "published" ? "public" : "public"),
    enrollmentType: raw.enrollmentType || "open",
    status: raw.status || "draft", // ✅ IMPORTANT: keep status for CTA logic
    pricing,
    modules: shapedModules,
  };
}

function getPriceBits(pricing) {
  const plan = pricing?.plan || "free";
  const price = Number(pricing?.price || 0);
  const discount = Number(pricing?.discount || 0);
  const isFree = plan === "free" || price === 0;
  const isPercent = discount > 0 && discount <= 100;
  const final = isFree
    ? 0
    : isPercent
    ? Math.max(0, price - (price * discount) / 100)
    : Math.max(0, price - discount);
  const hasDiscount = !isFree && discount > 0 && final !== price;
  return {
    label: isFree
      ? "Free"
      : hasDiscount
      ? `$${final.toFixed(2)}`
      : `$${price.toFixed(2)}`,
    hasDiscount,
    discountLabel: isPercent ? `${discount}%` : `$${discount}`,
  };
}

function Badge({ children }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
      {children}
    </span>
  );
}

function ContentViewer({ lesson, locked }) {
  if (!lesson)
    return (
      <div className="aspect-video grid place-items-center text-slate-400">
        No lesson selected
      </div>
    );
  if (locked) {
    return (
      <div className="aspect-video grid place-items-center text-center p-6">
        <div className="text-4xl mb-2">🔒</div>
        <div className="text-slate-200 font-semibold">
          This lesson is locked
        </div>
        <div className="text-slate-400 text-sm mt-1">
          Enroll to unlock all lessons.
        </div>
      </div>
    );
  }
  const t = (lesson.type || "").toLowerCase();
  if (t === "video") {
    return (
      <div className="aspect-video bg-black/50">
        <video className="w-full h-full" controls src={lesson.link} />
      </div>
    );
  }
  if (t === "pdf") {
    return (
      <div className="aspect-video bg-slate-900">
        <iframe title="PDF" src={lesson.link} className="w-full h-full" />
      </div>
    );
  }
  if (t === "quiz") {
    return (
      <div className="aspect-video grid place-items-center text-slate-300">
        Quiz
      </div>
    );
  }
  if (t === "assignment") {
    return (
      <div className="aspect-video grid place-items-center text-slate-300">
        Assignment
      </div>
    );
  }
  return (
    <div className="aspect-video grid place-items-center text-slate-300">
      Unsupported
    </div>
  );
}

function ModuleAccordion({
  module,
  index,
  canViewFull,
  activeLessonId,
  setActiveLessonId,
  completed,
}) {
  const [open, setOpen] = useState(index === 1);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full px-4 py-3 text-left font-medium flex items-center justify-between"
      >
        <span>
          {index}. {module.name}
        </span>
        <span className="text-slate-400">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-white/10">
          {(module.lessons || []).map((l, i) => {
            const locked = !canViewFull && !l.preview; // only preview open if not enrolled
            const isActive = activeLessonId === l.id;
            const isDone = completed.has(l.id?.toString());
            return (
              <button
                key={l.id}
                onClick={() => !locked && setActiveLessonId(l.id)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/5 ${
                  isActive ? "bg-white/5" : ""
                }`}
              >
                <span className="text-xs w-5 h-5 grid place-items-center rounded border border-white/15 bg-white/5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="text-sm">
                    {l.title}{" "}
                    {isDone && <span className="text-emerald-300">· Done</span>}
                  </div>
                  <div className="text-xs text-slate-400">
                    {l.type} · {l.duration}
                    {locked && " · Locked"}{" "}
                    {!locked && l.preview && " · Preview"}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CourseTabs({ enrolled, progressPct }) {
  const [tab, setTab] = useState("discussion");
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5">
      <div className="flex gap-2 p-2">
        {["discussion", "notes", "certificate"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-3 py-2 text-sm border ${
              tab === t
                ? "bg-white/10 border-white/20"
                : "bg-white/5 border-white/10 text-slate-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <div className="border-t border-white/10 p-5 text-sm text-slate-300">
        {tab === "discussion" && (
          <div className="space-y-3">
            <div className="font-semibold">Discussion / Q&A</div>
            <p>Ask questions, share ideas, and get feedback.</p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <input
                placeholder="Write your question…"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>
        )}
        {tab === "notes" && (
          <div className="space-y-3">
            <div className="font-semibold">My Notes</div>
            <textarea
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 outline-none"
              placeholder="Jot down your notes here…"
            />
          </div>
        )}
        {tab === "certificate" && (
          <div className="space-y-2">
            <div className="font-semibold">Certificate</div>
            {enrolled && progressPct === 100 ? (
              <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm">
                Download Certificate
              </button>
            ) : (
              <div className="text-slate-400">
                Complete the course to unlock your certificate.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>
  );
}
function Skeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="h-56 w-full rounded-3xl bg-white/5 animate-pulse" />
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 animate-pulse">
        <div className="h-8 w-2/3 bg-white/10 rounded" />
        <div className="mt-3 h-4 w-1/2 bg-white/10 rounded" />
      </div>
    </div>
  );
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

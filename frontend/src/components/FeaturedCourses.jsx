// src/components/FeaturedCourses.jsx
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { EnrollmentsAPI } from "../api/enrollments";

// ✅ keep categories aligned with backend validator
const TABS = [
  { key: "", label: "All" },
  { key: "Web Development", label: "Web Dev" },
  { key: "AI/ML", label: "AI/ML" },
  { key: "Data Science", label: "Data" },
  { key: "UI/UX", label: "UI/UX" },
];

const LIMIT = 4; // show 4 cards

export default function FeaturedCourses() {
  const { backendUrl, userData } = useContext(AppContext);
  const api = useMemo(() => EnrollmentsAPI(backendUrl), [backendUrl]);

  const [enrolledCourseIds, setEnrolledCourseIds] = useState(() => new Set());
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const inflight = useRef(false);

  // 🔄 Load my enrollments (active + completed) to mark cards as "Continue"
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!userData?._id) {
          if (alive) setEnrolledCourseIds(new Set());
          return;
        }
        const mine = await api.myEnrollments({
          status: "active,completed",
          page: 1,
          limit: 100,
        });
        const ids = new Set(
          (mine || []).map((e) => String(e?.course?._id || e?.course?.id))
        );
        if (alive) setEnrolledCourseIds(ids);
      } catch {
        if (alive) setEnrolledCourseIds(new Set());
      }
    })();
    return () => {
      alive = false;
    };
  }, [api, userData?._id]);

  // build /courses link preserving filters
  const catalogHref = useMemo(() => {
    const qp = new URLSearchParams();
    if (query.trim()) qp.set("search", query.trim());
    if (activeCat) qp.set("category", activeCat);
    return qp.toString() ? `/courses?${qp.toString()}` : "/courses";
  }, [query, activeCat]);

  useEffect(() => {
    const fetchFeatured = async () => {
      if (inflight.current) return;
      inflight.current = true;
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", String(LIMIT));
      // params.set("status", "published");
      if (activeCat) params.set("category", activeCat);
      params.set("sort", "-createdAt");

      try {
        const { data } = await axios.get(
          `${backendUrl}/api/courses?${params.toString()}`
        );
        setCourses(Array.isArray(data?.data) ? data.data : []);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
        inflight.current = false;
      }
    };

    fetchFeatured();
  }, [backendUrl, activeCat]);

  // show first 4 (API already sorted newest first)
  const shown = useMemo(() => courses.slice(0, LIMIT), [courses]);

  const onSearch = (e) => {
    e.preventDefault();
    navigate(catalogHref);
  };

  return (
    <section className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-2">
      {/* Search + Tabs + Header */}
      <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur p-4 sm:p-5 shadow-[0_40px_120px_-30px_rgba(0,0,0,.55)]">
        <form
          onSubmit={onSearch}
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses…"
              className="w-full px-4 py-3 rounded-2xl bg-white/5 ring-1 ring-white/10 outline-none text-slate-100 placeholder:text-slate-400 focus:ring-fuchsia-400/40"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-xl px-3 py-1.5 text-sm border border-white/15 bg-white/5"
            >
              Search
            </button>
          </div>

          {/* ⬇️ Mobile-first scrollable tabs */}
          <div
            className="
              flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1
              w-full sm:w-auto
              overflow-x-auto flex-nowrap scroll-smooth
              [-webkit-overflow-scrolling:touch]
            "
          >
            {TABS.map((t) => {
              const active = t.key === activeCat;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setActiveCat(t.key)}
                  className={`shrink-0 px-3 sm:px-4 py-2 text-sm rounded-xl transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Featured Courses
          </h2>
          <Link
            to={catalogHref}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            See more →
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {loading ? (
          Array.from({ length: LIMIT }).map((_, i) => <SkeletonCard key={i} />)
        ) : shown.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-12">
            No featured courses right now.
            <div className="mt-3">
              <Link
                to="/courses"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Browse all courses →
              </Link>
            </div>
          </div>
        ) : (
          shown.map((c) => (
            <FeaturedCard
              key={c._id || c.id}
              course={c}
              enrolledCourseIds={enrolledCourseIds}
            />
          ))
        )}
      </div>

      {!loading && shown.length > 0 && (
        <div className="mt-6 text-center">
          <Link
            to={catalogHref}
            className="inline-block rounded-2xl px-5 py-2 text-white border border-white/15 hover:bg-white/10"
          >
            See more courses →
          </Link>
        </div>
      )}
    </section>
  );
}

/* --------------------- Card --------------------- */
function FeaturedCard({ course, enrolledCourseIds }) {
  const {
    _id,
    id,
    title = "Untitled course",
    description = "",
    category = "General",
    enrollmentCount = 0,
    pricing = {},
    thumbnail = "",
    rating,
    ratingsCount,
  } = course || {};

  const courseId = _id || id;
  const enrolled = enrolledCourseIds?.has(String(courseId));

  // ✅ Robust rating: supports number or { average, count }
  const rawRating = rating;
  const ratingVal = Math.max(
    0,
    Math.min(
      5,
      typeof rawRating === "number"
        ? rawRating
        : rawRating && typeof rawRating === "object"
        ? Number(rawRating.average ?? 0)
        : 0
    )
  );
  const ratingCount =
    typeof ratingsCount === "number"
      ? ratingsCount
      : rawRating && typeof rawRating === "object" && typeof rawRating.count === "number"
      ? rawRating.count
      : 0;

  const topRated = ratingVal >= 4.7;
  const trending = !topRated && Number(enrollmentCount) >= 100;

  const price = Number(pricing?.price || 0);
  const discount = Number(pricing?.discount || 0);
  const isFree = pricing?.plan === "free" || price === 0;
  const isPercent = discount > 0 && discount <= 100;
  const final = isFree
    ? 0
    : isPercent
    ? Math.max(0, price - (price * discount) / 100)
    : Math.max(0, price - discount);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,.9),rgba(10,14,25,.95))] p-4 sm:p-5">
      <div className="flex gap-4">
        {/* Thumb */}
        <div className="relative shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl grid place-items-center bg-gradient-to-br from-fuchsia-500/25 to-sky-500/25 ring-1 ring-white/10 overflow-hidden">
          {thumbnail ? (
            <img src={thumbnail} alt="" className="h-full w-full object-cover opacity-90" />
          ) : (
            <span className="text-xl font-semibold">{abbr(category)}</span>
          )}
          {(topRated || trending) && (
            <span className="absolute -top-2 -left-2 text-[10px] sm:text-xs rounded-xl px-2 py-1 bg-gradient-to-r from-fuchsia-500/30 to-sky-500/30 border border-white/15 backdrop-blur">
              {topRated ? "Top Rated" : "Trending"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <Link to={`/course/${courseId}`} className="block">
            <h3 className="text-lg sm:text-2xl font-extrabold leading-snug line-clamp-2">
              {title}
            </h3>
          </Link>
          <div className="mt-1 text-slate-300 line-clamp-1">{description}</div>

          {/* ⬇️ wrap allowed so ছোট স্ক্রিনে ভাঙবে না */}
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5">
              {category}
            </span>
            <Stars value={ratingVal} count={ratingCount} />
            <span className="text-slate-400">{formatK(enrollmentCount)} students</span>
          </div>

          {/* ⬇️ wrap + gap so button নিচে নামতে পারে */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm">
              {isFree ? (
                <span className="text-emerald-300 font-semibold">Free</span>
              ) : discount ? (
                <>
                  <span className="text-slate-400 line-through mr-2">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-emerald-300 font-semibold">
                    ${final.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-emerald-300 font-semibold">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>

            <Link
              to={`/course/${courseId}`}
              className={`rounded-2xl px-4 py-2 text-sm border border-white/15 ${
                enrolled ? "bg-emerald-500/15 text-emerald-200" : "text-white hover:bg-white/10"
              }`}
            >
              view course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------------------- UI bits --------------------- */
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 animate-pulse">
      <div className="h-20 w-20 rounded-2xl bg-white/10" />
      <div className="mt-3 h-6 w-2/3 bg-white/10 rounded" />
      <div className="mt-2 h-4 w-1/2 bg-white/10 rounded" />
      <div className="mt-4 h-4 w-1/3 bg-white/10 rounded" />
    </div>
  );
}

function Stars({ value = 0, count = 0 }) {
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-0.5 text-amber-300">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden>
          {i < full ? "★" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-slate-300 text-xs">
        {value ? `${value.toFixed(1)}${count ? ` (${Intl.NumberFormat().format(count)})` : ""}` : "New"}
      </span>
    </div>
  );
}
function abbr(cat) {
  if (!cat) return "Web";
  const parts = cat.split(" ");
  if (parts.length === 1) return parts[0].slice(0, 3);
  return (parts[0][0] || "") + (parts[1][0] || "");
}
function formatK(n) {
  n = Number(n || 0);
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
}

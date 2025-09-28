import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";

const CourseCatalog = () => {
  const { backendUrl } = useContext(AppContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    difficulty: "",
    plan: "",
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) queryParams.append(k, v);
      });

      const { data } = await axios.get(
        `${backendUrl}/api/courses?${queryParams.toString()}`
      );

      if (data?.success) {
        setCourses(data.data || []);
        setPagination(data.pagination || {});
      } else {
        setCourses([]);
        setPagination({});
      }
    } catch (err) {
      console.error("Fetch courses error:", err);
      toast.error("Failed to fetch courses");
      setCourses([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const clearFilters = () =>
    setFilters({ search: "", category: "", difficulty: "", plan: "", page: 1, limit: 12 });

  const categories = [
    "Web Development",
    "AI/ML",
    "Data Science",
    "UI/UX",
    "Mobile Development",
    "DevOps",
    "Cybersecurity",
    "Database",
    "Other",
  ];
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* background ornaments */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(168,85,247,0.10),rgba(14,165,233,0.10)_40%,transparent_70%)]" />
      <div className="pointer-events-none fixed -top-32 -left-28 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed -bottom-40 -right-28 w-[28rem] h-[28rem] bg-sky-500/20 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 max-[350px]:px-3 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl max-[350px]:text-2xl font-extrabold tracking-tight">
            Explore Courses
          </h1>
          <p className="mt-2 text-slate-300 max-[350px]:text-sm">
            Discover and enroll in top-rated courses to level up your skills.
          </p>
        </div>

        {/* Search + quick filters */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 sm:p-6 max-[350px]:p-4 shadow-[0_40px_120px_-30px_rgba(0,0,0,.55)] mb-6">
          <div className="grid gap-4 md:grid-cols-[1fr,auto] md:items-center">
            {/* Search */}
            <div className="relative group">
              <input
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Search courses, skills, instructors…"
                className="w-full px-4 py-3 max-[350px]:py-2 max-[350px]:text-sm rounded-2xl bg-white/5 ring-1 ring-white/10 outline-none text-slate-100 placeholder:text-slate-400 focus:ring-fuchsia-400/40"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 max-[350px]:hidden">
                ⌘K
              </div>
            </div>

            {/* Clear */}
            <button
              onClick={clearFilters}
              className="justify-self-start md:justify-self-end rounded-2xl border border-white/15 bg-white/5 px-4 py-2 max-[350px]:px-3 max-[350px]:py-1.5 max-[350px]:text-xs text-sm hover:bg-white/10"
            >
              Clear Filters
            </button>
          </div>

          {/* Category chips (scrollable) */}
          <div className="mt-4 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 max-[350px]:gap-1 min-w-max">
              <Chip
                active={!filters.category}
                onClick={() => handleFilterChange("category", "")}
              >
                All
              </Chip>
              {categories.map((c) => (
                <Chip
                  key={c}
                  active={filters.category === c}
                  onClick={() => handleFilterChange("category", c)}
                >
                  {c}
                </Chip>
              ))}
            </div>
          </div>

          {/* Segmented: Difficulty & Plan */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Segmented
              label="Difficulty"
              options={["", ...difficulties]}
              value={filters.difficulty}
              onChange={(v) => handleFilterChange("difficulty", v)}
            />
            <Segmented
              label="Pricing"
              options={["", "Free", "Paid"]}
              value={filters.plan}
              onChange={(v) => handleFilterChange("plan", v.toLowerCase())}
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm max-[350px]:text-xs text-slate-400">
          Showing {loading ? 0 : courses.length} of {pagination.total || 0} courses
        </div>

        {/* Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : courses.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="text-sm max-[350px]:text-xs text-slate-400">
                  Page {pagination.current} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current <= 1}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 max-[350px]:px-3 max-[350px]:py-1.5 max-[350px]:text-xs text-sm disabled:opacity-40"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current >= pagination.pages}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 max-[350px]:px-3 max-[350px]:py-1.5 max-[350px]:text-xs text-sm disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;

/* ---------------- UI Bits ---------------- */

function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 max-[350px]:px-2 max-[350px]:py-1 max-[350px]:text-xs rounded-full border transition-all " +
        (active
          ? "bg-fuchsia-500 text-white border-fuchsia-400 shadow-md shadow-fuchsia-500/30"
          : "bg-white/5 text-slate-200 border-white/10 hover:border-fuchsia-400/40")
      }
    >
      {children}
    </button>
  );
}

function Segmented({ label, options, value, onChange }) {
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>

      {/* ≤350px এ horizontal scroll */}
      <div className="max-[350px]:overflow-x-auto max-[350px]:no-scrollbar">
        <div className="inline-flex min-w-max overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          {options.map((opt, idx) => {
            const val = opt || "All";
            const active = (opt || "") === (value || "");
            return (
              <button
                key={val + idx}
                onClick={() => onChange(opt || "")}
                className={
                  "px-3 sm:px-4 max-[350px]:px-2 py-2 max-[350px]:py-1.5 text-sm max-[350px]:text-xs border-r border-white/10 last:border-r-0 " +
                  (active ? "bg-white/10" : "hover:bg-white/10 text-slate-300")
                }
              >
                {val}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course }) {
  const {
    title,
    description,
    category,
    difficulty,
    thumbnail,
    modules = [],
    totalDuration = "",
    enrollmentCount = 0,
    pricing = {},
    visibility,
    rating,
  } = course || {};

  const price = Number(pricing?.price || 0);
  const discount = Number(pricing?.discount || 0); // percent expected
  const isFree = pricing?.plan === "free" || price === 0;
  const hasDiscount = !isFree && discount > 0;
  const finalPrice = isFree ? 0 : Math.max(0, price - (price * discount) / 100);

  return (
    <div
      className="group relative rounded-3xl border border-white/10 bg-white/5 overflow-hidden transform-gpu transition
                 hover:-translate-y-1 hover:shadow-[0_30px_120px_-30px_rgba(0,0,0,.8)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] bg-slate-800">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full grid place-items-center text-slate-400">No thumbnail</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
        {/* top-left badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/10 backdrop-blur px-2 py-1 text-xs border border-white/15">
            {category || "General"}
          </span>
          {visibility === "private" && (
            <span className="rounded-full bg-white/10 backdrop-blur px-2 py-1 text-xs border border-white/15">
              🔒 Private
            </span>
          )}
        </div>
        {/* top-right badges */}
        <div className="absolute right-3 top-3 flex gap-2">
          {difficulty && (
            <span className="rounded-full bg-white/10 backdrop-blur px-2 py-1 text-xs border border-white/15">
              {difficulty}
            </span>
          )}
          {typeof rating === "number" && rating > 0 && (
            <span className="rounded-full bg-white/10 backdrop-blur px-2 py-1 text-xs border border-white/15">
              ⭐ {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 max-[350px]:p-4">
        <h3 className="text-lg max-[350px]:text-base font-semibold line-clamp-2 min-w-0 break-words">
          {title}
        </h3>
        <p className="mt-1 text-sm max-[350px]:text-xs text-slate-300 line-clamp-3">
          {description}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs max-[350px]:text-[11px] text-slate-400">
          <span>{modules?.length || 0} modules</span>
          <span>{totalDuration || "—"}</span>
          <span>{new Intl.NumberFormat().format(enrollmentCount)} students</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          {/* Price */}
          <div className="flex items-center gap-2">
            {isFree ? (
              <span className="text-emerald-300 font-bold">Free</span>
            ) : (
              <>
                {hasDiscount && (
                  <span className="text-sm max-[350px]:text-xs text-slate-400 line-through">
                    ${price.toFixed(2)}
                  </span>
                )}
                <span className="text-emerald-300 font-bold">
                  ${finalPrice.toFixed(2)}
                </span>
              </>
            )}
          </div>

          <Link
            to={`/course/${course._id}`}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 max-[350px]:px-2.5 max-[350px]:py-1.5 text-sm max-[350px]:text-xs text-white hover:bg-white/10"
          >
            View Course
          </Link>
        </div>
      </div>

      {/* bottom gradient border on hover */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px opacity-0 group-hover:opacity-100 transition-opacity
                      bg-[linear-gradient(90deg,rgba(240,171,252,.6),rgba(34,211,238,.6))]" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden animate-pulse"
        >
          <div className="aspect-[16/9] bg-white/10" />
          <div className="p-5 max-[350px]:p-4 space-y-3">
            <div className="h-5 bg-white/10 rounded w-3/4" />
            <div className="h-4 bg-white/10 rounded w-full" />
            <div className="h-4 bg-white/10 rounded w-5/6" />
            <div className="mt-4 h-4 bg-white/10 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-white/10 grid place-items-center border border-white/10">
        <svg width="22" height="22" viewBox="0 0 24 24" className="text-slate-300">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="text-sm font-semibold">No courses found</h3>
      <p className="mt-1 text-sm text-slate-400">
        Try adjusting your search or filters and try again.
      </p>
    </div>
  );
}

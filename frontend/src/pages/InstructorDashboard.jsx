// src/pages/InstructorDashboard.jsx
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Link } from "react-router-dom";

const InstructorDashboard = () => {
  const { backendUrl, userData } = useContext(AppContext);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    totalEnrollments: 0,
  });

  const isInstructor = useMemo(
    () => userData?.role === "instructor" || userData?.role === "admin",
    [userData?.role]
  );

  const inFlight = useRef(false);

  const fetchCourses = useCallback(async () => {
    if (!isInstructor || inFlight.current) return;
    inFlight.current = true;
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/courses/instructor/my-courses`,
        { withCredentials: true }
      );
      if (data?.success) {
        setCourses(Array.isArray(data.data) ? data.data : []);
      } else {
        setCourses([]);
        toast.error(data?.message || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Fetch courses error:", error);
      toast.error("Failed to fetch courses");
      setCourses([]);
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  }, [backendUrl, isInstructor]);

  useEffect(() => {
    if (isInstructor) fetchCourses();
  }, [isInstructor, backendUrl, fetchCourses]);

  useEffect(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === "published")
      .length;
    const draftCourses = courses.filter((c) => c.status === "draft").length;
    const totalEnrollments = courses.reduce(
      (sum, c) => sum + (c.enrollmentCount || 0),
      0
    );
    setStats({ totalCourses, publishedCourses, draftCourses, totalEnrollments });
  }, [courses]);

  const deleteCourse = async (courseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    )
      return;
    try {
      await axios.delete(`${backendUrl}/api/courses/${courseId}`, {
        withCredentials: true,
      });
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      console.error("Delete course error:", error);
      toast.error("Failed to delete course");
    }
  };

  const publishCourse = async (courseId) => {
    try {
      await axios.post(
        `${backendUrl}/api/courses/${courseId}/publish`,
        {},
        { withCredentials: true }
      );
      toast.success("Course published successfully");
      fetchCourses();
    } catch (error) {
      console.error("Publish course error:", error);
      toast.error("Failed to publish course");
    }
  };

  const saveAsDraft = async (courseId) => {
    try {
      await axios.post(
        `${backendUrl}/api/courses/${courseId}/draft`,
        {},
        { withCredentials: true }
      );
      toast.success("Course saved as draft");
      fetchCourses();
    } catch (error) {
      console.error("Save draft error:", error);
      toast.error("Failed to save as draft");
    }
  };

  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 grid place-items-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center max-w-md">
          <div className="text-2xl font-bold">Access Denied</div>
          <p className="mt-2 text-slate-400">
            Only instructors can access this dashboard.
          </p>
          <div className="mt-4 h-px bg-white/10" />
          <div className="mt-4 text-sm text-slate-400">
            Please sign in with an instructor account.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-slate-950/60 border-b border-white/10">
        <div
          className="
            mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8
            flex items-center justify-between gap-2
            max-[450px]:h-auto max-[450px]:py-2 max-[450px]:flex-wrap
          "
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-400 to-sky-400" />
            <div className="font-semibold max-[450px]:text-sm">
              Instructor Dashboard
            </div>
          </div>

          <div className="flex items-center gap-2 max-[450px]:w-full max-[450px]:justify-end">
            <button
              onClick={fetchCourses}
              className="
                rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm
                max-[450px]:px-2.5 max-[450px]:py-1.5 max-[450px]:text-xs
              "
              title="Refresh"
              disabled={loading}
            >
              Refresh
            </button>
            <Link
              to="/create-course"
              className="
                rounded-xl border border-white/15 px-4 py-2 text-white
                max-[450px]:px-3 max-[450px]:py-1.5 max-[450px]:text-xs whitespace-nowrap
              "
              style={{
                background: "linear-gradient(90deg,#a78bfa33,#22d3ee33)",
              }}
            >
              Create<span className="max-[450px]:hidden"> New Course</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 max-[450px]:px-3 max-[450px]:py-6">
        <div className="mb-6">
          <p className="text-slate-300 max-[450px]:text-sm">
            Manage your courses and track your teaching progress.
          </p>
        </div>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Courses" value={stats.totalCourses} />
          <StatCard
            label="Published"
            value={stats.publishedCourses}
            accent="emerald"
          />
          <StatCard label="Drafts" value={stats.draftCourses} accent="yellow" />
          <StatCard
            label="Total Enrollments"
            value={stats.totalEnrollments}
            accent="violet"
          />
        </section>

        {/* Courses */}
        <section className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 max-[450px]:px-4">
            <div className="text-lg font-semibold max-[450px]:text-base">
              My Courses
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-300">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
              <p className="text-sm text-slate-400 mt-2">Loading courses…</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full border border-dashed border-white/15 grid place-items-center text-slate-400">
                📚
              </div>
              <div className="mt-3 text-sm text-slate-300">No courses yet</div>
              <p className="text-slate-400 text-sm">
                Get started by creating your first course.
              </p>
              <div className="mt-4">
                <Link
                  to="/create-course"
                  className="rounded-xl border border-white/15 px-4 py-2 text-white"
                  style={{
                    background: "linear-gradient(90deg,#f0abfc33,#22d3ee33)",
                  }}
                >
                  Create Course
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {courses.map((course) => (
                <div key={course._id} className="p-5 max-[450px]:p-4">
                  <div className="flex items-start justify-between gap-4 max-[450px]:flex-col">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold max-[450px]:text-base truncate">
                          {course.title}
                        </h3>
                        <span
                          className={
                            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs " +
                            (course.status === "published"
                              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                              : "border-yellow-400/30 bg-yellow-500/10 text-yellow-200")
                          }
                        >
                          {course.status}
                        </span>
                      </div>

                      {course.description && (
                        <p className="mt-1 text-sm max-[450px]:text-xs text-slate-300 line-clamp-2">
                          {course.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm max-[450px]:text-xs text-slate-400">
                        <span>{course.category}</span>
                        <span>•</span>
                        <span>{course.difficulty}</span>
                        <span>•</span>
                        <span>{course.modules?.length || 0} modules</span>
                        <span>•</span>
                        <span>{course.enrollmentCount || 0} enrollments</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 max-[450px]:gap-1.5 max-[450px]:justify-end">
                      {course.status === "draft" ? (
                        <button
                          onClick={() => publishCourse(course._id)}
                          className="
                            rounded-xl border border-white/15 px-3 py-1.5 text-sm text-white
                            max-[450px]:px-2.5 max-[450px]:py-1 max-[450px]:text-xs
                          "
                          style={{
                            background:
                              "linear-gradient(90deg,#22c55e33,#06b6d433)",
                          }}
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => saveAsDraft(course._id)}
                          className="
                            rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm
                            max-[450px]:px-2.5 max-[450px]:py-1 max-[450px]:text-xs
                          "
                        >
                          Save as Draft
                        </button>
                      )}

                      <Link
                        to={`/edit-course/${course._id}`}
                        className="
                          rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-sm
                          max-[450px]:px-2.5 max-[450px]:py-1 max-[450px]:text-xs
                        "
                      >
                        Edit
                      </Link>

                      <button
                        onClick={() => deleteCourse(course._id)}
                        className="
                          rounded-xl border border-white/15 bg-red-500/10 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/20
                          max-[450px]:px-2.5 max-[450px]:py-1 max-[450px]:text-xs
                        "
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default InstructorDashboard;

/* -------- small UI atoms -------- */
function StatCard({ label, value, accent }) {
  const ring =
    accent === "emerald"
      ? "from-emerald-400/30 to-sky-400/20"
      : accent === "yellow"
      ? "from-amber-400/30 to-pink-400/20"
      : accent === "violet"
      ? "from-fuchsia-400/30 to-sky-400/20"
      : "from-sky-400/30 to-fuchsia-400/20";
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div
        className={`h-8 w-8 rounded-xl bg-gradient-to-br ${ring} ring-1 ring-white/10`}
        aria-hidden
      />
      <div className="mt-3 text-sm text-slate-400">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

// src/pages/CreateCourse.jsx
import React, { useState, useContext, useMemo, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// steps
import BasicInfoStep from "../components/course/BasicInfoStep";
import ContentUploadStep from "../components/course/ContentUploadStep";
import PricingVisibilityStep from "../components/course/PricingVisibilityStep";
import AssignUsersStep from "../components/course/AssignUsersStep";
import ReviewPublishStep from "../components/course/ReviewPublishStep";

const CreateCourse = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState(null);

  // ensure cookies go with every request
  useEffect(() => {
    axios.defaults.withCredentials = true;
  }, []);

  const [courseData, setCourseData] = useState({
    title: "", description: "", category: "", tags: [],
    audience: "general", difficulty: "Beginner", language: "English",
    prerequisites: [], objectives: [], thumbnail: "",
    modules: [],
    visibility: "public",
    pricing: { plan: "free", price: 0, discount: 0 },
    enrollmentType: "open",
    assignedUsers: [],
    status: "draft",
  });

  const showAssignStep =
    userData?.role === "corporateAdmin" ||
    courseData.audience === "corporate" ||
    courseData.enrollmentType === "assigned";

  const lastStep = showAssignStep ? 5 : 4;

  const steps = [
    { number: 1, title: "Basic Info", desc: "Title, description, category" },
    { number: 2, title: "Content", desc: "Modules, lessons, materials" },
    { number: 3, title: "Pricing & Visibility", desc: "Public/Private, Free/Paid" },
    { number: 4, title: "Assign Users", desc: "Corporate employees (optional)" },
    { number: 5, title: "Review & Publish", desc: "Draft / Preview / Publish" },
  ];
  const visibleSteps = showAssignStep ? steps : steps.filter((s) => s.number !== 4);

  const canGoNext = useMemo(() => {
    if (currentStep === 1) return Boolean(courseData.title.trim()) && Boolean(courseData.category);
    if (currentStep === 2) return (courseData.modules || []).length > 0;
    if (currentStep === 3) {
      if (courseData.pricing.plan === "paid") return Number(courseData.pricing.price) > 0;
      return true;
    }
    return true;
  }, [currentStep, courseData]);

  const updateCourseData = (patch) => setCourseData((p) => ({ ...p, ...patch }));
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, lastStep));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));

  /* -------- API actions -------- */
  const createCourse = async () => {
    setLoading(true);
    try {
      const payload = {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        tags: courseData.tags,
        audience: courseData.audience,
        difficulty: courseData.difficulty,
        language: courseData.language,
        prerequisites: courseData.prerequisites,
        objectives: courseData.objectives,
        thumbnail: courseData.thumbnail,
      };
      const { data } = await axios.post(`${backendUrl}/api/courses`, payload, { withCredentials: true });
      if (!data?.success) throw new Error(data?.message || "Create failed");
      setCourseId(data.data._id);
      toast.success("Course created successfully!");
      return data.data._id;
    } catch (err) {
      console.error("Create course error:", err);
      toast.error(err.response?.data?.message || "Failed to create course");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveAsDraft = async () => {
    setLoading(true);
    try {
      const id = courseId || (await createCourse());
      const { data } = await axios.post(`${backendUrl}/api/courses/${id}/draft`, {}, { withCredentials: true });
      if (data?.success) {
        toast.success("Course saved as draft!");
        navigate("/instructor/dashboard");
      } else throw new Error("Draft failed");
    } catch (err) {
      console.error("Save draft error:", err);
      toast.error(err.response?.data?.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const publishCourse = async () => {
    setLoading(true);
    try {
      const id = courseId || (await createCourse());
      const { data } = await axios.post(`${backendUrl}/api/courses/${id}/publish`, {}, { withCredentials: true });
      if (data?.success) {
        toast.success("Course published successfully!");
        navigate("/instructor/dashboard");
      } else throw new Error("Publish failed");
    } catch (err) {
      console.error("Publish course error:", err);
      toast.error(err.response?.data?.message || "Failed to publish course");
    } finally {
      setLoading(false);
    }
  };

  /* -------- Access guard -------- */
  if (!['instructor','admin','corporateAdmin'].includes(userData?.role)) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400">Only instructors or corporate admins can create courses.</p>
        </div>
      </div>
    );
  }

  /* -------- render -------- */
  const renderStep = () => {
    if (currentStep === 1)
      return <BasicInfoStep data={courseData} updateData={updateCourseData} onNext={nextStep} loading={loading} />;

    if (currentStep === 2)
      return (
        <ContentUploadStep
          data={courseData}
          updateData={updateCourseData}
          onNext={nextStep}
          onPrev={prevStep}
          courseId={courseId}
          createCourse={createCourse} // child যদি courseId না পায়, এটা কল করে নিবে
          loading={loading}
        />
      );

    if (currentStep === 3)
      return (
        <PricingVisibilityStep
          data={courseData}
          updateData={updateCourseData}
          onNext={nextStep}
          onPrev={prevStep}
          courseId={courseId}
          loading={loading}
        />
      );

    if (showAssignStep && currentStep === 4)
      return (
        <AssignUsersStep
          data={courseData}
          updateData={updateCourseData}
          onNext={nextStep}
          onPrev={prevStep}
          courseId={courseId}
          loading={loading}
        />
      );

    return (
      <ReviewPublishStep
        data={courseData}
        courseId={courseId}
        onPrev={prevStep}
        onSaveDraft={saveAsDraft}
        onPublish={publishCourse}
        loading={loading}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Decor />
      <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/60 border-b border-white/10">
        <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-400 to-sky-400" />
            <div className="font-semibold">Create Course</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <Stepper steps={visibleSteps} currentStep={currentStep} />
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 shadow-[0_40px_120px_-30px_rgba(0,0,0,.55)]">
          {renderStep()}
        </div>
      </main>
    </div>
  );
};

export default CreateCourse;

/* ---- UI bits ---- */
function Stepper({ steps, currentStep }) {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {steps.map((s, i) => {
        const visualIndex = i + 1;
        const active = visualIndex === currentStep;
        const done = visualIndex < currentStep;
        return (
          <li key={s.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className={`grid h-7 w-7 place-items-center rounded-full text-sm font-semibold ${
              active ? "bg-gradient-to-br from-fuchsia-500/40 to-sky-500/40 text-white"
              : done ? "bg-emerald-500/30 text-white"
              : "bg-white/10 text-slate-300"}`}>
              {visualIndex}
            </span>
            <span className={active ? "text-white" : "text-slate-300"}>{s.title}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Decor() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(80%_60%_at_50%_-10%,rgba(168,85,247,0.10),rgba(14,165,233,0.10)_40%,transparent_70%)]" />
      <div className="pointer-events-none fixed -top-28 -left-28 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none fixed -bottom-32 -right-28 w-[28rem] h-[28rem] bg-sky-500/20 rounded-full blur-3xl -z-10" />
    </>
  );
}

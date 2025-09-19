/* src/pages/EditCourse.jsx */

import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

// Reuse the same steps you already have
import BasicInfoStep from "../components/course/BasicInfoStep";
import ContentUploadStep from "../components/course/ContentUploadStep";
import PricingVisibilityStep from "../components/course/PricingVisibilityStep";
import AssignUsersStep from "../components/course/AssignUsersStep";
import ReviewPublishStep from "../components/course/ReviewPublishStep";

const EditCourse = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const { id } = useParams();                  // /edit-course/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [courseId, setCourseId] = useState(null);

  // same shape as Create
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [],
    audience: "general",
    difficulty: "Beginner",
    language: "English",
    prerequisites: [],
    objectives: [],
    thumbnail: "",
    modules: [],
    visibility: "public",
    pricing: { plan: "free", price: 0, discount: 0 },
    enrollmentType: "open",
    assignedUsers: [],
    status: "draft",
  });

  // -------------- guards --------------
  const isInstructor = useMemo(
    () => ["instructor", "admin", "corporateAdmin"].includes(userData?.role),
    [userData?.role]
  );

  // -------------- fetch course --------------
  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        setFetching(true);
        const { data } = await axios.get(`${backendUrl}/api/courses/${id}`, {
          withCredentials: true,
        });
        if (!data?.success) throw new Error("Failed to load course");

        const c = data.data;
        if (!alive) return;

        setCourseId(c._id);
        setCourseData({
          title: c.title || "",
          description: c.description || "",
          category: c.category || "",
          tags: c.tags || [],
          audience: c.audience || "general",
          difficulty: c.difficulty || "Beginner",
          language: c.language || "English",
          prerequisites: c.prerequisites || [],
          objectives: c.objectives || [],
          thumbnail: c.thumbnail || "",

          modules: c.modules || [],

          visibility: c.visibility || "public",
          pricing: c.pricing || { plan: "free", price: 0, discount: 0 },
          enrollmentType: c.enrollmentType || "open",

          // edit স্ক্রিনে অ্যাসাইনড ইউজার লোড করতে চাইলে আলাদা API লাগবে;
          // এখানে খালি অ্যারে রাখছি—Assign স্টেপে নতুন করে assign করব।
          assignedUsers: [],

          status: c.status || "draft",
        });
      } catch (e) {
        console.error(e);
        toast.error(e?.response?.data?.message || "Failed to load course");
        navigate("/instructor/dashboard");
      } finally {
        if (alive) setFetching(false);
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [backendUrl, id, navigate]);

  // -------------- stepper helpers --------------
  const showAssignStep =
    courseData.audience === "corporate" || courseData.enrollmentType === "assigned" || userData?.role === "corporateAdmin";
  const lastStep = showAssignStep ? 5 : 4;
  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, lastStep));
  const prevStep = () => setCurrentStep((s) => Math.max(1, s - 1));
  const updateCourseData = (patch) => setCourseData((p) => ({ ...p, ...patch }));

  // -------------- API save helpers --------------
  const saveBasic = async (form) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${backendUrl}/api/courses/${courseId}`, form, {
        withCredentials: true,
      });
      if (!data?.success) throw new Error("Update failed");
      toast.success("Basic info updated");
      updateCourseData(form);
      nextStep();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const savePricingVisibility = async (payload) => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/courses/${courseId}/settings`,
        payload,
        { withCredentials: true }
      );
      if (!data?.success) throw new Error("Update failed");
      toast.success("Pricing & visibility updated");
      updateCourseData(payload);
      nextStep();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const assignUsers = async ({ assignedUsers }) => {
    try {
      setLoading(true);
      if ((assignedUsers || []).length === 0) {
        nextStep(); // কিছু না থাকলে সরাসরি রিভিউতে যাও
        return;
      }
      const employeeIds = assignedUsers.map((u) => u._id);
      const { data } = await axios.post(
        `${backendUrl}/api/enrollments/assign`,
        { courseId, employeeIds },
        { withCredentials: true }
      );
      if (!data?.success) throw new Error("Assign failed");
      toast.success(`Assigned ${data.data?.length || employeeIds.length} users`);
      updateCourseData({ assignedUsers });
      nextStep();
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to assign users");
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/courses/${courseId}/draft`,
        {},
        { withCredentials: true }
      );
      if (!data?.success) throw new Error("Draft failed");
      toast.success("Saved as draft");
      navigate("/instructor/dashboard");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  const publishCourse = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/courses/${courseId}/publish`,
        {},
        { withCredentials: true }
      );
      if (!data?.success) throw new Error("Publish failed");
      toast.success("Course published");
      navigate("/instructor/dashboard");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  // -------------- access --------------
  if (!isInstructor) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400">Only instructors/corporate-admins can edit courses.</p>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-100">
        <div className="text-slate-300">Loading course…</div>
      </div>
    );
  }

  // -------------- render body --------------
  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Content" },
    { number: 3, title: "Pricing & Visibility" },
    { number: 4, title: "Assign Users" },
    { number: 5, title: "Review & Publish" },
  ];
  const visibleSteps = showAssignStep ? steps : steps.filter((s) => s.number !== 4);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header title="Edit Course" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <Stepper steps={visibleSteps} currentStep={currentStep} />

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
          {currentStep === 1 && (
            <BasicInfoStep
              data={courseData}
              updateData={updateCourseData}
              onNext={saveBasic}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <ContentUploadStep
              data={courseData}
              updateData={updateCourseData}
              onNext={() => nextStep()}       // add/delete already saved via API inside the step
              onPrev={prevStep}
              courseId={courseId}
              createCourse={() => courseId}   // not used in edit; just satisfy prop
              loading={loading}
            />
          )}

          {currentStep === 3 && (
            <PricingVisibilityStep
              data={courseData}
              updateData={updateCourseData}
              onNext={savePricingVisibility}
              onPrev={prevStep}
              courseId={courseId}
              loading={loading}
            />
          )}

          {showAssignStep && currentStep === 4 && (
            <AssignUsersStep
              data={courseData}
              updateData={updateCourseData}
              onNext={assignUsers}
              onPrev={prevStep}
              courseId={courseId}
              loading={loading}
            />
          )}

          {(!showAssignStep && currentStep === 4) ||
          (showAssignStep && currentStep === 5) ? (
            <ReviewPublishStep
              data={courseData}
              courseId={courseId}
              onPrev={prevStep}
              onSaveDraft={saveDraft}
              onPublish={publishCourse}
              loading={loading}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default EditCourse;

/* ---------------- small UI bits ---------------- */
function Header({ title }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-slate-950/60 border-b border-white/10">
      <div className="mx-auto max-w-7xl h-14 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-fuchsia-400 to-sky-400" />
          <div className="font-semibold">{title}</div>
        </div>
      </div>
    </header>
  );
}

function Stepper({ steps, currentStep }) {
  return (
    <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {steps.map((s, i) => {
        const visual = i + 1;
        const active = visual === currentStep;
        const done = visual < currentStep;
        return (
          <li key={s.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className={"grid h-7 w-7 place-items-center rounded-full text-sm font-semibold " + (active ? "bg-gradient-to-br from-fuchsia-500/40 to-sky-500/40 text-white" : done ? "bg-emerald-500/30 text-white" : "bg-white/10 text-slate-300")}>
              {visual}
            </span>
            <span className={active ? "text-white" : "text-slate-300"}>{s.title}</span>
          </li>
        );
      })}
    </ol>
  );
}

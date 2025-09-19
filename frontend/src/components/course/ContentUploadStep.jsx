//src/components/course/ContentUploadStep.jsx
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const ContentUploadStep = ({
  data,
  updateData,
  onNext,
  onPrev,
  courseId,
  createCourse,
  loading,
}) => {
  const { backendUrl } = useContext(AppContext);

  // -------- helpers --------
  const cleanPayload = (obj) => {
    const out = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string" && v.trim() === "") return;
      if (Array.isArray(v) && v.length === 0) return;
      out[k] = typeof v === "string" ? v.trim() : v;
    });
    return out;
  };

  const normalizeModules = (mods = []) =>
    mods.map((m, mi) => ({
      ...m,
      _id: m._id || m.id || `m${mi + 1}`,
      lessons: (m.lessons || []).map((l, li) => ({
        ...l,
        _id: l._id || l.id || `l${mi + 1}_${li + 1}`,
      })),
    }));

  const [modules, setModules] = useState(normalizeModules(data.modules));
  const [newModuleName, setNewModuleName] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [selectedModule, setSelectedModule] = useState(null);

  const [newLesson, setNewLesson] = useState({
    title: "",
    type: "Video",         // optional (default রাখলাম), পাঠানোর সময় ফাঁকা থাকলে বাদ যাবে
    duration: "",          // optional
    description: "",       // optional
    fileUrl: "",           // optional
    link: "",              // optional
  });

  const [uploading, setUploading] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(courseId || null);

  useEffect(() => {
    if (courseId && courseId !== currentCourseId) setCurrentCourseId(courseId);
  }, [courseId]); // eslint-disable-line

  const lessonTypes = [
    { value: "Video", label: "Video" },
    { value: "PDF", label: "PDF" },
    { value: "Quiz", label: "Quiz" },
    { value: "Assignment", label: "Assignment" },
  ];

  const ensureCourseId = async () => {
    if (currentCourseId) return currentCourseId;
    const created = await createCourse();
    const id = created?._id || created?.id || created;
    if (!id) {
      toast.error("Could not create course ID");
      throw new Error("No course id");
    }
    setCurrentCourseId(id);
    return id;
  };

  // ---------------- Add / Delete Module ----------------
  const addModule = async () => {
    if (!newModuleName.trim()) return toast.error("Module name is required");

    try {
      const id = await ensureCourseId();

      const payload = cleanPayload({
        name: newModuleName,            // required
        description: newModuleDescription, // optional (খালি হলে বাদ)
      });

      const { data: res } = await axios.post(
        `${backendUrl}/api/courses/${id}/modules`,
        payload,
        { withCredentials: true }
      );

      if (res?.success) {
        const serverModule = res.data;
        const normalized = normalizeModules([serverModule])[0];
        setModules((p) => [...p, normalized]);
        setSelectedModule(normalized._id); // auto-open
        setNewModuleName("");
        setNewModuleDescription("");
        toast.success("Module added");
      } else {
        throw new Error(res?.message || "Add module failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to add module");
    }
  };

  const deleteModule = async (moduleId) => {
    if (!moduleId) return toast.error("Invalid module id");
    if (!window.confirm("Delete this module and all lessons?")) return;
    try {
      const id = await ensureCourseId();
      const { data: res } = await axios.delete(
        `${backendUrl}/api/courses/${id}/modules/${moduleId}`,
        { withCredentials: true }
      );
      if (res?.success) {
        setModules((p) => p.filter((m) => (m._id || m.id) !== moduleId));
        if (selectedModule === moduleId) setSelectedModule(null);
        toast.success("Module deleted");
      } else {
        throw new Error(res?.message || "Delete module failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to delete module");
    }
  };

  // ---------------- Add / Delete Lesson ----------------
  const addLesson = async (moduleId) => {
    const mid = moduleId;
    if (!mid) return toast.error("Invalid module id");
    if (!newLesson.title.trim()) return toast.error("Lesson title is required");

    try {
      const id = await ensureCourseId();

      // কেবল যেগুলো ভ্যালু আছে সেগুলিই পাঠাবো
      const lessonPayload = cleanPayload({
        title: newLesson.title,          // required
        type: newLesson.type,            // optional
        duration: newLesson.duration,    // optional
        description: newLesson.description, // optional
        fileUrl: newLesson.fileUrl,      // optional
        link: newLesson.link,            // optional
      });

      const { data: res } = await axios.post(
        `${backendUrl}/api/courses/${id}/modules/${mid}/lessons`,
        lessonPayload,
        { withCredentials: true }
      );

      if (res?.success) {
        const serverLesson = res.data;
        const normalizedLesson = {
          ...serverLesson,
          _id: serverLesson._id || serverLesson.id,
        };
        setModules((p) =>
          p.map((m) =>
            (m._id || m.id) === mid
              ? { ...m, lessons: [...m.lessons, normalizedLesson] }
              : m
          )
        );

        // reset (সব optional ফিল্ড খালি)
        setNewLesson({
          title: "",
          type: "Video",
          duration: "",
          description: "",
          fileUrl: "",
          link: "",
        });

        toast.success("Lesson added");
      } else {
        throw new Error(res?.message || "Add lesson failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to add lesson");
    }
  };

  const deleteLesson = async (moduleId, lessonId) => {
    const mid = moduleId;
    const lid = lessonId;
    if (!mid || !lid) return toast.error("Invalid ids");
    if (!window.confirm("Delete this lesson?")) return;

    try {
      const id = await ensureCourseId();
      const { data: res } = await axios.delete(
        `${backendUrl}/api/courses/${id}/modules/${mid}/lessons/${lid}`,
        { withCredentials: true }
      );
      if (res?.success) {
        setModules((p) =>
          p.map((m) =>
            (m._id || m.id) === mid
              ? { ...m, lessons: m.lessons.filter((l) => (l._id || l.id) !== lid) }
              : m
          )
        );
        toast.success("Lesson deleted");
      } else {
        throw new Error(res?.message || "Delete lesson failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to delete lesson");
    }
  };

  // ---------------- Upload ----------------
  const handleFileUpload = async (file, lessonType) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (lessonType) form.append("lessonType", lessonType);
      const { data: res } = await axios.post(
        `${backendUrl}/api/upload/lesson-file`,
        form,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res?.success) {
        setNewLesson((p) => ({ ...p, fileUrl: res.data.url }));
        toast.success("File uploaded");
      } else {
        throw new Error(res?.message || "Upload failed");
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  // ---------------- Next step guard ----------------
  const handleNext = () => {
    if (modules.length === 0) return toast.error("Please add at least one module");
    if (!modules.some((m) => (m.lessons || []).length > 0))
      return toast.error("Please add at least one lesson");
    updateData({ modules });
    onNext(modules)
  };

  return (
    <div className="space-y-6">
      <Header
        title="Content Upload"
        subtitle="Organize your course content into modules & lessons."
      />

      {/* Add Module */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-lg font-semibold mb-3">Add New Module</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1 text-sm text-slate-300">Module Name *</div>
            <input
              value={newModuleName}
              onChange={(e) => setNewModuleName(e.target.value)}
              placeholder="e.g., Introduction to React"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
            />
          </div>
          <div>
            <div className="mb-1 text-sm text-slate-300">Module Description (optional)</div>
            <input
              value={newModuleDescription}
              onChange={(e) => setNewModuleDescription(e.target.value)}
              placeholder="Brief description…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
            />
          </div>
        </div>
        <div className="mt-3">
          <button
            onClick={addModule}
            disabled={loading}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200"
          >
            + Add Module
          </button>
        </div>
      </section>

      {/* Modules List */}
      <div className="space-y-4">
        {modules.map((module, idx) => {
          const mid = module._id || module.id;
          return (
            <div key={mid || idx} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">{module.name || module.title}</div>
                  {module.description && (
                    <div className="text-sm text-slate-400">{module.description}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelectedModule(selectedModule === mid ? null : mid)
                    }
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm"
                  >
                    {selectedModule === mid ? "Hide" : "Add Lesson"}
                  </button>
                  <button
                    onClick={() => deleteModule(mid)}
                    className="rounded-lg border border-white/15 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {selectedModule === mid && (
                <div className="mt-3 rounded-xl border border-white/10 bg-slate-900/40 p-4">
                  <div className="text-sm font-medium mb-3">Add New Lesson</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Lesson Title *">
                      <input
                        value={newLesson.title}
                        onChange={(e) =>
                          setNewLesson((p) => ({ ...p, title: e.target.value }))
                        }
                        placeholder="e.g., Components 101"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                      />
                    </Field>
                    <Field label="Lesson Type (optional)">
                      <select
                        value={newLesson.type}
                        onChange={(e) =>
                          setNewLesson((p) => ({ ...p, type: e.target.value }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                      >
                        {lessonTypes.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Duration (optional)">
                      <input
                        value={newLesson.duration}
                        onChange={(e) =>
                          setNewLesson((p) => ({ ...p, duration: e.target.value }))
                        }
                        placeholder="10:30"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                      />
                    </Field>
                    <Field label="External Link (optional)">
                      <input
                        value={newLesson.link}
                        onChange={(e) =>
                          setNewLesson((p) => ({ ...p, link: e.target.value }))
                        }
                        placeholder="https://…"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                      />
                    </Field>
                  </div>

                  <Field label="Description (optional)">
                    <textarea
                      rows={3}
                      value={newLesson.description}
                      onChange={(e) =>
                        setNewLesson((p) => ({ ...p, description: e.target.value }))
                      }
                      placeholder="Brief description…"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none"
                    />
                  </Field>

                  <Field label="Upload File (optional)">
                    <input
                      type="file"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f, newLesson.type);
                      }}
                      disabled={uploading}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-3 file:py-1"
                      accept="video/*,application/pdf,.doc,.docx,.ppt,.pptx"
                    />
                    {uploading && (
                      <p className="text-sm text-sky-300 mt-1">Uploading…</p>
                    )}
                    {newLesson.fileUrl && (
                      <p className="text-sm text-emerald-300 mt-1">
                        File uploaded ✔
                      </p>
                    )}
                  </Field>

                  <button
                    onClick={() => addLesson(mid)}
                    disabled={loading || uploading || !mid}
                    className="mt-3 rounded-xl border border-white/15 px-4 py-2 text-white disabled:opacity-40"
                    style={{
                      background: "linear-gradient(90deg,#f0abfc33,#22d3ee33)",
                    }}
                  >
                    Add Lesson
                  </button>
                </div>
              )}

              <div className="mt-3 grid gap-2">
                {(module.lessons || []).map((lesson, i) => {
                  const lid = lesson._id || lesson.id;
                  return (
                    <div
                      key={lid || i}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-6 h-6 grid place-items-center rounded border border-white/15 bg-white/5">
                          {i + 1}
                        </span>
                        <div className="text-sm">
                          <div className="font-medium text-slate-200">
                            {lesson.title}
                          </div>
                          <div className="text-slate-400">
                            {lesson.type}{lesson.type && lesson.duration ? " • " : ""}{lesson.duration}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteLesson(mid, lid)}
                        className="text-red-300 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-6 border-t border-white/10">
        <button
          onClick={onPrev}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={loading || modules.length === 0}
          className="rounded-xl border border-white/15 px-5 py-2 text-white disabled:opacity-40"
          style={{ background: "linear-gradient(90deg,#a78bfa33,#22d3ee33)" }}
        >
          Next: Pricing & Visibility
        </button>
      </div>
    </div>
  );
};

export default ContentUploadStep;

function Header({ title, subtitle }) {
  return (
    <div>
      <div className="text-2xl font-bold">{title}</div>
      {subtitle && <div className="text-slate-400">{subtitle}</div>}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block mt-3">
      <div className="mb-1 text-sm text-slate-300">{label}</div>
      {children}
    </label>
  );
}

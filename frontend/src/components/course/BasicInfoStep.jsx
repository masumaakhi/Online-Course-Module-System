// src/components/course/BasicInfoStep.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";

const BasicInfoStep = ({ data, updateData, onNext, loading }) => {
  const [formData, setFormData] = useState({
    title: data.title || "",
    description: data.description || "",
    category: data.category || "",
    tags: data.tags || [],
    audience: data.audience || "general",
    difficulty: data.difficulty || "Beginner",
    language: data.language || "English",
    prerequisites: data.prerequisites || [],
    objectives: data.objectives || [],
    thumbnail: data.thumbnail || "",
  });

  const [newTag, setNewTag] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const addTag = () => {
    const v = newTag.trim();
    if (v && !formData.tags.includes(v)) {
      setFormData((p) => ({ ...p, tags: [...p.tags, v] }));
      setNewTag("");
    }
  };
  const removeTag = (t) =>
    setFormData((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  const addPrerequisite = () => {
    const v = newPrerequisite.trim();
    if (v && !formData.prerequisites.includes(v)) {
      setFormData((p) => ({ ...p, prerequisites: [...p.prerequisites, v] }));
      setNewPrerequisite("");
    }
  };
  const removePrerequisite = (v) =>
    setFormData((p) => ({
      ...p,
      prerequisites: p.prerequisites.filter((x) => x !== v),
    }));

  const addObjective = () => {
    const v = newObjective.trim();
    if (v && !formData.objectives.includes(v)) {
      setFormData((p) => ({ ...p, objectives: [...p.objectives, v] }));
      setNewObjective("");
    }
  };
  const removeObjective = (v) =>
    setFormData((p) => ({
      ...p,
      objectives: p.objectives.filter((x) => x !== v),
    }));

  const handleNext = () => {
    if (!formData.title.trim()) return toast.error("Course title is required");
    if (!formData.description.trim())
      return toast.error("Course description is required");
    if (!formData.category) return toast.error("Please select a category");
    updateData(formData);
    onNext(formData);
  };

  return (
    <div className="space-y-6 max-[450px]:space-y-5">
      <Header
        title="Basic Information"
        subtitle="Provide the essential details about your course."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT */}
        <div className="space-y-4 max-[450px]:space-y-3">
          <Field label="Course Title *">
            <input
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter course title"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none max-[450px]:py-2 max-[350px]:text-sm"
            />
          </Field>

          <Field label="Course Description *">
            <textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what students will learn…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none max-[350px]:text-sm"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Category */}
            <Field label="Category *">
              <DarkSelect
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </DarkSelect>
            </Field>

            {/* Audience */}
            <Field label="Target Audience">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "general", label: "General" },
                  { id: "corporate", label: "Corporate" },
                ].map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, audience: o.id }))
                    }
                    className={
                      "rounded-xl border px-3 py-2 max-[450px]:py-1.5 max-[350px]:text-sm " +
                      (formData.audience === o.id
                        ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-white"
                        : "border-white/10 bg-white/5 text-slate-200")
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Difficulty */}
            <Field label="Difficulty">
              <DarkSelect
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </DarkSelect>
            </Field>

            {/* Language */}
            <Field label="Language">
              <DarkSelect
                name="language"
                value={formData.language}
                onChange={handleInputChange}
              >
                {["English", "Bengali", "Hindi", "Spanish", "French", "German"].map(
                  (l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  )
                )}
              </DarkSelect>
            </Field>
          </div>

          {/* Thumbnail */}
          <Field label="Thumbnail (URL)">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none max-[350px]:text-sm"
              />
              {formData.thumbnail && (
                <button
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, thumbnail: "" }))}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-slate-200 sm:w-auto w-full"
                >
                  Clear
                </button>
              )}
            </div>

            {formData.thumbnail && (
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">
                <img
                  src={formData.thumbnail}
                  alt="thumbnail preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://dummyimage.com/800x450/0f172a/94a3b8&text=Preview+unavailable";
                  }}
                />
              </div>
            )}
          </Field>

          {/* Tags */}
          <Field label="Tags">
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTag())
                }
                placeholder="Add a tag"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none max-[350px]:text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200 sm:w-auto w-full"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm break-words"
                >
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    className="ml-2 text-slate-300 hover:text-white"
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </Field>
        </div>

        {/* RIGHT */}
        <aside className="space-y-4 max-[450px]:space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 max-[350px]:p-3">
            <div className="font-semibold max-[350px]:text-sm">Tips</div>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-300 space-y-1 max-[350px]:text-xs">
              <li>Outcome-driven titles work best.</li>
              <li>Use tags for better discovery.</li>
              <li>Select Corporate for employee-only courses.</li>
            </ul>
          </div>

          {/* Prerequisites */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 max-[350px]:p-3">
            <div className="mb-2 font-semibold max-[350px]:text-sm">
              Prerequisites
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                value={newPrerequisite}
                onChange={(e) => setNewPrerequisite(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addPrerequisite())
                }
                placeholder="Add a prerequisite"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none max-[350px]:text-sm"
              />
              <button
                onClick={addPrerequisite}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 sm:w-auto w-full"
                type="button"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {formData.prerequisites.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm break-words"
                >
                  <span className="pr-2">{p}</span>
                  <button
                    onClick={() => removePrerequisite(p)}
                    className="text-red-300"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 max-[350px]:p-3">
            <div className="mb-2 font-semibold max-[350px]:text-sm">
              Learning Objectives
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                value={newObjective}
                onChange={(e) => setNewObjective(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addObjective())
                }
                placeholder="Add an objective"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none max-[350px]:text-sm"
              />
              <button
                onClick={addObjective}
                className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 sm:w-auto w-full"
                type="button"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {formData.objectives.map((o, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-sm break-words"
                >
                  <span className="pr-2">{o}</span>
                  <button
                    onClick={() => removeObjective(o)}
                    className="text-red-300"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="flex justify-end pt-6 border-t border-white/10">
        <button
          onClick={handleNext}
          disabled={loading}
          className="rounded-xl border border-white/15 px-5 py-2 text-white disabled:opacity-40 w-full sm:w-auto"
          style={{ background: "linear-gradient(90deg,#a78bfa33,#22d3ee33)" }}
        >
          Next: Content Upload
        </button>
      </div>
    </div>
  );
};

export default BasicInfoStep;

function Header({ title, subtitle }) {
  return (
    <div>
      <div className="text-2xl max-[450px]:text-xl font-bold">{title}</div>
      {subtitle && (
        <div className="text-slate-400 max-[450px]:text-sm">{subtitle}</div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      {children}
    </label>
  );
}

const SELECT_BASE =
  "w-full rounded-xl border border-white/10 bg-slate-900/70 text-slate-100 " +
  "px-3 py-2 outline-none focus:ring-2 focus:ring-fuchsia-400/40 " +
  "appearance-none [color-scheme:dark] " +
  "[&>option]:bg-slate-900 [&>option]:text-slate-100 " +
  "[&>optgroup]:bg-slate-900 [&>optgroup]:text-slate-100 " +
  "max-[350px]:text-sm";

function DarkSelect({ children, className = "", ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`${SELECT_BASE} ${className}`}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        ▾
      </span>
    </div>
  );
}

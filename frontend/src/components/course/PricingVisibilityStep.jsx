//src/components/course/PricingVisibilityStep.jsx

import React, { useState } from "react";
import { toast } from "react-toastify";

const PricingVisibilityStep = ({ data, updateData, onNext, onPrev, courseId, loading }) => {
  const [formData, setFormData] = useState({
    visibility: data.visibility || "public",
    pricing: {
      plan: data.pricing?.plan || "free",
      price: data.pricing?.price ?? 0,
      discount: data.pricing?.discount ?? 0,
    },
    enrollmentType: data.enrollmentType || "open",
  });

  const setPlan = (plan) => setFormData((p) => ({ ...p, pricing: { ...p.pricing, plan } }));
  const setVisibility = (v) => setFormData((p) => ({ ...p, visibility: v }));
  const setEnrollment = (e) => setFormData((p) => ({ ...p, enrollmentType: e }));

  const handlePriceChange = (e) =>
    setFormData((p) => ({ ...p, pricing: { ...p.pricing, price: parseFloat(e.target.value) || 0 } }));
  const handleDiscountChange = (e) =>
    setFormData((p) => ({ ...p, pricing: { ...p.pricing, discount: parseFloat(e.target.value) || 0 } }));

  const calculateDiscountedPrice = () => {
    if (formData.pricing.plan === "free") return 0;
    const d = (formData.pricing.price * formData.pricing.discount) / 100;
    return Math.max(0, formData.pricing.price - d);
  };

  const handleNext = () => {
    if (formData.pricing.plan === "paid" && formData.pricing.price <= 0)
      return toast.error("Please set a valid price for paid courses");
    if (formData.pricing.discount < 0 || formData.pricing.discount > 100)
      return toast.error("Discount must be between 0 and 100");
    updateData(formData);
    onNext(formData);
  };

  return (
    <div className="space-y-6">
      <Header title="Pricing & Visibility" subtitle="Set pricing, access and enrollment type." />

      <section className="grid gap-6 lg:grid-cols-2">
        {/* Visibility + Pricing */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-lg font-semibold mb-2">Course Visibility</div>
            <div className="flex gap-2">
              {[
                { id: "public", label: "Public" },
                { id: "private", label: "Private" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setVisibility(o.id)}
                  className={
                    "rounded-xl border px-3 py-2 " +
                    (formData.visibility === o.id
                      ? "border-fuchsia-400/40 bg-fuchsia-500/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-200")
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-lg font-semibold mb-2">Course Pricing</div>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPlan("free")}
                className={
                  "rounded-xl border px-3 py-2 " +
                  (formData.pricing.plan === "free"
                    ? "border-sky-400/40 bg-sky-500/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-200")
                }
              >
                Free
              </button>
              <button
                onClick={() => setPlan("paid")}
                className={
                  "rounded-xl border px-3 py-2 " +
                  (formData.pricing.plan === "paid"
                    ? "border-sky-400/40 bg-sky-500/10 text-white"
                    : "border-white/10 bg-white/5 text-slate-200")
                }
              >
                Paid
              </button>
            </div>

            {formData.pricing.plan === "paid" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (USD)">
                  <input
                    type="number"
                    min="0"
                    value={formData.pricing.price}
                    onChange={handlePriceChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                  />
                </Field>
                <Field label="Discount (%)">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.pricing.discount}
                    onChange={handleDiscountChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none"
                  />
                </Field>

                <div className="sm:col-span-2 rounded-xl border border-white/10 bg-slate-900/40 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Original</span>
                    <span className="font-medium text-slate-200">${Number(formData.pricing.price).toFixed(2)}</span>
                  </div>
                  {formData.pricing.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Discount ({formData.pricing.discount}%)</span>
                      <span className="font-medium text-red-300">
                        -$
                        {((formData.pricing.price * formData.pricing.discount) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="mt-1 border-t border-white/10 pt-1 flex justify-between">
                    <span className="font-medium text-slate-200">Final</span>
                    <span className="font-bold text-emerald-300">${calculateDiscountedPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enrollment */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-lg font-semibold mb-2">Enrollment Type</div>
            <div className="flex gap-2">
              {[
                { id: "open", label: "Open Enrollment" },
                { id: "assigned", label: "Assigned (Corporate)" },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setEnrollment(o.id)}
                  className={
                    "rounded-xl border px-3 py-2 " +
                    (formData.enrollmentType === o.id
                      ? "border-emerald-400/40 bg-emerald-500/10 text-white"
                      : "border-white/10 bg-white/5 text-slate-200")
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="font-semibold mb-1">Important Notes</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>You can change these later in the dashboard.</li>
              <li>Private + Assigned is ideal for corporate training.</li>
              <li>Consider launch discounts for early enrollments.</li>
            </ul>
          </aside>
        </div>
      </section>

      <div className="flex justify-between pt-6 border-t border-white/10">
        <button onClick={onPrev} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200">
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={loading}
          className="rounded-xl border border-white/15 px-5 py-2 text-white disabled:opacity-40"
          style={{ background: "linear-gradient(90deg,#a78bfa33,#22d3ee33)" }}
        >
          Next: {formData.enrollmentType === "assigned" ? "Assign Users" : "Review & Publish"}
        </button>
      </div>
    </div>
  );
};

export default PricingVisibilityStep;

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
    <label className="block">
      <div className="mb-1 text-sm text-slate-300">{label}</div>
      {children}
    </label>
  );
}

// src/components/course/AssignUsersStep.jsx

import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const AssignUsersStep = ({ data, updateData, onNext, onPrev, courseId, loading }) => {
  const { backendUrl, userData } = useContext(AppContext);

  const [assignedUsers, setAssignedUsers] = useState(data.assignedUsers || []);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  const isCorporateCourse =
    data.audience === "corporate" && data.enrollmentType === "assigned";
  const isCorporateAdmin =
    userData?.role === "corporateAdmin" || userData?.role === "admin";

  useEffect(() => {
    if (isCorporateCourse && isCorporateAdmin) fetchAvailableUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCorporateCourse, isCorporateAdmin]);

  const fetchAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data: response } = await axios.get(
        `${backendUrl}/api/admin/users`,
        { withCredentials: true }
      );
      if (response.success) {
        const filtered = response.users.filter(
          (u) =>
            u.role === "student" &&
            !assignedUsers.some((a) => a._id === u._id)
        );
        setAvailableUsers(filtered);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch available users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const filteredUsers = availableUsers.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q)
    );
  });

  const addUser = (u) => {
    setAssignedUsers((p) => [...p, u]);
    setAvailableUsers((p) => p.filter((x) => x._id !== u._id));
  };

  const removeUser = (id) => {
    const found = assignedUsers.find((u) => u._id === id);
    setAssignedUsers((p) => p.filter((u) => u._id !== id));
    if (found) setAvailableUsers((p) => [found, ...p]);
  };

  const handleNext = () => {
    updateData({ assignedUsers });
    onNext({ assignedUsers });
  };

  const handleSkip = () => {
    const empty = [];
    updateData({ assignedUsers: empty });
    onNext({ assignedUsers: empty });
  };

  if (!isCorporateCourse || !isCorporateAdmin) {
    return (
      <div className="space-y-6 max-[450px]:space-y-5">
        <Header
          title="Assign Users"
          subtitle="This step is only for corporate courses with assigned enrollment."
        />
        <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          Step skipped — proceed to Review & Publish.
        </div>
        <NavRow
          onPrev={onPrev}
          right={
            <button
              onClick={handleSkip}
              disabled={loading}
              className="rounded-xl border border-white/15 px-5 py-2 text-white"
              style={{
                background: "linear-gradient(90deg,#a78bfa33,#22d3ee33)",
              }}
            >
              Next: Review & Publish
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-[450px]:space-y-5">
      <Header
        title="Assign Users"
        subtitle="Assign employees to this corporate course."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Users */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="text-base sm:text-lg font-semibold">
              Available Users
            </div>
          </div>

          <div className="mt-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 text-sm"
            />
          </div>

          <div className="mt-3 space-y-2 max-h-[22rem] sm:max-h-96 overflow-y-auto overscroll-contain">
            {loadingUsers ? (
              <div className="text-center text-slate-300 py-6">
                Loading users…
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                {searchTerm
                  ? "No users found for your search"
                  : "No available users"}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <UserRow
                  key={u._id}
                  user={u}
                  actionLabel="Add"
                  actionClass="border-white/15 bg-white/5 text-slate-200 hover:bg-white/10"
                  onAction={() => addUser(u)}
                />
              ))
            )}
          </div>
        </section>

        {/* Assigned Users */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
          <div className="text-base sm:text-lg font-semibold">
            Assigned Users ({assignedUsers.length})
          </div>
          <div className="mt-3 space-y-2 max-h-[22rem] sm:max-h-96 overflow-y-auto overscroll-contain">
            {assignedUsers.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                No users assigned yet
              </div>
            ) : (
              assignedUsers.map((u) => (
                <UserRow
                  key={u._id}
                  user={u}
                  actionLabel="Remove"
                  actionClass="bg-red-500/10 text-red-200 border-white/15 hover:bg-red-500/20"
                  onAction={() => removeUser(u._id)}
                  avatarClass="bg-emerald-500/20 text-emerald-200"
                />
              ))
            )}
          </div>
        </section>
      </div>

      <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <div className="font-semibold mb-1">Assignment Info</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Only students can be assigned.</li>
          <li>Assigned users get email notifications.</li>
          <li>You can add/remove later from the dashboard.</li>
        </ul>
      </aside>

      <NavRow
        onPrev={onPrev}
        right={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleSkip}
              disabled={loading}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200 w-full sm:w-auto"
            >
              Skip Assignment
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="rounded-xl border border-white/15 px-5 py-2 text-white w-full sm:w-auto"
              style={{
                background: "linear-gradient(90deg,#f0abfc33,#22d3ee33)",
              }}
            >
              Next: Review & Publish
            </button>
          </div>
        }
      />
    </div>
  );
};

export default AssignUsersStep;

/* ---------- Small UI ---------- */

function Header({ title, subtitle }) {
  return (
    <div>
      <div className="text-xl sm:text-2xl font-bold">{title}</div>
      {subtitle && (
        <div className="text-slate-400 text-sm sm:text-base">{subtitle}</div>
      )}
    </div>
  );
}

function NavRow({ onPrev, right }) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-white/10">
      <button
        onClick={onPrev}
        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-slate-200 w-full sm:w-auto"
      >
        Previous
      </button>
      {right}
    </div>
  );
}

function UserRow({
  user,
  actionLabel,
  actionClass,
  onAction,
  avatarClass = "bg-sky-500/20 text-sky-200",
}) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 rounded-xl border border-white/10 bg-slate-900/40 p-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`h-8 w-8 shrink-0 rounded-full grid place-items-center text-sm font-medium ${avatarClass}`}
        >
          {(user.name?.[0] || "U").toUpperCase()}
        </div>
        <div className="text-sm min-w-0">
          <div className="font-medium text-slate-200 truncate max-w-[12rem] sm:max-w-[16rem]">
            {user.name || "Unnamed"}
          </div>
          <div className="text-slate-400 truncate max-w-[12rem] sm:max-w-[16rem]">
            {user.email || "-"}
          </div>
        </div>
      </div>

      <button
        onClick={onAction}
        className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs sm:text-sm ${actionClass}`}
      >
        {actionLabel}
      </button>
    </div>
  );
}

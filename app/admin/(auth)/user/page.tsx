"use client";

import { useAppDialog } from "@/components/app-dialog";
import { useCallback, useEffect, useState } from "react";

type AdminUser = {
    id: string;
    fullName: string | null;
    phone: string | null;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

type Profile = AdminUser;

const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const labelClass =
    "mb-1.5 block text-sm font-medium text-gray-700";

const primaryButton =
    "rounded-lg cursor-pointer bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButton =
    "rounded-lg border cursor-pointer border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50";

export default function UserPage() {
    const { confirm } = useAppDialog();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [users, setUsers] = useState<AdminUser[]>([]);

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingUser, setSavingUser] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

    const [editFullName, setEditFullName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRole, setEditRole] = useState("ADMIN");
    const [editActive, setEditActive] = useState(true);

    const [showCreateModal, setShowCreateModal] = useState(false);

    const [createFullName, setCreateFullName] = useState("");
    const [createPhone, setCreatePhone] = useState("");
    const [createEmail, setCreateEmail] = useState("");
    const [createPassword, setCreatePassword] = useState("");
    const [createConfirmPassword, setCreateConfirmPassword] = useState("");
    const [createRole, setCreateRole] = useState("ADMIN");

    const isSuperAdmin = profile?.role === "SUPER_ADMIN";

    const showMessage = (text: string) => {
        setError("");
        setMessage(text);
    };

    const showError = (text: string) => {
        setMessage("");
        setError(text);
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const profileResponse = await fetch("/api/admin/profile", {
                cache: "no-store",
            });

            const profileData = await profileResponse.json();

            if (!profileResponse.ok || !profileData.success) {
                throw new Error(
                    profileData.message || "Unable to load profile."
                );
            }

            const currentProfile: Profile = profileData.profile;

            setProfile(currentProfile);
            setFullName(currentProfile.fullName || "");
            setPhone(currentProfile.phone || "");
            setEmail(currentProfile.email);

            if (currentProfile.role === "SUPER_ADMIN") {
                const usersResponse = await fetch("/api/admin/users", {
                    cache: "no-store",
                });

                const usersData = await usersResponse.json();

                if (!usersResponse.ok || !usersData.success) {
                    throw new Error(
                        usersData.message || "Unable to load admin accounts."
                    );
                }

                setUsers(usersData.users);
            }
        } catch (err) {
            showError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    async function handleProfileUpdate(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSavingProfile(true);
        setMessage("");
        setError("");

        try {
            const body: Record<string, string> = {
                fullName,
                phone,
                email,
            };

            const changingPassword =
                currentPassword.length > 0 ||
                newPassword.length > 0 ||
                confirmPassword.length > 0;

            if (changingPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    throw new Error(
                        "Complete all three password fields."
                    );
                }

                if (newPassword !== confirmPassword) {
                    throw new Error("New passwords do not match.");
                }

                if (newPassword.length < 12) {
                    throw new Error(
                        "New password must contain at least 12 characters."
                    );
                }

                body.currentPassword = currentPassword;
                body.newPassword = newPassword;
            }

            const response = await fetch("/api/admin/profile", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Profile update failed.");
            }

            setProfile(data.profile);
            setFullName(data.profile.fullName || "");
            setPhone(data.profile.phone || "");
            setEmail(data.profile.email);

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            showMessage(data.message || "Profile updated successfully.");
        } catch (err) {
            showError(
                err instanceof Error
                    ? err.message
                    : "Unable to update profile."
            );
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleCreateUser(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setSavingUser(true);
        setMessage("");
        setError("");

        try {
            if (createPassword !== createConfirmPassword) {
                throw new Error("Passwords do not match.");
            }

            if (createPassword.length < 12) {
                throw new Error(
                    "Password must contain at least 12 characters."
                );
            }

            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: createFullName,
                    phone: createPhone,
                    email: createEmail,
                    password: createPassword,
                    role: createRole,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message || "Unable to create admin account."
                );
            }

            // Add the new account to the existing list.
            setUsers(previous => [data.user, ...previous]);

            // Reset form.
            setCreateFullName("");
            setCreatePhone("");
            setCreateEmail("");
            setCreatePassword("");
            setCreateConfirmPassword("");
            setCreateRole("ADMIN");

            setShowCreateModal(false);

            showMessage("Admin account created successfully.");
        } catch (err) {
            showError(
                err instanceof Error
                    ? err.message
                    : "Unable to create admin account."
            );
        } finally {
            setSavingUser(false);
        }
    }

    function openEditModal(user: AdminUser) {
        setEditingUser(user);
        setEditFullName(user.fullName || "");
        setEditPhone(user.phone || "");
        setEditEmail(user.email);
        setEditRole(user.role);
        setEditActive(user.isActive);
        setMessage("");
        setError("");
    }

    async function handleUserUpdate(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (!editingUser) return;

        setSavingUser(true);
        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `/api/admin/users/${editingUser.id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fullName: editFullName,
                        phone: editPhone,
                        email: editEmail,
                        role: editRole,
                        isActive: editActive,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Admin update failed.");
            }

            setUsers(previous =>
                previous.map(user =>
                    user.id === editingUser.id
                        ? data.user
                        : user
                )
            );

            setEditingUser(null);
            showMessage("Admin account updated successfully.");
        } catch (err) {
            showError(
                err instanceof Error
                    ? err.message
                    : "Unable to update admin."
            );
        } finally {
            setSavingUser(false);
        }
    }

    async function handleDeleteUser(user: AdminUser) {
        const confirmed = await confirm(
            `Permanently delete ${user.fullName || user.email}? This action cannot be undone.`,
            {
                title: "Delete User Permanently?",
                confirmText: "Delete User",
                cancelText: "Cancel",
                variant: "danger",
            }
        );

        if (!confirmed) return;


        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `/api/admin/users/${user.id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to delete admin.");
            }

            setUsers(previous =>
                previous.filter(item => item.id !== user.id)
            );

            showMessage("Admin account deleted successfully.");
        } catch (err) {
            showError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete admin."
            );
        }
    }

    if (loading) {
        return (
            <main className="flex min-h-[calc(100dvh-60px)] lg:min-h-[calc(100dvh-70px)] items-center justify-center bg-[#f7f9f8]">
                <div className="text-sm text-gray-500">
                    Loading user information...
                </div>
            </main>
        );
    }

    if (!profile) {
        return (
            <main className="min-h-[calc(100dvh-60px)] lg:min-h-[calc(100dvh-70px)] bg-[#f7f9f8] p-6">
                <p className="text-sm text-red-600">
                    {error || "Unable to load your account."}
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-[calc(100dvh-60px)] bg-[#f7f9f8] sm:px-5 lg:min-h-[calc(100dvh-70px)] lg:px-7">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

                {/* Notifications */}
                {message && (
                    <div
                        role="status"
                        className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                    >
                        {message}
                    </div>
                )}

                {error && (
                    <div
                        role="alert"
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        {error}
                    </div>
                )}

                {/* My profile */}
                <section className="rounded-xl mb-4 border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                My Profile
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Update your personal account information.
                            </p>
                        </div>

                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {profile.role.replace("_", " ")}
                        </span>
                    </div>

                    <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>
                                    Full Name
                                </label>

                                <input
                                    className={inputClass}
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    maxLength={150}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Phone Number
                                </label>

                                <input
                                    className={inputClass}
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    maxLength={30}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className={labelClass}>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    required
                                    className={inputClass}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    maxLength={255}
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-5">
                            <h3 className="font-semibold text-gray-900">
                                Change Password
                            </h3>

                            <p className="mb-4 mt-1 text-sm text-gray-500">
                                Leave these fields empty if you do not want to
                                change your password.
                            </p>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className={labelClass}>
                                        Current Password
                                    </label>

                                    <input
                                        type="password"
                                        autoComplete="current-password"
                                        className={inputClass}
                                        value={currentPassword}
                                        onChange={e =>
                                            setCurrentPassword(e.target.value)
                                        }
                                        placeholder="Enter current password"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        New Password
                                    </label>

                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        className={inputClass}
                                        value={newPassword}
                                        onChange={e =>
                                            setNewPassword(e.target.value)
                                        }
                                        placeholder="Minimum 12 characters"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Confirm New Password
                                    </label>

                                    <input
                                        type="password"
                                        autoComplete="new-password"
                                        className={inputClass}
                                        value={confirmPassword}
                                        onChange={e =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-gray-100 pt-4">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className={primaryButton}
                            >
                                {savingProfile
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Admin management */}
                {isSuperAdmin && (
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Admin Management
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Manage administrator accounts and permissions.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                    {users.length} Accounts
                                </span>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setError("");
                                        setMessage("");
                                        setShowCreateModal(true);
                                    }}
                                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
                                >
                                    <span className="text-lg leading-none">+</span>
                                    <span className="hidden sm:inline">Create Admin</span>
                                    <span className="sm:hidden">Add</span>
                                </button>
                            </div>
                        </div>



                        {users.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500">
                                No admin accounts found.
                            </div>
                        ) : (
                            <>
                                {/* Mobile admin cards */}
                                <div className="divide-y divide-gray-100 md:hidden">
                                    {users.map(user => (
                                        <div
                                            key={user.id}
                                            className="space-y-3 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="truncate font-semibold text-gray-900">
                                                        {user.fullName || "Unnamed Admin"}
                                                    </p>

                                                    <p className="mt-0.5 break-all text-xs text-gray-500">
                                                        {user.email}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {user.phone || "No phone number"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-red-50 text-red-700"
                                                        }`}
                                                >
                                                    {user.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-xs font-medium text-gray-600">
                                                    {user.role.replace("_", " ")}
                                                </span>

                                                {user.id !== profile.id && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(user)}
                                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}

                                                {user.id === profile.id && (
                                                    <span className="text-xs text-gray-400">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop admin table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-5 py-3 font-semibold">
                                                    Admin
                                                </th>
                                                <th className="px-5 py-3 font-semibold">
                                                    Phone
                                                </th>
                                                <th className="px-5 py-3 font-semibold">
                                                    Role
                                                </th>
                                                <th className="px-5 py-3 font-semibold">
                                                    Status
                                                </th>
                                                <th className="px-5 py-3 text-right font-semibold">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {users.map(user => (
                                                <tr
                                                    key={user.id}
                                                    className="hover:bg-gray-50/70"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-medium text-gray-900">
                                                            {user.fullName || "Unnamed Admin"}
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-gray-500">
                                                            {user.email}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-gray-600">
                                                        {user.phone || "—"}
                                                    </td>

                                                    <td className="px-5 py-4 text-gray-600">
                                                        {user.role.replace("_", " ")}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.isActive
                                                                ? "bg-emerald-50 text-emerald-700"
                                                                : "bg-red-50 text-red-700"
                                                                }`}
                                                        >
                                                            {user.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        {user.id !== profile.id ? (
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(user)}
                                                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDeleteUser(user)}
                                                                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="text-right text-xs text-gray-400">
                                                                Current account
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                )}
            </div>
            {/* Create admin modal */}
            {showCreateModal && (
                <div
                    className="fixed inset-0 z-[10] flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-5"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            setShowCreateModal(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="create-admin-title"
                        className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2
                                    id="create-admin-title"
                                    className="font-semibold text-gray-900"
                                >
                                    Create Admin Account
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Add a new administrator to your system.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                aria-label="Close create form"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleCreateUser}
                            className="space-y-4 p-5"
                        >
                            <div>
                                <label className={labelClass}>
                                    Full Name *
                                </label>

                                <input
                                    required
                                    autoComplete="name"
                                    className={inputClass}
                                    value={createFullName}
                                    onChange={e => setCreateFullName(e.target.value)}
                                    maxLength={150}
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    className={inputClass}
                                    value={createPhone}
                                    onChange={e => setCreatePhone(e.target.value)}
                                    maxLength={30}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Email Address *
                                </label>

                                <input
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className={inputClass}
                                    value={createEmail}
                                    onChange={e => setCreateEmail(e.target.value)}
                                    maxLength={255}
                                    placeholder="admin@example.com"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Password *
                                </label>

                                <input
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    className={inputClass}
                                    value={createPassword}
                                    onChange={e => setCreatePassword(e.target.value)}
                                    minLength={12}
                                    maxLength={128}
                                    placeholder="Minimum 12 characters"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Confirm Password *
                                </label>

                                <input
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    className={inputClass}
                                    value={createConfirmPassword}
                                    onChange={e => setCreateConfirmPassword(e.target.value)}
                                    minLength={12}
                                    maxLength={128}
                                    placeholder="Re-enter password"
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Account Role *
                                </label>

                                <select
                                    className={inputClass}
                                    value={createRole}
                                    onChange={e => setCreateRole(e.target.value)}
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="SUPER_ADMIN">
                                        Super Admin
                                    </option>
                                </select>
                            </div>

                            <div className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                                The account will be created as active. The new admin can
                                log in immediately using these credentials.
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={savingUser}
                                    className={secondaryButton}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingUser}
                                    className={primaryButton}
                                >
                                    {savingUser ? "Creating..." : "Create Admin"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit admin modal */}
            {editingUser && (
                <div
                    className="fixed inset-0 z-[10] flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-5"
                    onMouseDown={event => {
                        if (event.target === event.currentTarget) {
                            setEditingUser(null);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-admin-title"
                        className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2
                                    id="edit-admin-title"
                                    className="font-semibold text-gray-900"
                                >
                                    Edit Admin
                                </h2>

                                <p className="mt-0.5 text-xs text-gray-500">
                                    Update account details and permissions.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingUser(null)}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                                aria-label="Close edit form"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={handleUserUpdate}
                            className="space-y-4 p-5"
                        >
                            <div>
                                <label className={labelClass}>
                                    Full Name
                                </label>

                                <input
                                    className={inputClass}
                                    value={editFullName}
                                    onChange={e => setEditFullName(e.target.value)}
                                    maxLength={150}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Phone Number
                                </label>

                                <input
                                    className={inputClass}
                                    value={editPhone}
                                    onChange={e => setEditPhone(e.target.value)}
                                    maxLength={30}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    required
                                    className={inputClass}
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    maxLength={255}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>
                                        Role
                                    </label>

                                    <select
                                        className={inputClass}
                                        value={editRole}
                                        onChange={e => setEditRole(e.target.value)}
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="SUPER_ADMIN">
                                            Super Admin
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>
                                        Account Status
                                    </label>

                                    <select
                                        className={inputClass}
                                        value={editActive ? "active" : "inactive"}
                                        onChange={e =>
                                            setEditActive(e.target.value === "active")
                                        }
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className={secondaryButton}
                                    disabled={savingUser}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingUser}
                                    className={primaryButton}
                                >
                                    {savingUser ? "Updating..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </main>
    );
}
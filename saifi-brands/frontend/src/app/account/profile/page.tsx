"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { updateProfile, changePassword, getAddresses, createAddress, deleteAddress } from "@/services/auth";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Address } from "@/types";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [changingPwd, setChangingPwd] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    line1: "",
    city: "",
    country: "Pakistan",
    postalCode: "",
  });

  const loadAddresses = async () => {
    try {
      setAddresses(await getAddresses());
    } catch {
      setAddresses([]);
    }
  };

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      await refreshUser();
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    setChangingPwd(true);
    try {
      await changePassword(pwd.currentPassword, pwd.newPassword);
      toast.success("Password changed");
      setPwd({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Failed to change password"
      );
    } finally {
      setChangingPwd(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress(newAddress);
      toast.success("Address added");
      setNewAddress({ fullName: "", line1: "", city: "", country: "Pakistan", postalCode: "" });
      setShowAddressForm(false);
      loadAddresses();
    } catch {
      toast.error("Failed to add address");
    }
  };

  const inputClass =
    "mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none";

  return (
    <div className="space-y-8">
      <section className="border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
          Personal Information
        </h2>
        <form onSubmit={handleProfile} className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted">First Name</label>
            <input
              value={profile.firstName}
              onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted">Last Name</label>
            <input
              value={profile.lastName}
              onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted">Email</label>
            <input value={user?.email || ""} disabled className={`${inputClass} opacity-60`} />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted">Phone</label>
            <input
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-ink px-8 py-3 disabled:opacity-50">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="border border-line bg-surface p-6 sm:p-8">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
          Change Password
        </h2>
        <form onSubmit={handlePassword} className="mt-6 grid gap-5 sm:grid-cols-3">
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted">Current Password</label>
            <input
              type="password"
              required
              value={pwd.currentPassword}
              onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={pwd.newPassword}
              onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-muted">Confirm</label>
            <input
              type="password"
              required
              value={pwd.confirm}
              onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={changingPwd} className="btn-outline px-8 py-3 disabled:opacity-50">
              {changingPwd ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>

      <section className="border border-line bg-surface p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
            Saved Addresses
          </h2>
          <button
            onClick={() => {
              setShowAddressForm(!showAddressForm);
              if (!showAddressForm) loadAddresses();
            }}
            className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-accent hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
            {showAddressForm ? "Close" : "Add Address"}
          </button>
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted">Full Name</label>
              <input
                required
                value={newAddress.fullName}
                onChange={(e) => setNewAddress((a) => ({ ...a, fullName: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted">Street Address</label>
              <input
                required
                value={newAddress.line1}
                onChange={(e) => setNewAddress((a) => ({ ...a, line1: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted">City</label>
              <input
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress((a) => ({ ...a, city: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted">Postal Code</label>
              <input
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress((a) => ({ ...a, postalCode: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-ink px-8 py-3">
                Save Address
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-line bg-background p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{addr.fullName}</p>
                  <p className="mt-1 text-sm text-muted">
                    {addr.line1}, {addr.city}, {addr.country}
                    {addr.postalCode ? ` ${addr.postalCode}` : ""}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await deleteAddress(addr.id);
                    loadAddresses();
                  }}
                  className="text-muted hover:text-danger"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  Trash2,
  ShieldCheck,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
  Building2,
  Bell,
  Mail,
  Clock,
} from 'lucide-react';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import EmptyState from '../../components/common/EmptyState';
import Toast from '../../components/common/Toast';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');

  // Modals
  const [viewUserModal, setViewUserModal] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editUserModal, setEditUserModal] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    enabled: true,
    emailVerified: true,
  });

  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        verification: verificationFilter,
      });
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to fetch user list', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Debounced search & filter reload
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, statusFilter, verificationFilter]);

  // View User Details
  const handleOpenViewModal = async (u) => {
    setViewLoading(true);
    setViewUserModal({ basic: u });
    try {
      const res = await adminService.getUserDetails(u.id);
      if (res.success && res.data) {
        setViewUserModal(res.data);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to load user details', type: 'error' });
    } finally {
      setViewLoading(false);
    }
  };

  // Open Edit User Modal
  const handleOpenEditModal = (u) => {
    const isAdmin = u.roles?.includes('ROLE_ADMIN') || u.roles?.includes('ADMIN');
    setEditUserModal(u);
    setEditFormData({
      name: u.name || '',
      email: u.email || '',
      role: isAdmin ? 'ADMIN' : 'USER',
      enabled: u.enabled ?? true,
      emailVerified: u.emailVerified ?? false,
    });
  };

  // Submit Edit Form
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;

    setActionLoading(true);
    try {
      const roles = editFormData.role === 'ADMIN' ? ['ROLE_ADMIN', 'ROLE_USER'] : ['ROLE_USER'];
      const payload = {
        name: editFormData.name,
        email: editFormData.email,
        roles,
        enabled: editFormData.enabled,
        emailVerified: editFormData.emailVerified,
      };

      const res = await adminService.updateUser(editUserModal.id, payload);
      if (res.success) {
        setToast({ message: `User ${editFormData.name} updated successfully`, type: 'success' });
        setEditUserModal(null);
        fetchUsers();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update user', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle User Status (Activate / Deactivate)
  const handleToggleStatus = async (u) => {
    const newStatus = !u.enabled;
    const actionText = newStatus ? 'activate' : 'deactivate';
    
    if (!window.confirm(`Are you sure you want to ${actionText} ${u.name}?`)) return;

    try {
      const res = await adminService.updateUserStatus(u.id, newStatus);
      if (res.success) {
        setToast({ message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`, type: 'success' });
        fetchUsers();
      }
    } catch (err) {
      setToast({ message: err.message || `Failed to ${actionText} user`, type: 'error' });
    }
  };

  // Toggle User Role (USER <-> ADMIN)
  const handleToggleRole = async (u) => {
    const isAdmin = u.roles?.includes('ROLE_ADMIN') || u.roles?.includes('ADMIN');
    const newRole = isAdmin ? 'USER' : 'ADMIN';
    const actionText = isAdmin ? 'demote to USER' : 'promote to ADMIN';

    if (!window.confirm(`Are you sure you want to ${actionText} for ${u.name}?`)) return;

    try {
      const res = await adminService.updateUserRole(u.id, newRole);
      if (res.success) {
        setToast({ message: `User role changed to ${newRole}`, type: 'success' });
        fetchUsers();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to change user role', type: 'error' });
    }
  };

  // Execute Delete User
  const handleConfirmDelete = async () => {
    if (!deleteConfirmUser) return;
    setActionLoading(true);
    try {
      const res = await adminService.deleteUser(deleteConfirmUser.id);
      if (res.success) {
        setToast({ message: 'User permanently deleted', type: 'success' });
        setDeleteConfirmUser(null);
        fetchUsers();
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to delete user', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 font-heading">
            Admin User Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage user accounts, roles, statuses, and permissions</p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Users
        </button>
      </div>

      {/* Search & Filters Bar */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">USER Only</option>
              <option value="ADMIN">ADMIN Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE Only</option>
              <option value="INACTIVE">INACTIVE Only</option>
            </select>
          </div>

          {/* Email Verification Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email Verification</label>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="ALL">All Accounts</option>
              <option value="VERIFIED">VERIFIED Only</option>
              <option value="UNVERIFIED">UNVERIFIED Only</option>
            </select>
          </div>
        </div>
      </div>

      {loading && <LoadingSkeleton type="table" count={5} />}

      {!loading && users.length === 0 && (
        <EmptyState
          title="No Users Found"
          message="No user records match your search or filter parameters."
          icon={Users}
        />
      )}

      {/* Users Table */}
      {!loading && users.length > 0 && (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Email Verification</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {users.map((u) => {
                  const isAdmin = u.roles?.includes('ROLE_ADMIN') || u.roles?.includes('ADMIN');
                  const isCurrent = currentUser?.id === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Email */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold text-xs ${
                            isAdmin ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                              {u.name}
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-extrabold uppercase">You</span>
                              )}
                            </p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                            <span className="text-[10px] font-mono text-slate-400">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {isAdmin ? <ShieldCheck className="w-3 h-3 text-purple-600" /> : <Users className="w-3 h-3 text-slate-500" />}
                          {isAdmin ? 'ADMIN' : 'USER'}
                        </span>
                      </td>

                      {/* Account Status Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          u.enabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {u.enabled ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {u.enabled ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Email Verification */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          u.emailVerified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          <CheckCircle2 className="w-3 h-3" />
                          {u.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Never'}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-4 font-mono text-[11px] text-slate-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenViewModal(u)}
                            title="View User Details"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(u)}
                            title="Edit User Account"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleRole(u)}
                            title={isAdmin ? 'Demote to USER' : 'Promote to ADMIN'}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={u.enabled ? 'Deactivate User' : 'Activate User'}
                            className={`p-1.5 rounded-lg transition ${
                              u.enabled ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.enabled ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            title="Permanently Delete User"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW USER DETAILS MODAL */}
      {viewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-heading">User Details</h3>
                  <p className="text-xs text-slate-500 font-mono">ID: {viewUserModal.id || viewUserModal.basic?.id}</p>
                </div>
              </div>
              <button onClick={() => setViewUserModal(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewLoading ? (
              <LoadingSkeleton type="card" count={1} />
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Full Name</span>
                    <span className="font-bold text-slate-800 text-sm">{viewUserModal.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px]">Email Address</span>
                    <span className="font-bold text-slate-800 text-sm">{viewUserModal.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-center">
                    <Building2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Saved Cities</span>
                    <p className="text-lg font-extrabold text-slate-800 font-heading">{viewUserModal.savedCitiesCount ?? 0}</p>
                  </div>
                  <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-center">
                    <Bell className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Alert Rules</span>
                    <p className="text-lg font-extrabold text-slate-800 font-heading">{viewUserModal.alertsCount ?? 0}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-center">
                    <Mail className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Subscriptions</span>
                    <p className="text-lg font-extrabold text-slate-800 font-heading">{viewUserModal.subscriptionsCount ?? 0}</p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Assigned Roles:</span>
                    <span className="font-bold text-slate-800">{viewUserModal.roles?.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Account Status:</span>
                    <span className={`font-bold ${viewUserModal.enabled ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {viewUserModal.enabled ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Email Verification:</span>
                    <span className={`font-bold ${viewUserModal.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {viewUserModal.emailVerified ? 'VERIFIED' : 'UNVERIFIED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Default Home City:</span>
                    <span className="font-bold text-slate-800">{viewUserModal.defaultCity || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Last Login:</span>
                    <span className="font-mono text-slate-700">{viewUserModal.lastLoginAt ? new Date(viewUserModal.lastLoginAt).toLocaleString() : 'Never'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewUserModal(null)}
                className="px-5 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Edit User Account</h3>
              <button onClick={() => setEditUserModal(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Assigned Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Account Status</label>
                  <select
                    value={editFormData.enabled ? 'true' : 'false'}
                    onChange={(e) => setEditFormData({ ...editFormData, enabled: e.target.value === 'true' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    <option value="true">ACTIVE</option>
                    <option value="false">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="emailVerifiedCheck"
                  checked={editFormData.emailVerified}
                  onChange={(e) => setEditFormData({ ...editFormData, emailVerified: e.target.checked })}
                  className="w-4 h-4 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="emailVerifiedCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Mark Email as Verified
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 font-heading">Delete User Account?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete user <strong className="text-slate-900">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})?
              This action will remove all their saved cities, weather alerts, and user subscriptions.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default AdminUsersPage;

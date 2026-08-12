import api from './api';

export const adminService = {
  getAdminDashboard: () => api.get('/admin/dashboard'),
  getAllUsers: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.role) searchParams.append('role', params.role);
    if (params.status) searchParams.append('status', params.status);
    if (params.verification) searchParams.append('verification', params.verification);
    
    const queryString = searchParams.toString();
    return api.get(`/admin/users${queryString ? `?${queryString}` : ''}`);
  },
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, enabled) => api.patch(`/admin/users/${id}/status`, { enabled }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

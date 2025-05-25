import axios from 'axios';

const API_URL = 'https://waslab04-p1hk.onrender.com/api/v1';
const API_KEY = 'OPGPjVjDxM7u5jshpus4tKiTFjfplKtA';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
    },
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('Request:', config);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        return response;
    },
    (error) => {
        console.error('Response Error:', error.response || error);
        return Promise.reject(error);
    }
);

// Issues
export const getIssues = () => api.get('/issues');
export const getIssueById = (id: number) => api.get(`/issues/${id}`);
export const createIssue = (data: any) => api.post('/issues', data);
export const updateIssue = (id: number, data: any) => api.put(`/issues/${id}`, data);
export const deleteIssue = (id: number) => api.delete(`/issues/${id}`);

// Comments
export const getIssueComments = (issueId: number) => api.get(`/issues/${issueId}/comments`);
export const createComment = (issueId: number, data: any) => {
    console.log('API call to create comment:', {
        url: `/issues/${issueId}/comments`,
        method: 'POST',
        data
    });
    return api.post(`/issues/${issueId}/comments`, data, {
        headers: {
            'X-User-ID': data.user_id.toString()
        }
    });
};
export const updateComment = (issueId: number, commentId: number, data: any) => 
    api.put(`/issues/${issueId}/comments/${commentId}`, data);
export const deleteComment = (issueId: number, commentId: number) => 
    api.delete(`/issues/${issueId}/comments/${commentId}`);

// Attachments
export const getIssueAttachments = (issueId: number) => api.get(`/issues/${issueId}/attachments`);
export const uploadAttachment = (issueId: number, file: File) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/issues/${issueId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
export const deleteAttachment = (issueId: number, attachmentId: number) => 
    api.delete(`/issues/${issueId}/attachments/${attachmentId}`);

// Issue Types
export const getIssueTypes = () => api.get('/issue_types');
export const createIssueType = (data: any) => api.post('/issue_types', data);
export const updateIssueType = (id: number, data: any) => api.put(`/issue_types/${id}`, data);
export const deleteIssueType = (id: number) => api.delete(`/issue_types/${id}`);

// Severities
export const getSeverities = () => api.get('/severities');
export const createSeverity = (data: any) => api.post('/severities', data);
export const updateSeverity = (id: number, data: any) => api.put(`/severities/${id}`, data);
export const deleteSeverity = (id: number) => api.delete(`/severities/${id}`);

// Priorities
export const getPriorities = () => api.get('/priorities');
export const createPriority = (data: any) => api.post('/priorities', data);
export const updatePriority = (id: number, data: any) => api.put(`/priorities/${id}`, data);
export const deletePriority = (id: number) => api.delete(`/priorities/${id}`);

// Statuses
export const getStatuses = () => api.get('/statuses');
export const createStatus = (data: any) => api.post('/statuses', data);
export const updateStatus = (id: number, data: any) => api.put(`/statuses/${id}`, data);
export const deleteStatus = (id: number) => api.delete(`/statuses/${id}`);

// Users
export const getUsers = () => api.get('/users');
export const updateUser = (id: number, data: any) => {
    console.log('API call to update user bio:', {
        url: `/users/${id}/bio_edit`,
        method: 'PUT',
        data
    });
    return api.put(`/users/${id}/bio_edit`, data, {
        headers: {
            'X-API-Key': API_KEY,
            'X-User-ID': id.toString(),
            'Content-Type': 'application/json'
        }
    });
};

export default api; 
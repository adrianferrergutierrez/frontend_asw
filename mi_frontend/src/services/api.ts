import axios from 'axios';

const API_URL = 'https://waslab04-uscf.onrender.com/api/v1';
const API_KEY = 'T6f62HIAi0wonBawcDjUJUlmdL1xVioV';

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
type OrderByOptions = 'type' | 'severity' | 'priority' | 'issue' | 'status' | 'modified' | 'assign_to';

interface GetIssuesParams {
    order_by?: OrderByOptions;
    order_direction?: 'asc' | 'desc';
    // We can add other filter parameters here in the future if needed
    [key: string]: any; // Allow other potential filter params from IssueList's filters state
}

export const getIssues = (params?: GetIssuesParams) => api.get('/issues', { params });
export const getIssueById = (id: number) => api.get(`/issues/${id}`);
export const createIssue = (data: any) => api.post('/issues', { issue: data });
export const updateIssue = (id: number, data: any) => api.put(`/issues/${id}`, { issue: data });
export const deleteIssue = (id: number) => api.delete(`/issues/${id}`);

// Comments
export const getIssueComments = (issueId: number) => api.get(`/issues/${issueId}/comments`);
export const createComment = (issueId: number, data: any) => {
    console.log('API call to create comment:', {
        url: `/issues/${issueId}/comments`,
        method: 'POST',
        data,
        headers: {
            'X-API-Key': API_KEY,
            'X-User-ID': data.user_id.toString(),
            'Content-Type': 'application/json'
        }
    });

    // Usar el user_id que viene en data (usuario actual seleccionado)
    const requestData = {
        ...data,
        user_id: data.user_id
    };

    return api.post(`/issues/${issueId}/comments`, requestData, {
        headers: {
            'X-API-Key': API_KEY,
            'X-User-ID': data.user_id.toString(),
            'Content-Type': 'application/json'
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
export const deleteIssueType = (id: number, replaceWithId?: number) => api.delete(`/issue_types/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`);

// Severities
export const getSeverities = () => api.get('/severities');
export const createSeverity = (data: any) => api.post('/severities', data);
export const updateSeverity = (id: number, data: any) => api.put(`/severities/${id}`, data);
export const deleteSeverity = (id: number, replaceWithId?: number) => api.delete(`/severities/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`);

// Priorities
export const getPriorities = () => api.get('/priorities');
export const createPriority = (data: any) => api.post('/priorities', data);
export const updatePriority = (id: number, data: any) => api.put(`/priorities/${id}`, data);
export const deletePriority = (id: number, replaceWithId?: number) => api.delete(`/priorities/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`);
// Statuses
export const getStatuses = () => api.get('/statuses');
export const createStatus = (data: any) => api.post('/statuses', data);
export const updateStatus = (id: number, data: any) => api.put(`/statuses/${id}`, data);
export const deleteStatus = (id: number, replaceWithId?: number) => api.delete(`/statuses/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`);
// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id: number) => api.get(`/users/${id}`);
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

// Define the type for the profile pic response
interface ProfilePicResponse {
  avatar_url: string;
  [key: string]: any; // For any other properties that might be in the response
}

export const updateUserProfilePic = (id: number, file: File): Promise<{ data: ProfilePicResponse }> => {
    console.log('API call to update user profile pic:', {
        url: `/users/${id}/profile_pic_edit`,
        method: 'PUT',
        file: file.name
    });
    
    // Create a new FormData instance
    const formData = new FormData();
    
    // Try with both parameter names to cover all bases
    formData.append('avatar', file);
    formData.append('profile_pic', file);
    
    // Create a direct XMLHttpRequest for more control
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `${API_URL}/users/${id}/profile_pic_edit`);
        xhr.setRequestHeader('X-API-Key', API_KEY);
        xhr.setRequestHeader('X-User-ID', id.toString());
        
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ data: JSON.parse(xhr.responseText) as ProfilePicResponse });
            } else {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText,
                    response: xhr.responseText
                });
            }
        };
        
        xhr.onerror = function() {
            reject({
                status: xhr.status,
                statusText: xhr.statusText,
                response: xhr.responseText
            });
        };
        
        xhr.send(formData);
    });
};

export default api;
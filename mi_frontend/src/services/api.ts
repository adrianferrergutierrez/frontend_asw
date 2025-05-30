import axios from 'axios';

const API_URL = 'https://waslab04-p1hk.onrender.com/api/v1';
const API_KEY = 'FPNzyupb0yhy7tA3Ey8UT0fSvi4rbIrf';



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

export const getIssues = (params?: GetIssuesParams) => api.get('/issues', { 
    params,
    headers: {
        'X-API-Key': API_KEY
    }
});

export const getIssueById = (id: number) => api.get(`/issues/${id}`, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const createIssue = (data: any) => {
    // Format the data correctly for the API
    // If data contains watcher_ids, we need to ensure it's inside an 'issue' object
    const formattedData = data.watcher_ids !== undefined ? {
        issue: {
            ...data,
            watcher_ids: data.watcher_ids
        }
    } : data;

    console.log('Formatted data for create:', formattedData);
    
    return api.post('/issues', formattedData, {
        headers: {
            'X-API-Key': API_KEY
        }
    });
};

export const updateIssue = (id: number, data: any) => {
    // Format the data correctly for the API
    // If data contains watcher_ids, we need to ensure it's inside an 'issue' object
    const formattedData = data.watcher_ids !== undefined ? {
        issue: {
            ...data,
            watcher_ids: data.watcher_ids
        }
    } : data;

    console.log('Formatted data for update:', formattedData);
    
    return api.put(`/issues/${id}`, formattedData, {
        headers: {
            'X-API-Key': API_KEY
        }
    });
};

export const deleteIssue = (id: number) => api.delete(`/issues/${id}`, {
    headers: {
        'X-API-Key': API_KEY
    }
});

// Comments
export const getIssueComments = (issueId: number) => api.get(`/issues/${issueId}/comments`, {
    headers: {
        'X-API-Key': API_KEY
    }
});

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

    return api.post(`/issues/${issueId}/comments`, data, {
        headers: {
            'X-API-Key': API_KEY,
            'X-User-ID': data.user_id.toString(),
            'Content-Type': 'application/json'
        }
    });
};

export const updateComment = (issueId: number, commentId: number, data: any) => 
    api.put(`/issues/${issueId}/comments/${commentId}`, data, {
        headers: {
            'X-API-Key': API_KEY
        }
    });

export const deleteComment = (issueId: number, commentId: number) => 
    api.delete(`/issues/${issueId}/comments/${commentId}`, {
        headers: {
            'X-API-Key': API_KEY
        }
    });

// Attachments
export const getIssueAttachments = (issueId: number) => api.get(`/issues/${issueId}/attachments`, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const uploadAttachment = (issueId: number, file: File) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/issues/${issueId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'X-API-Key': API_KEY
        },
    });
};

export const deleteAttachment = (issueId: number, attachmentId: number) => 
    api.delete(`/issues/${issueId}/attachments/${attachmentId}`, {
        headers: {
            'X-API-Key': API_KEY
        }
    });

// Issue Types
export const getIssueTypes = () => api.get('/issue_types', {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const createIssueType = (data: any) => api.post('/issue_types', data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const updateIssueType = (id: number, data: any) => api.put(`/issue_types/${id}`, data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const deleteIssueType = (id: number, replaceWithId?: number) => 
    api.delete(`/issue_types/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': API_KEY
        }
    });

// Severities
export const getSeverities = () => api.get('/severities', {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const createSeverity = (data: any) => api.post('/severities', data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const updateSeverity = (id: number, data: any) => api.put(`/severities/${id}`, data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const deleteSeverity = (id: number, replaceWithId?: number) => 
    api.delete(`/severities/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': API_KEY
        }
    });

// Priorities
export const getPriorities = () => api.get('/priorities', {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const createPriority = (data: any) => api.post('/priorities', data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const updatePriority = (id: number, data: any) => api.put(`/priorities/${id}`, data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const deletePriority = (id: number, replaceWithId?: number) => 
    api.delete(`/priorities/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': API_KEY
        }
    });

// Statuses
export const getStatuses = () => api.get('/statuses', {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const createStatus = (data: any) => api.post('/statuses', data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const updateStatus = (id: number, data: any) => api.put(`/statuses/${id}`, data, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const deleteStatus = (id: number, replaceWithId?: number) => 
    api.delete(`/statuses/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': API_KEY
        }
    });

// Users
export const getUsers = () => api.get('/users', {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const getUserById = (id: number) => api.get(`/users/${id}`, {
    headers: {
        'X-API-Key': API_KEY
    }
});

export const updateUser = (id: number, data: any) => {
    console.log('API call to update user bio:', {
        url: `/users/${id}/bio_edit`,
        method: 'PUT',
        data,
        apiKey: API_KEY
    });
    
    return api.put(`/users/${id}/bio_edit`, data, {
        headers: {
            'X-API-Key': API_KEY,
            'X-User-ID': id.toString(),
            'Content-Type': 'application/json'
        }
    });
};

export const updateUserProfilePic = (id: number, file: File) => {
    console.log('API call to update user profile pic:', {
        url: `/users/${id}/profile_pic_edit`,
        method: 'PUT',
        file: file.name,
        fileType: file.type,
        fileSize: file.size,
        apiKey: API_KEY
    });
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.put(`/users/${id}/profile_pic_edit`, formData, {
        headers: {
            'X-API-Key': API_KEY,
            'X-User-ID': id.toString(),
            'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        validateStatus: function (status) {
            return status < 500;
        }
    });
};

export default api;
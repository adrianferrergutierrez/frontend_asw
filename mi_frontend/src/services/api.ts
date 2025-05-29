import axios from 'axios';

const API_URL = 'https://waslab04-p1hk.onrender.com/api/v1';
const API_KEY = 'FPNzyupb0yhy7tA3Ey8UT0fSvi4rbIrf';
const API_KEY_2 = 'OPGPjVjDxM7u5jshpus4tKiTFjfplKtA';
const API_KEY_3 = 'QyYrixzL75McEOkB6NlV1tcxG4IW5Ofw';
const API_KEY_4 = 'eB5yqol72bRjlC9BazKWEYxuUiuhZF2A';
const API_KEY_5 = '';

// Función para obtener la API key correcta según el email del usuario
const getApiKeyForUser = (userEmail: string) => {
    console.log('User email:', userEmail);
    if(userEmail === 'a1@gmail.com'){return API_KEY_2}
    else if(userEmail === 'a2@gmail.com'){return API_KEY_4}
    else if(userEmail === 'francesc.perez.venegas@estudiantat.upc.edu'){return API_KEY_3}
    else if(userEmail === 'jan.santos@estudiantat.upc.edu'){return API_KEY_5}
    return API_KEY;
};

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY // Default API key
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
        'X-API-Key': getApiKeyForUser(params?.user_email || '')
    }
});

export const getIssueById = (id: number, userEmail: string) => api.get(`/issues/${id}`, {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const createIssue = (data: any) => api.post('/issues', data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const updateIssue = (id: number, data: any) => api.put(`/issues/${id}`, data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const deleteIssue = (id: number, userEmail: string) => api.delete(`/issues/${id}`, {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

// Comments
export const getIssueComments = (issueId: number, userEmail: string) => api.get(`/issues/${issueId}/comments`, {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const createComment = (issueId: number, data: any) => {
    console.log('API call to create comment:', {
        url: `/issues/${issueId}/comments`,
        method: 'POST',
        data,
        headers: {
            'X-API-Key': getApiKeyForUser(data.user_email),
            'X-User-ID': data.user_id.toString(),
            'Content-Type': 'application/json'
        }
    });

    return api.post(`/issues/${issueId}/comments`, data, {
        headers: {
            'X-API-Key': getApiKeyForUser(data.user_email),
            'X-User-ID': data.user_id.toString(),
            'Content-Type': 'application/json'
        }
    });
};

export const updateComment = (issueId: number, commentId: number, data: any) => 
    api.put(`/issues/${issueId}/comments/${commentId}`, data, {
        headers: {
            'X-API-Key': getApiKeyForUser(data.user_email)
        }
    });

export const deleteComment = (issueId: number, commentId: number, userEmail: string) => 
    api.delete(`/issues/${issueId}/comments/${commentId}`, {
        headers: {
            'X-API-Key': getApiKeyForUser(userEmail)
        }
    });

// Attachments
export const getIssueAttachments = (issueId: number, userEmail: string) => api.get(`/issues/${issueId}/attachments`, {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const uploadAttachment = (issueId: number, file: File, userEmail: string) => {
    const formData = new FormData();
    formData.append('attachment', file);
    return api.post(`/issues/${issueId}/attachments`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'X-API-Key': getApiKeyForUser(userEmail)
        },
    });
};

export const deleteAttachment = (issueId: number, attachmentId: number, userEmail: string) => 
    api.delete(`/issues/${issueId}/attachments/${attachmentId}`, {
        headers: {
            'X-API-Key': getApiKeyForUser(userEmail)
        }
    });

// Issue Types
export const getIssueTypes = (userEmail: string) => api.get('/issue_types', {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const createIssueType = (data: any) => api.post('/issue_types', data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const updateIssueType = (id: number, data: any) => api.put(`/issue_types/${id}`, data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const deleteIssueType = (id: number, userEmail: string, replaceWithId?: number) => 
    api.delete(`/issue_types/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': getApiKeyForUser(userEmail)
        }
    });

// Severities
export const getSeverities = (userEmail: string) => api.get('/severities', {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const createSeverity = (data: any) => api.post('/severities', data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const updateSeverity = (id: number, data: any) => api.put(`/severities/${id}`, data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const deleteSeverity = (id: number, userEmail: string, replaceWithId?: number) => 
    api.delete(`/severities/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': getApiKeyForUser(userEmail)
        }
    });

// Priorities
export const getPriorities = (userEmail: string) => api.get('/priorities', {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const createPriority = (data: any) => api.post('/priorities', data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const updatePriority = (id: number, data: any) => api.put(`/priorities/${id}`, data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const deletePriority = (id: number, userEmail: string, replaceWithId?: number) => 
    api.delete(`/priorities/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': getApiKeyForUser(userEmail)
        }
    });

// Statuses
export const getStatuses = (userEmail: string) => api.get('/statuses', {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const createStatus = (data: any) => api.post('/statuses', data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const updateStatus = (id: number, data: any) => api.put(`/statuses/${id}`, data, {
    headers: {
        'X-API-Key': getApiKeyForUser(data.user_email)
    }
});

export const deleteStatus = (id: number, userEmail: string, replaceWithId?: number) => 
    api.delete(`/statuses/${id}${replaceWithId ? `?issues_go_to_id=${replaceWithId}` : ''}`, {
        headers: {
            'X-API-Key': getApiKeyForUser(userEmail)
        }
    });

// Users
export const getUsers = (userEmail: string) => api.get('/users', {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const getUserById = (id: number, userEmail: string) => api.get(`/users/${id}`, {
    headers: {
        'X-API-Key': getApiKeyForUser(userEmail)
    }
});

export const updateUser = (id: number, data: any, userEmail: string) => {
    console.log('API call to update user bio:', {
        url: `/users/${id}/bio_edit`,
        method: 'PUT',
        data,
        userEmail,
        apiKey: getApiKeyForUser(userEmail)
    });
    
    return api.put(`/users/${id}/bio_edit`, data, {
        headers: {
            'X-API-Key': getApiKeyForUser(userEmail),
            'X-User-ID': id.toString(),
            'Content-Type': 'application/json'
        }
    });
};

export const updateUserProfilePic = (id: number, file: File, userEmail: string) => {
    const apiKey = getApiKeyForUser(userEmail);
    
    console.log('API call to update user profile pic:', {
        url: `/users/${id}/profile_pic_edit`,
        method: 'PUT',
        file: file.name,
        fileType: file.type,
        fileSize: file.size,
        userEmail: userEmail,
        apiKey: apiKey
    });
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Log the FormData contents
    for (let pair of formData.entries()) {
        console.log('FormData entry:', pair[0], pair[1]);
    }
    
    return api.put(`/users/${id}/profile_pic_edit`, formData, {
        headers: {
            'X-API-Key': apiKey,
            'X-User-ID': id.toString(),
            'Content-Type': 'multipart/form-data'
        },
        timeout: 30000,
        validateStatus: function (status) {
            return status < 500;
        }
    }).then(response => {
        console.log('Profile picture upload response:', response);
        return response;
    }).catch(error => {
        console.error('Profile picture upload error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers,
            config: {
                url: error.config?.url,
                method: error.config?.method,
                headers: error.config?.headers,
                data: error.config?.data
            }
        });

        if (error.response?.data) {
            console.error('Server error response:', JSON.stringify(error.response.data, null, 2));
        }

        throw error;
    });
};

export default api;
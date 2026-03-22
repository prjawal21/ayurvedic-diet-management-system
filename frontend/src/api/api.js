import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
};

// Patient API
export const patientAPI = {
    getAll: (search = '') => api.get(`/patients${search ? `?search=${search}` : ''}`),
    create: (data) => api.post('/patients', data),
    getById: (id) => api.get(`/patients/${id}`),
    update: (id, data) => api.put(`/patients/${id}`, data),
    delete: (id) => api.delete(`/patients/${id}`),
};

// Visit API (NEW - Phase 1)
export const visitAPI = {
    create: (data) => api.post('/visits', data),
    getPatientVisits: (patientId) => api.get(`/visits/patient/${patientId}`),
    getById: (id) => api.get(`/visits/${id}`),
    getByPatient: (patientId) => api.get(`/visits/api/patient/${patientId}`) // Phase 3
};

// Diet API
export const dietAPI = {
    // Visit-based queries
    getByVisitId: (visitId) => api.get(`/diet/visit/${visitId}`),
    getHistory: (visitId) => api.get(`/diet/visit/${visitId}/history`),

    // Fetch a single DietChart by its own _id (for Edit page load)
    getDietById: (dietChartId) => api.get(`/diet/api/chart/${dietChartId}`),

    // Patient-based query (legacy / DietChart.jsx type=patient)
    getByPatientId: (patientId) => api.get(`/diet/${patientId}`),

    // Phase 3: Doctor Workflow (used by ClinicalInputForm)
    generateDiet: (data) => api.post('/diet/api/generate', data),
    saveDiet: (data) => api.post('/diet/api/save', data),
    editDiet: (dietChartId, data) => api.put(`/diet/api/${dietChartId}/edit`, data),
};

// Food API (Phase 3)
export const foodAPI = {
    getAll: (params = {}) => api.get('/foods', { params })
};

export default api;

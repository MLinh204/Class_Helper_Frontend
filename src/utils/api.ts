import axios, { InternalAxiosRequestConfig, AxiosRequestHeaders } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;
const DICTIONARY_API_BASE_URL = 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Ensure headers is defined and cast to AxiosRequestHeaders
    config.headers = config.headers || {} as AxiosRequestHeaders;
    config.headers['Authorization'] = 'Bearer ' + token;
  }
  return config;
});

// Authentication endpoints
export const register = (data: Record<string, unknown>) => api.post('/auth/register', data);
export const login = (data: Record<string, unknown>) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');
export const refreshToken = () => api.post('/auth/refresh-token');

// Student endpoints
export const getAllStudents = () => api.get('/student/all');
export const searchStudents = (q: string) => api.get(`/student/search?q=${q}`);
export const getStudentById = (id: number) => api.get(`/student/${id}`);
export const createStudent = (data: Record<string, unknown>) => api.post('/student', data);
export const updateStudent = (id: number, data: Record<string, unknown>) => api.put(`/student/${id}`, data);
export const deleteStudent = (id: number) => api.delete(`/student/${id}`);
export const getStudentByUserId = (userId: number) => api.get(`/student/user/${userId}`);

// Attendance endpoints
export const getAllAttendance = () => api.get('/attendanceList/all');
export const getAttendanceById = (id: number) => api.get(`/attendanceList/${id}`);
export const createAttendance = (data: Record<string, unknown>) => api.post('/attendanceList', data);
export const updateAttendance = (id: number, data: Record<string, unknown>) => api.put(`/attendanceList/${id}`, data);
export const deleteAttendance = (id: number) => api.delete(`/attendanceList/${id}`);
export const getAttendanceRecordByListId = (listId: number) => api.get(`/attendanceRecord/list/${listId}`);
export const checkAttendance = (id: number, data: Record<string, unknown>) => api.put(`/attendanceRecord/record/${id}`, data);
export const searchAttendanceList = (q: string) => api.get(`/attendanceList/search?query=${q}`);


// Vocabulary endpoints
export const getAllVocabLists = () => api.get(`/vocabList/all`);
export const getVocabListById = (id: number) => api.get(`/vocabList/${id}`);
export const searchVocabList = (query: string) => api.get(`/vocabList/search?query=${query}`);
export const getVocabByListId = (id: number) => api.get(`/vocab/list/${id}`);
export const createVocab = (id: number, data: Record<string, unknown>) => api.post(`/vocab/list/${id}`, data);
export const updateVocab = (id: number, data: Record<string, unknown>) => api.put(`/vocab/${id}`, data);
export const searchVocabViaListId = (id: number, query: string) => api.get(`/vocab/list/${id}/search?query=${query}`);
export const sortVocabViaListId = (id: number, column: string, order: string) => api.get(`/vocab/list/${id}/sort?column=${column}&order=${order}`);


//Dictionary
export const getDictionaryByWord = (word: string) => {
  return axios.get(`${DICTIONARY_API_BASE_URL}/dictionary/${word}`, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
};

export default api;

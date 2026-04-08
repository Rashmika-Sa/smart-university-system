import axios from './axios';

export const getStudentEmails = () => axios.get('/users/students/emails');
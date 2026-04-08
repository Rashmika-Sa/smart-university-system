import { useCallback, useEffect, useState } from 'react';
import { getStudentEmails } from '../api/userApi';

const normalizeEmail = (value) => value.trim().toLowerCase();

const useStudentEmailValidation = () => {
  const [studentEmails, setStudentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadStudentEmails = async () => {
      try {
        const response = await getStudentEmails();
        const emails = (response.data || [])
          .map((item) => (typeof item === 'string' ? item : item.email))
          .filter(Boolean)
          .map(normalizeEmail);

        if (isActive) {
          setStudentEmails(emails);
          setError('');
        }
      } catch (err) {
        if (isActive) {
          setError(err.response?.data?.msg || 'Failed to load registered user emails');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadStudentEmails();

    return () => {
      isActive = false;
    };
  }, []);

  const isStudentEmailValid = useCallback(
    (value) => {
      const email = normalizeEmail(value || '');
      if (!email) return false;
      return studentEmails.includes(email);
    },
    [studentEmails]
  );

  return { loading, error, isStudentEmailValid };
};

export default useStudentEmailValidation;
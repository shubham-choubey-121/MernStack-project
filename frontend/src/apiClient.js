const API_URL = 'http://localhost:5000/api';

export const fetchTest = async () => {
  const res = await fetch(`${API_URL}/test`);
  return res.json();
};

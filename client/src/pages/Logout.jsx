import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = `DocsNest : Logout`;
  }, []);

  useEffect(() => {
    localStorage.setItem("token", "");
    navigate("/login");
  }, [navigate]);

  return null; // Or you can show a loading spinner/message
}

export default Logout;

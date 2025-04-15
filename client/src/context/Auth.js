import axios from 'axios';
import React, { createContext, useCallback, useEffect, useState } from 'react';

const Auth = createContext();

function AuthProvider({ children }) {
  const [userData, setUserData] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const APP_URI = process.env.REACT_APP_URL;

  const userInfo = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUserLoading(false);
      setUserData('');
      setIsAuthenticated(false);
      return;
    }

    try {
      setUserLoading(true);
      const response = await axios.get(`${APP_URI}/user/fetchuserdata`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      console.log(response.data.msg)
      setUserData(response.data.msg);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      // Optionally clear token if it's invalid
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        localStorage.removeItem("token");
      }
    } finally {
      setUserLoading(false);
    }
  }, [APP_URI]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUserData('');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    userInfo();
  }, [userInfo]);

  return (
    <Auth.Provider value={{ userData, userLoading, userInfo, isAuthenticated, logout }}>
      {children}
    </Auth.Provider>
  );
}

export { AuthProvider, Auth };
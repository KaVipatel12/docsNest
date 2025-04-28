import axios from 'axios';
import React, { createContext, useCallback, useEffect, useState } from 'react';

const Auth = createContext();

function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fileSharingNotification , setFileSharingNotification] = useState(false) 
  const APP_URI = process.env.REACT_APP_URL;
  const token = localStorage.getItem("token");
  const userInfo = useCallback(async () => {
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
            
      // Check for unseen file shares
      const unseenFiles = response.data.msg.fileSharing
        ?.flatMap(file => 
          file.sharedWith.filter(share => share.seen === false)
        ) || [];
      
      // Check for unseen folder shares
      const unseenFolders = response.data.msg.folderSharing
        ?.flatMap(folder => 
          folder.sharedWith.filter(share => share.seen === false)
        ) || [];
          
      // Set notification flag to true if either files or folders have unseen items
      const hasUnseen = unseenFiles.length > 0 || unseenFolders.length > 0;
      setFileSharingNotification(hasUnseen);
      
      if (response.data && response.data.msg) {
        setUserData(response.data.msg);
        setIsAuthenticated(true);
      } else {
        setUserData(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUserData(null);
      setIsAuthenticated(false);
    } finally {
      setUserLoading(false);
    }
  }, [APP_URI, token]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUserData('');
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    userInfo();
  }, [userInfo]);

  return (
    <Auth.Provider value={{ userData, userLoading, userInfo, isAuthenticated, logout, fileSharingNotification, setFileSharingNotification }}>
      {children}
    </Auth.Provider>
  );
}

export { AuthProvider, Auth };
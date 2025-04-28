import axios from 'axios';
import React, { createContext, useCallback, useEffect, useState } from 'react';

const Auth = createContext();

function AuthProvider({ children }) {
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true); // Start with loading true
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [fileSharingNotification, setFileSharingNotification] = useState(false);
  const APP_URI = process.env.REACT_APP_URL;
  
  const userInfo = useCallback(async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setUserLoading(false);
      setUserData(null);
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
      
      // Extract user data
      const userData = response.data.msg;
      
      // Initialize flags
      let hasUnseenFiles = false;
      let hasUnseenFolders = false;
      // Check files shared WITH current user
      if (userData.fileSharing && Array.isArray(userData.fileSharing)) {
        for (const file of userData.fileSharing) {
          if (file.sharedWith && Array.isArray(file.sharedWith)) {
            for (const share of file.sharedWith) {
              // If any share has seen: false, set notification flag
              if (share.seen === false) {
                hasUnseenFiles = true;
                break; // Exit inner loop
              }
            }
            if (hasUnseenFiles) break; // Exit outer loop if unseen found
          }
        }
      }
      
      // Check folders shared WITH current user
      if (!hasUnseenFiles && userData.folderSharing && Array.isArray(userData.folderSharing)) {
        for (const folder of userData.folderSharing) {
          if (folder.sharedWith && Array.isArray(folder.sharedWith)) {
            for (const share of folder.sharedWith) {
              // If any share has seen: false, set notification flag
              if (share.seen === false) {
                hasUnseenFolders = true;
                break; // Exit inner loop
              }
            }
            if (hasUnseenFolders) break; // Exit outer loop if unseen found
          }
        }
      }
      
      // Final notification state - true if either files or folders have unseen items
      const hasUnseen = hasUnseenFiles || hasUnseenFolders;
      
      console.log("Notification check:", { 
        hasUnseenFiles, 
        hasUnseenFolders, 
        finalNotificationState: hasUnseen 
      });
      
      // Update notification state
      setFileSharingNotification(hasUnseen);
      // Set user data and authentication state
      setUserData(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
      setIsAuthenticated(false);
    } finally {
      setUserLoading(false);
    }
  }, [APP_URI]);

  const logout = useCallback(() => {
    console.log("Logging out");
    localStorage.removeItem("token");
    setUserData(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    console.log("Auth Provider mounted, fetching user info");
    userInfo();
  }, [userInfo]);

  // Provide auth state for debugging
  console.log("Auth state:", { isLoading: userLoading, isAuthenticated, hasUserData: !!userData });

  return (
    <Auth.Provider value={{ 
      userData, 
      userLoading, 
      userInfo, 
      isAuthenticated, 
      logout, 
      fileSharingNotification, 
      setFileSharingNotification 
    }}>
      {children}
    </Auth.Provider>
  );
}

export { AuthProvider, Auth };
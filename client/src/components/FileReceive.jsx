import React, { useCallback, useEffect, useState } from 'react';
import { File, Folder, Check } from 'lucide-react';
import "../filereceive.css";
import axios from 'axios';

function FileReceive() {
  const [receivedFiles, setReceivedFiles] = useState([]);
  const [receivedFolders, setReceivedFolders] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [folderLoading, setFolderLoading] = useState(true);
  const token = localStorage.getItem("token");
  const APP_URI = process.env.REACT_APP_URL;

  const fetchFiles = useCallback(async () => {
    setFilesLoading(true);
    try {
      const response = await axios.get(`${APP_URI}/filesharing/receivefile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Files:", response.data.msg);
      setReceivedFiles(response.data.msg);
    } catch (error) {
      console.error("Error fetching files:", error);
      setReceivedFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, [APP_URI, token]);
        
  const fetchFolders = useCallback(async () => {
    setFolderLoading(true);
    try {
      const response = await axios.get(`${APP_URI}/filesharing/receivefolder`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log("Folders:", response.data.msg);
      setReceivedFolders(response.data.msg);
    } catch (error) {
      console.error("Error fetching folders:", error);
      setReceivedFolders([]);
    } finally {
      setFolderLoading(false);
    }
  }, [APP_URI, token]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleAcceptFile = async (fileId) => {
    try {
      await axios.post(`${APP_URI}/user/filesharing/acceptfile/${fileId}`, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh files after accepting
      fetchFiles();
    } catch (error) {
      console.error("Error accepting file:", error);
    }
  };

  const handleAcceptFolder = async (folderId) => {
    try {
      await axios.post(`${APP_URI}/user/filesharing/acceptfolder/${folderId}`, {}, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh folders after accepting
      fetchFolders();
    } catch (error) {
      console.error("Error accepting folder:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const isLoading = filesLoading || folderLoading;
  const hasNoItems = !isLoading && receivedFiles.length === 0 && receivedFolders.length === 0;

  return (
    <div className="file-receive-container">
      <h1 className="file-receive-heading">Received Files & Folders</h1>
      
      {isLoading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div>
          {/* Display Files */}
          {receivedFiles.length > 0 && receivedFiles.map((file) => (
            <div key={file._id} className="file-item">
              <div className="file-icon-container">
                <File size={40} color="white" />
                <div className="file-details">
                  <div className="file-name">{file.fileName || "" } </div>
                  <div className="file-info">
                    Sent by <span className="highlight">{file.uploadedBy.email || ""}</span> • 
                    <span className="highlight">{formatDate(file.uploadedAt) || ""}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleAcceptFile(file._id)}
                className="accept-button"
              >
                <Check size={16} />
                <span>Accept</span>
              </button>
            </div>
          ))}

          {/* Display Folders */}
          {receivedFolders.length > 0 && receivedFolders.map((folder) => (
            <div key={folder._id} className="file-item">
              <div className="file-icon-container">
                <Folder size={40} color="white" />
                <div className="file-details">
                  <div className="file-name">{folder.folderName}</div>
                  <div className="file-info">
                    Sent by <span className="highlight">{folder.createdBy.email || ""}</span> • 
                    <span className="highlight">{formatDate(folder.createdAt) || ""}</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => handleAcceptFolder(folder._id)}
                className="accept-button"
              >
                <Check size={16} />
                <span>Accept</span>
              </button>
            </div>
          ))}
        </div>
      )}
      
      {hasNoItems && (
        <div className="empty-state">
          No files or folders have been shared with you yet.
        </div>
      )}
    </div>
  );
}

export default FileReceive;
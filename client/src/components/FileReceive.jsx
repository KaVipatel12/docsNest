import React, { useCallback, useEffect, useState } from 'react';
import { File, Folder, Check, X } from 'lucide-react';
import "../filereceive.css";
import axios from 'axios';
import { toast } from 'react-toastify';

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

  const handleAcceptFile = async (shareId, title, description) => {
    try {
      const response = await axios.post(`${APP_URI}/user/addnote`, {
        shareId, title, description
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      fetchFiles();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg); 
      } else if (error.request) {
        toast.error("No response from the server. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleAcceptFolder = async (folderName, senderId) => {
    try {
      const response = await axios.post(`${APP_URI}/filesharing/acceptfolder`, {
        folderName, senderId
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      fetchFolders();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg); 
      } else if (error.request) {
        toast.error("No response from the server. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleRejectFolder = async (folderId) => {
    try {
      const response = await axios.post(`${APP_URI}/filesharing/rejectfolder`, {
        folderId
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      fetchFolders();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg); 
      } else if (error.request) {
        toast.error("No response from the server. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleRejectFile = async (fileId) => {
    try {
      const response = await axios.post(`${APP_URI}/filesharing/rejectfile`, {
        fileId
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success(response.data.msg);
      fetchFiles(); // Fixed: was calling fetchFolders() instead
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg); 
      } else if (error.request) {
        toast.error("No response from the server. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
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
                <File size={40} color="white" className="file-icon" />
                <div className="file-details">
                  <div className="file-name">{file.fileName || ""}</div>
                  <div className="file-info">
                    Sent by <span className="highlight">{file.uploadedBy.email || ""}</span> • 
                    <span className="highlight">{formatDate(file.uploadedAt) || ""}</span>
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => handleAcceptFile(file._id, file.fileName, file.content)}
                  className="accept-button"
                  aria-label="Accept file"
                >
                  <Check size={16} />
                  <span>Accept</span>
                </button>
                <button 
                  onClick={() => handleRejectFile(file._id)}
                  className="reject-button"
                  aria-label="Reject file"
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}

          {/* Display Folders */}
          {receivedFolders.length > 0 && receivedFolders.map((folder) => (
            <div key={folder._id} className="file-item">
              <div className="file-icon-container">
                <Folder size={40} color="white" className="file-icon" />
                <div className="file-details">
                  <div className="file-name">{folder.folderName}</div>
                  <div className="file-info">
                    Sent by <span className="highlight">{folder.createdBy.email || ""}</span> • 
                    <span className="highlight">{formatDate(folder.createdAt) || ""}</span>
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  onClick={() => handleAcceptFolder(folder.folderName, folder.createdBy._id)}
                  className="accept-button"
                  aria-label="Accept folder"
                >
                  <Check size={16} />
                  <span>Accept</span>
                </button>
                <button 
                  onClick={() => handleRejectFolder(folder._id)}
                  className="reject-button"
                  aria-label="Reject folder"
                >
                  <X size={16} />
                  <span>Reject</span>
                </button>
              </div>
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
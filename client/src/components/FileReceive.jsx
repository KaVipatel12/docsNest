import React, {useCallback, useContext, useEffect, useState} from 'react';
import { File, Folder, Check, X } from 'lucide-react';
import "../filereceive.css";
import axios from 'axios';
import { toast } from 'react-toastify';
import { Auth } from '../context/Auth';

function FileReceive() {
  const token = localStorage.getItem("token");
  const [receivedFiles, setReceivedFiles] = useState([])
  const [receivedFolders, setReceivedFolders] = useState([])
  const [receiveFilesLoading , setReceiveFilesLoading] = useState(true)
  const [receiveFoldersLoading , setReceiveFoldersLoading] = useState(true)
  const {setFileSharingNotification} = useContext(Auth)
  const APP_URI = process.env.REACT_APP_URL;

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
  const fetchReceiveFiles = useCallback(async () => {         // fetching the received file by sharing 
    setReceiveFilesLoading(true);
    try {
      const response = await axios.get(`${APP_URI}/filesharing/receivefile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log(response.data.msg)
      setReceivedFiles(response.data.msg);
// .map(share => ({
//   fileId: file._id,
//   fileName: file.fileName,
//   uploadedBy: file.uploadedBy,
//   userId: share.userId,
//   seen: share.seen,
//   status: share.status
// }))

// To verify the value you're setting:
    } catch (error) {
      console.error("Error fetching files:", error);
      setReceivedFiles([]);
    } finally {
      setReceiveFilesLoading(false);
    }
  }, [APP_URI, token, setReceiveFilesLoading, setReceivedFiles]);
        
  const fetchReceiveFolders = useCallback(async () => {              // fetching the received file by sharing
    setReceiveFoldersLoading(true);
    try {
      const response = await axios.get(`${APP_URI}/filesharing/receivefolder`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setReceivedFolders(response.data.msg);
      setFileSharingNotification(false); 
    } catch (error) {
      console.error("Error fetching folders:", error);
      setReceivedFolders([]);
    } finally {
      setReceiveFoldersLoading(false);
    }
  }, [APP_URI, token, setReceiveFoldersLoading , setReceivedFolders, setFileSharingNotification]);

  useEffect(() => {
    fetchReceiveFiles()
  }, [fetchReceiveFiles])
  useEffect(() => {
    fetchReceiveFolders()
  }, [fetchReceiveFolders])

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
      fetchReceiveFiles();
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
      fetchReceiveFolders();
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
      fetchReceiveFolders();
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
      fetchReceiveFiles(); // Fixed: was calling fetchFolders() instead
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

  const receiveSeen = useCallback(async(files, folders) => {
    try {
      await axios.patch(`${APP_URI}/filesharing/markseen`, {
        files , folders
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      }
  }, [APP_URI , token])

  useEffect(() => {
    fetchReceiveFiles();
  }, [fetchReceiveFiles]);

  useEffect(() => {
    fetchReceiveFolders();
  }, [fetchReceiveFolders]);

  useEffect(() => {
    if (
      !receiveFilesLoading &&
      !receiveFoldersLoading &&
      (receivedFiles?.length > 0 || receivedFolders?.length > 0)
    ){
      const receiveFilesId = receivedFiles.map(file => ({
        fileName: file.fileName,
        sendId: file.uploadedBy 
      }));
  
      const receiveFoldersId = receivedFolders.map(folder => ({
        folderName: folder.folderName,
        sendId: folder.createdBy 
      }));
  
      let files = receiveFilesId; 
      let folders = receiveFoldersId;
  
      receiveSeen(files , folders);
    }
  }, [
    receiveFilesLoading,
    receiveFoldersLoading,
    receivedFiles,
    receivedFolders,
    receiveSeen
  ]);

  const isLoading = receiveFilesLoading || receiveFoldersLoading;
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
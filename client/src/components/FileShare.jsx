import { React, useCallback, useContext, useEffect, useState } from "react";
import "../filesharing.css";
import { Auth } from "../context/Auth";
import axios from "axios";
import { toast } from "react-toastify";

function FileShare() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { userData} = useContext(Auth);
  const token = localStorage.getItem("token");
  const APP_URI = process.env.REACT_APP_URL;
  // State for files and folders
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [shareLoading, setShareLoading] = useState(false)
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filesLoading, setFilesLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFiles(userData.notes);
    }
  }, [userData, files]);
  // Fetch users based on search term
  useEffect(() => {
    // Only fetch when search term is not empty and has at least 2 characters
    if (searchTerm.length >= 2) {
      setLoading(true);
      setError(null);

      const timeoutId = setTimeout(async () => {
        try {
          const response = await axios.post(
            `${APP_URI}/user/fetchallusers`,
            { queryEmail: searchTerm },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setUsers(response.data.msg);
        } catch (error) {
          setUsers([]);
        } finally {
          setLoading(false);
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      setUsers([]);
    }
  }, [searchTerm, APP_URI]);

  
  // Function to fetch files and folders from backend
  const fetchFolder = useCallback(async () => {
    setFilesLoading(true);
    try {
      const response = await axios.get(`${APP_URI}/user/file/fetchfolder`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data.msg)) {
        setFolders(response.data.msg);
      } else {
        setFolders([]);
      }
    } catch (error) {
      setFolders([]);
    } finally {
      setFilesLoading(false);
    }
  }, [APP_URI, token]);

  // Fetch files and folders when component mounts
  useEffect(() => {
    fetchFolder();
  }, [fetchFolder]);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserClick = (user) => {
    // Check if user is already selected
    const isSelected = selectedUsers.some(
      (selectedUser) => selectedUser._id === user._id
    );

    if (isSelected) {
      // If user is already selected, remove them from the array
      setSelectedUsers(
        selectedUsers.filter((selectedUser) => selectedUser._id !== user._id)
      );
    } else {
      // If user is not selected, add them to the array
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  // Handle file selection
  const handleFileClick = (file) => {
    const isSelected = selectedFiles.some(
      (selectedFile) => selectedFile.id === file.id
    );

    if (isSelected) {
      setSelectedFiles(
        selectedFiles.filter((selectedFile) => selectedFile.id !== file.id)
      );
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  // Handle folder selection
  const handleFolderClick = (folder) => {
    const isSelected = selectedFolders.some(
      (selectedFolder) => selectedFolder.id === folder.id
    );

    if (isSelected) {
      setSelectedFolders(
        selectedFolders.filter(
          (selectedFolder) => selectedFolder.id !== folder.id
        )
      );
    } else {
      setSelectedFolders([...selectedFolders, folder]);
    }
  };

  // Check if a user is in the selected array
  const isUserSelected = (userId) => {
    return selectedUsers.some((user) => user._id === userId);
  };

  // Check if a file is selected
  const isFileSelected = (fileId) => {
    return selectedFiles.some((file) => file._id === fileId);
  };

  // Check if a folder is selected
  const isFolderSelected = (folderId) => {
    return selectedFolders.some((folder) => folder === folderId);
  };

  // Function to handle refresh of files and folders
  const handleRefresh = () => {
    fetchFolder();
  };

  const handleShare = () => {
    if (selectedFiles.length === 0 && selectedFolders.length === 0) {
      return toast.warning("Select a file or a folder to share");
    }

    if (selectedUsers.length === 0) {
      return toast.warning("Select a user to share the files");
    }

    try {
    setShareLoading(true)
      axios.post(
        `${APP_URI}/filesharing/sharefileandfolder`,
        {
          fileName: selectedFiles.map((file) => file._id),
          folderName: selectedFolders.map((folder) => folder),
          receiverId: selectedUsers.map((user) => user._id),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Files shared successfully");
      setUsers([])
      setSelectedFiles([])
       setSearchTerm("");
      setSelectedFolders([])

    } catch (error) {
      toast.error({ msg: "There is some error." });
    }finally{
      setShareLoading(false)
  };
  }

  return (
    <>
        <div className="file-share-container">
      <h1 className="file-share-title">Share Files</h1>

      {/* Search Bar Section */}
      <div className="search-section">
        <div className="search-container">
          <h2 className="search-heading">Search Users using email</h2>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="loading-indicator">
              <div className="loading-text">Loading...</div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Search results */}
          {users.length > 0 && (
            <div className="results-container">
              <h3 className="results-heading">Results:</h3>
              <div className="results-list">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className={`user-card ${
                      isUserSelected(user._id) ? "user-card-selected" : ""
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <p className="user-username">@{user.username}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {searchTerm.length >= 2 && !loading && users.length === 0 && (
            <div className="no-results">
              <p>No users found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Users Section */}
      <div className="selected-users-container">
        <h2 className="components-heading">Selected Users</h2>
        <div className="selected-users-list">
          {selectedUsers.length > 0 ? (
            selectedUsers.map((user) => (
              <div key={user._id} className="selected-user-card">
                <p className="user-name">{user.username}</p>
                <button
                  className="remove-user-button"
                  onClick={() => handleUserClick(user)}
                ></button>
              </div>
            ))
          ) : (
            <p className="no-selected-users">No users selected</p>
          )}
        </div>
      </div>

      {/* Files and Folders Container */}
      <div className="custom-components-container">
        <div className="files-header">
          <h2 className="components-heading">Files and Folders</h2>
          <button onClick={handleRefresh} className="refresh-button">
            🔄 Refresh
          </button>
        </div>
        {/* Loading indicator for files/folders */}
        {filesLoading && (
          <div className="loading-indicator">
            <div className="loading-text">Loading files and folders...</div>
          </div>
        )}

        {/* Files Section */}
        <div className="files-container">
          <h3 className="section-heading">Files</h3>
          {files.length > 0 ? (
            <div className="files-grid">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`file-card ${
                    isFileSelected(file._id) ? "file-card-selected" : ""
                  }`}
                  onClick={() => handleFileClick(file)}
                >
                  <div className="file-icon">📄</div>
                  <p className="file-name">{file.title}</p>
                </div>
              ))}
            </div>
          ) : (
            !filesLoading && (
              <div className="no-items">
                <p>No files available</p>
              </div>
            )
          )}
        </div>

        {/* Folders Section */}
        <div className="folders-container">
          <h3 className="section-heading">Folders</h3>
          {folders.length > 0 ? (
            <div className="folders-grid">
              {folders.map((folder, sr) => (
                <div
                  key={sr}
                  className={`folder-card ${
                    isFolderSelected(folder) ? "folder-card-selected" : ""
                  }`}
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="folder-icon">📁</div>
                  <p className="folder-name">{folder}</p>
                </div>
              ))}
            </div>
          ) : (
            !filesLoading && (
              <div className="no-items">
                <p>No folders available</p>
              </div>
            )
          )}
        </div>

        {/* Selected Items Display */}
        <div className="selected-items-container">
          <h3 className="section-heading">Selected Items</h3>

          {/* Selected Files */}
          <div className="selected-section">
            <h4 className="selection-type">Files ({selectedFiles.length})</h4>
            <div className="selected-items-list">
              {selectedFiles.length > 0 ? (
                selectedFiles.map((file) => (
                  <div key={file.id} className="selected-item-card">
                    <p className="item-name">📄 {file.name}</p>
                    <button
                      className="remove-item-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileClick(file);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-selected-items">No files selected</p>
              )}
            </div>
          </div>

          {/* Selected Folders */}
          <div className="selected-section">
            <h4 className="selection-type">
              Folders ({selectedFolders.length})
            </h4>
            <div className="selected-items-list">
              {selectedFolders.length > 0 ? (
                selectedFolders.map((folder) => (
                  <div key={folder.id} className="selected-item-card">
                    <p className="item-name">📁 {folder.name}</p>
                    <button
                      className="remove-item-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFolderClick(folder);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-selected-items">No folders selected</p>
              )}
            </div>
            <div className="button-box">
                <button 
                className="btn btn-primary" 
                onClick={handleShare} 
                disabled={shareLoading}
                >
                {shareLoading ? "Sharing..." : "Share"} 
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default FileShare;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

function SettingsModal({ 
  isOpen, 
  onClose, 
  isPublic, 
  toggleVisibility,
  isUpdate,
  userData,
  fileName,
  folder,
  noteId,
  title,
  description,
  token,
  APP_URI,
  userInfo,
  currentPassword
}) {
  const [visibility, setVisibility] = useState(isPublic);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);
  
  useEffect(() => {
    console.log("Here is the current" , currentPassword)
    currentPassword ? setPassword(currentPassword) : setPassword("") 
  }, [currentPassword])
  // Update local state when prop changes
  useEffect(() => {
    setVisibility(isPublic);
  }, [isPublic]);

  const handleToggleChange = async () => {
    // Toggle local state immediately for UI feedback
    const newVisibility = !visibility;
    setVisibility(newVisibility);
    
    // Notify parent component of the change
    toggleVisibility(newVisibility);
    
    // Don't send requests if it's a new file/note that hasn't been saved yet
    if (!isUpdate) return;
    
    setLoading(true);
    
    try {
      if (folder) {
        // For files within folders
       await axios.post(
          `${APP_URI}/user/modifyfolderfileaccess`,
          {
            fileName,
            folderName: folder,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // For standalone notes
        await axios.post(
          `${APP_URI}/user/modifyfileaccess`,
          {
           title
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      
      toast.success("Visibility updated successfully");
      userInfo(); // Refresh user data
    } catch (error) {
      toast.error("Failed to update visibility. Please try again.");
      // Revert the visibility state on error
      setVisibility(!newVisibility);
      toggleVisibility(!newVisibility);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    setSubmittingPassword(true);
    
    try {
      // Modify this to your actual API endpoint for setting a password
      await axios.patch(
        `${APP_URI}/filesharing/setsharefilepassword`,
        {
          fileName: noteId || fileName,
          folderId: folder || null,
          password: password
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      toast.success("Password set successfully");
    } catch (error) {
      console.log(error.response)
      toast.error("Failed to set password. Please try again.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Generate shareable link
  const getShareableLink = () => {
    const baseURL = window.location.origin;
    return folder 
      ? `${baseURL}/sharedFile/${userData?._id}/${folder.split(" ").join("_")}/${fileName.split(" ").join("_")}` 
      : `${baseURL}/sharedFile/${userData?._id}/${fileName.split(" ").join("_")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">File Settings</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose} 
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {/* Visibility Toggle Section */}
            <div className="form-check form-switch mb-3">
              <input 
                className="form-check-input" 
                type="checkbox" 
                id="visibilityToggle" 
                checked={visibility} 
                onChange={handleToggleChange}
                disabled={loading}
              />
              <label className="form-check-label" htmlFor="visibilityToggle">
                {visibility ? "Public" : "Private"}
                {loading && <small className="ms-2 text-muted">(Updating...)</small>}
              </label>
              <p className="text-muted small mt-1">
                {visibility 
                  ? "Anyone with the link can view this file" 
                  : "Only you can view this file"}
              </p>
            </div>
            
            {/* Password Protection Section */}
            <div className="mt-4 mb-3">
              <label htmlFor="passwordInput" className="form-label">Password Protection</label>
              <div className="input-group">
                <input 
                  type="password"
                  className="form-control" 
                  id="passwordInput"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submittingPassword}
                />
                <button 
                  className="btn btn-success" 
                  onClick={handlePasswordSubmit}
                  disabled={submittingPassword}
                >
                  {submittingPassword ? "Submitting..." : "Set Password"}
                </button>
              </div>
              <p className="text-muted small mt-1">
                You can share this password to collaborate with your team
              </p>
            </div>
            
            {/* Share Link Section */}
            {isUpdate && visibility && (
              <div className="mt-3 p-2 bg-light rounded">
                <p className="mb-1 fw-bold">Share Link:</p>
                <small className="text-muted d-block text-truncate">
                  {getShareableLink()}
                </small>
                <button 
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(getShareableLink());
                    toast.success("Link copied to clipboard!");
                  }}
                >
                  Copy Link
                </button>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
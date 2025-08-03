import React, { useCallback, useEffect, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "react-toastify";
import "../SharedPage.css"
function SharedPage() {
  const { userId, fileName, folderName } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  
  let newFileName = fileName?.split("_").join(" ");
  let newFolderName = folderName?.split("_").join(" ");

  const fetchFile = useCallback(async () => {
    let API = folderName 
      ? `${process.env.REACT_APP_URL}/filesharing/share/${userId}/${newFolderName}/${newFileName}` 
      : `${process.env.REACT_APP_URL}/filesharing/share/${userId}/${newFileName}`;

    try {
      const response = await axios(API);
      setTitle(response.data.msg.title || newFileName);
      setDescription(response.data.msg.description || response.data.msg);
    } catch (err) {
      toast.error("Access denied");
    } finally {
      setLoading(false);
    }
  }, [folderName, newFileName, newFolderName, userId]);

  useEffect(() => {
    fetchFile();
  }, [fetchFile]);

  const handleEditClick = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/filesharing/verifyfilepassword` , { password , file : fileName, folder : folderName || null });
      if (response.data.msg) {
        setIsEditable(true);
        setShowPasswordModal(false);
        toast.success("Password verified! You can now edit the file.");
      } else {
        toast.error("Incorrect password");
      }
    } catch (err) {
      toast.error("Failed to verify password");
    }
  };

  const handleVerifyPrivateFile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_URL}/filesharing/verifyfilepassword`, { password , file : fileName, folder : folderName || null });
      if (response.data.msg) {
        setTitle(response.data.msg.title || newFileName);
        setDescription(response.data.msg.description || response.data.file.content);
        setIsEditable(true); // Allow editing immediately after successful verification
        setShowPasswordModal(false);
        toast.success("Access granted!");
      } else {
        toast.error("Incorrect password");
      }
    } catch (err) {
      toast.error("Failed to verify password");
    }
  };

  const handleContentChange = (field, value) => {
    if (field === 'title') {
      setTitle(value);
    } else if (field === 'description') {
      setDescription(value);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Nav />

      {title?.length > 0 ? (
        <div className="notepad">
          <div className="file-title-container">
            <textarea
              className="title-area"
              value={title}
              onChange={(e) => isEditable && handleContentChange('title', e.target.value)}
              placeholder="Title"
              disabled={!isEditable}
            />
            {!isEditable && (
              <button 
                className="edit-button" 
                onClick={handleEditClick}
              >
                Edit
              </button>
            )}
          </div>
          <textarea
            className="note-area"
            value={description}
            onChange={(e) => isEditable && handleContentChange('description', e.target.value)}
            rows="10"
            cols="30"
            disabled={!isEditable}
          />
          {isEditable && <button className="btn"> update </button> }
        </div>
      ) : (
        <main className="main-container">
          <div className="card-container">
            <div className="private-file-box">
              <h1>This File is Private</h1>
              <p>You need to verify password to access this file.</p>
              <button 
                className="verify-button" 
                onClick={handleEditClick}
              >
                Verify Password
              </button>
            </div>
          </div>
        </main>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="password-modal">
            <div className="modal-header">
              <h2>{title?.length > 0 ? "Enter Password to Edit" : "Enter Password to Access"}</h2>
              <button className="close-button" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <form onSubmit={title?.length > 0 ? handlePasswordSubmit : handleVerifyPrivateFile}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoFocus
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button type="submit">Verify</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default SharedPage;
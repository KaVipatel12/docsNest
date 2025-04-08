import React, { useCallback, useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Auth } from "../context/Auth";
import Modal from "../components/Modal";
import { toast } from 'react-toastify';
import LoadingSpinner from "../components/LoadingSpinner";
import LoggedInErrorPage from "../components/LoggedInErrorPage";
import LoadingButton from "../components/LoadingButton";

function FileMainPage() {
  const APP_URI = process.env.REACT_APP_URL
  const token = localStorage.getItem("token");
  const { noteId, folderName } = useParams();
  const navigate = useNavigate();
  const { userData, userInfo, userLoading } = useContext(Auth);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState({ save: false, update: false, delete: false });

  const fileName = noteId?.split("_").join(" ");
  const folder = folderName?.split("_").join(" ");
;

useEffect(() => {
  document.title = `DocsNest : File`;
}, []);

  useEffect(() => {
    if (!userLoading) {
      setUser(userData || "");
      setLoading(false);
    }
  }, [userData, userLoading]);

  useEffect(() => {
    if (userData && fileName && !folder) {
      const foundNote = userData.notes.find(note => note._id === noteId);
      if (foundNote) {
        setTitle(foundNote.title);
        setDescription(foundNote.description);
      }
    }
  }, [userData, fileName, folder, noteId]);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.post(
        `${APP_URI}/user/file/fetchfilecontent`,
        { folderName: folder, fileName: fileName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDescription(response.data.msg);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while fetching file content.");
    }
  }, [folder, fileName, token, APP_URI]);

  useEffect(() => {
    if (folder && fileName && fileName !== "0") {
      setTitle(fileName);
      fetchFiles();
    }
  }, [fetchFiles, folder, fileName]);

  const handleFileSubmit = async () => {
    if (!title || !description) {
      toast.warning("Please fill in both title and note.");
      return;
    }
    if (title?.length >= 20) {
      toast.warning("Title should be less than 20 characters.");
      return;
    }
    setBtnLoading(prev => ({ ...prev, save: true }));

    try {
      const response = await axios.post(
        `${APP_URI}/user/file/createfile`,
        { content: description, fileName: title, folderName: folder },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.msg);
      userInfo();
    } catch (error) {
      console.error(error);
      toast.error("Error saving note. Please try again.");
    }
    setBtnLoading(prev => ({ ...prev, save: false }));
  };

  const handleNoteSubmit = async () => {
    if (!title || !description) {
      toast.warning("Please fill in both title and note.");
      return;
    }
    if (title?.length >= 20) {
      toast.warning("Title should be less than 20 characters.");
      return;
    }
    setBtnLoading(prev => ({ ...prev, save: true }));
    try {
      const response = await axios.post(
        `${APP_URI}/user/addnote` ,
        { description , title },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.msg);
      userInfo();
    } catch (error) {
      console.error(error);
      toast.error("Error saving note. Please try again.");
    }
    setBtnLoading(prev => ({ ...prev, save: false }));
  };

  const handleUpdateFile = async () => {
    if (!title || !description) {
      toast.warning("Please fill in both title and note.");
      return;
    }
    if (title?.length >= 20) {
      toast.warning("Title should be less than 20 characters.");
      return;
    }
    setBtnLoading(prev => ({ ...prev, update: true }));
    try {
      const response = await axios.patch(
        `${APP_URI}/user/file/updatefilecontent`,
        {
          newFileName: title,
          newContent: description,
          oldFileName: fileName,
          folderName: folder,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.msg);
      userInfo();
    } catch (error) {
      console.error(error);
      toast.error("Error updating file. Please try again.");
    }
    setBtnLoading(prev => ({ ...prev, update: false }));
  };

  const handleUpdateNote = async () => {
    if (!title || !description) {
      toast.warning("Please fill in both title and note.");
      return;
    }
    if (title?.length >= 20) {
      toast.warning("Title should be less than 20 characters.");
      return;
    }
    setBtnLoading(prev => ({ ...prev, update: true }));
    try {
      const response = await axios.patch(
        `${APP_URI}/user/updatenote/${noteId}`,
        {
          newTitle: title,
          newDescription: description,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.msg);
      userInfo();
    } catch (error) {
      console.error(error);
      toast.error("Error updating note. Please try again.");
    }
    setBtnLoading(prev => ({ ...prev, update: false }));
  };

  const deleteNote = async () => {
    setBtnLoading(prev => ({ ...prev, delete: true }));
    try {
      const response = await axios.delete(
        `${APP_URI}/user/deletenote/${noteId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.msg);
      userInfo();
      navigate("/");
   } catch (error) {
      document.body.classList.remove("modal-open");
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((backdrop) => backdrop.remove());
      console.error(error);
      toast.error("Error deleting note.");
    }
    setBtnLoading(prev => ({ ...prev, delete: false }));
  };

  const deleteFile = async () => {
    setBtnLoading(prev => ({ ...prev, delete: true }));
    try {
      const response = await axios.patch(
        `${APP_URI}/user/file/deletefile`,
        {
          fileName: title,
          folderName: folder,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(response.data.msg);
      userInfo();
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Error deleting file. Please try again.");
    }
    setBtnLoading(prev => ({ ...prev, delete: false }));
  };

  const clearText = () => {
    setTitle("")
    setDescription("")
  }
  const clearWhiteSpace = () => {
    setTitle(title => title.replace(/\s+/g, ' ').trim())
    setDescription(description => description.replace(/\s+/g, ' ').trim())
  }
  if (loading) {
    return (
      <>
        <Nav />
        <LoadingSpinner />
      </>
    );
  } 
  
  if (!user && !userLoading) {
    return <LoggedInErrorPage />;
  }

  return (
    <>
      <Nav />
      <div className="notepad">
        <textarea
          className="title-area"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
        />
        <textarea
          className="note-area"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write your note here..."
          rows="10"
          cols="30"
        />
        <div className="file-buttons">
          {(fileName !== "0" && fileName) ? (
            btnLoading.update ? (
              <LoadingButton classButton="btn btn-success m-3" />
            ) : (
              <button
                onClick={folder ? handleUpdateFile : handleUpdateNote}
                className="btn btn-success"
              >
                Update
              </button>
            )
          ) : (
            btnLoading.save ? (
              <LoadingButton classButton="btn btn-success m-3" />
            ) : (
              <button
                onClick={(!folderName) ? handleNoteSubmit : handleFileSubmit}
                className="btn btn-success"
              >
                Save
              </button>
            )
          )}

          {fileName !== "0" && noteId && (
            btnLoading.delete ? (
              <LoadingButton classButton="btn btn-danger" />
            ) : (
              <Modal
                button={true}
                heading={"Delete the file permanently"}
                description={
                  "Do you really want to delete this file permanently? Once deleted you won't be able to recover it..."
                }
                buttonFunction={folder ? deleteFile : deleteNote}
                clickButton={"Delete File"}
              />
            )
          )}
        <button className="btn btn-primary" onClick={clearText}>clear</button>
        <button className="btn btn-primary" onClick={clearWhiteSpace}>clear space</button>
        </div>
      </div>
    </>
  );
}

export default FileMainPage;

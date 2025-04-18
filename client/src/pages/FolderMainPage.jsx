import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Card from "../components/Card";
import Nav from "../components/Nav";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import LoggedInErrorPage from "../components/LoggedInErrorPage";
import { Auth } from "../context/Auth";
import LoadingSpinner from "../components/LoadingSpinner";
import { isValidFolderName } from "../components/isValidFolderName";

function FolderMainPage() {
  const token = localStorage.getItem("token");
  const APP_URI = process.env.REACT_APP_URL
  const { folderName } = useParams();
  const navigate = useNavigate();

  const fileInputRef = useRef()

  const [files, setFiles] = useState([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { userData, userLoading} = useContext(Auth);
  const cleanedFolderName = folderName?.split("_").join(" ");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    document.title = `DocsNest : Folder`;
  }, []);

  // Handle loading & user state
  useEffect(() => {
    if (!userLoading) {
      setUser(userData || null); // set null if unauthenticated
      setLoading(false);
    }
  }, [userData, userLoading]);

  // Fetch files from folder
  const fetchFiles = useCallback(async () => {
    try {
      const response = await axios.post(
        `${APP_URI}/user/file/fetchfile`,
        { folderName: cleanedFolderName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const fileData = response.data.msg;
      if (Array.isArray(fileData)) {
        setFiles(fileData);
      } else {
        setFiles([]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Something went wrong");
    }
  }, [cleanedFolderName, APP_URI ,token]);

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [fetchFiles, user]);

  const updateName = async () => {
    if (!isValidFolderName(newFolderName)) return;
    try {
      await axios.patch(
        `${APP_URI}/user/file/updatefolder`,
        {
          oldName: cleanedFolderName,
          newName: newFolderName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Folder name updated");
      navigate(`/folder/${newFolderName.split(" ").join("_")}`);
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Something went wrong");
    }
  };

  const deleteFolder = async () => {
    try {
      await axios.patch(
        `${APP_URI}/user/file/deletefolder`,
        { folderName: cleanedFolderName },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Folder deleted");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.msg || "Something went wrong");
    }
  };

  const handleIconClick = () => {
  fileInputRef.current.click();
  }

  const handleFileChange = async (e) => {
    setLoading(true)
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderName", cleanedFolderName);
  
      const response = await axios.post(
        `${APP_URI}/user/file/uploadFile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          }
        }
      );
  
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
    }finally{
      setLoading(false)
    }
  };

    const onAddToFav = async (id) => {
      try{
        await axios.patch(`${APP_URI}/user/file/addfavourite/${id}`, {} ,{
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
          toast.success("Added");
          fetchFiles()
        } catch(error) {
          toast.error('Error')
      }
    }

  // Show spinner while loading
  if (loading) {
    return (
      <>
        <Nav />
        <LoadingSpinner />
      </>
    );
  }

  // Show error if user not logged in
  if (!user && !loading) {
    setTimeout(()=>{
      return <LoggedInErrorPage />;
    }, [3000])
  }

  return (
    <>
      <Nav searchQuery={setSearchQuery} />

      <div className="icon-header">
        <i
          className="ri-delete-bin-line icon file-icon"
          style={{ cursor: "pointer" }}
          data-bs-toggle="modal"
          data-bs-target="#deleteModal"
        ></i>
        <i
          className="ri-edit-2-line icon file-icon"
          style={{ cursor: "pointer" }}
          data-bs-toggle="modal"
          data-bs-target="#editModal"
        ></i>
        <Link to={`/file/${folderName}/0`} className="icon file-icon">
          <i className="ri-file-line"></i>
        </Link>
        <div  className="icon file-icon" onClick={handleIconClick}>
        <i className="ri-file-upload-line"></i>        
        </div>
              {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple={false} // ensures only one file
      />
      </div>

      <div className="card-container mt-3">
        {Array.isArray(files) && files.length > 0 ? (
          files
            .filter((file) =>
              file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((file) => (
              <Card
                img = "/Images/file.png"
                file={true}
                title={file.fileName}
                key={file.fileName}
                id={`${folderName}/${file.fileName.split(" ").join("_")}`}
                isFavorite= {file.isFavorite}
                onAddToFav={onAddToFav}
              />
            ))
        ) : (
          <p className="text-white text-center mt-4">
            No files found in this folder.
          </p>
        )}
      </div>

      {/* Edit Folder Name Modal */}
      <div
        className="modal fade"
        id="editModal"
        tabIndex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="editModalLabel">
                Edit Folder Name
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                placeholder="Enter new folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-primary" onClick={updateName}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Folder Modal */}
      <div
        className="modal fade"
        id="deleteModal"
        tabIndex="-1"
        aria-labelledby="deleteModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="deleteModalLabel">
                Delete Folder
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              Are you sure you want to delete the folder{" "}
              <strong>{cleanedFolderName}</strong>?
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button className="btn btn-danger" onClick={deleteFolder}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FolderMainPage;

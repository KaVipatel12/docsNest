import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import Nav from "../components/Nav";
import Card from "../components/Card";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { Auth } from "../context/Auth";
import axios from "axios";
import LoggedInErrorPage from "../components/LoggedInErrorPage";
import { toast } from "react-toastify";

function Home() {
  const [allNotes, setAllNotes] = useState([]);
  const [folder, setFolder] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const APP_URI = process.env.REACT_APP_URL;
  const token = localStorage.getItem("token");
  const [isAllEmpty, setIsAllEmpty] = useState(false);
  const { userData, userLoading, isAuthenticated, userInfo} = useContext(Auth);
  const [user, setUser] = useState("");
  
    useEffect(() => {
      document.title = `DocsNest : Home`;
    }, []);

  useEffect(() => {
    if (userData) {
      setUser(userData);
      setAllNotes(userData.notes || []);
    }
  }, [userData]);

  // Close modals on component unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("modal-open");
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((backdrop) => backdrop.remove());
    };
  }, []);

  const fetchFolder = useCallback(async () => {
    try {
      const response = await axios.get(`${APP_URI}/user/file/fetchfolder`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (Array.isArray(response.data.msg)) {
        setFolder(response.data.msg);
      } else {
        setFolder([]);
      }
    } catch (error) {
      setFolder([]);
    }
  }, [token, APP_URI]);
  
  useEffect(() => {
    fetchFolder();
  }, [fetchFolder]);
  
  const filteredNotes = allNotes.filter((note) =>
    note?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folder?.filter((folderName) =>
    folderName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  useEffect(() => {
    const isEmpty = filteredNotes.length === 0 && filteredFolders.length === 0;
    setIsAllEmpty(isEmpty);
  }, [filteredNotes, filteredFolders]);
  
  const fileInputRef = useRef()

  const handleIconClick = () => {
    fileInputRef.current.click();
    }

  // Uploading file and sending to the beckend to add the file
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file); 
  
    try {
      const response = await axios.post(
        `${APP_URI}/user/uploadfile`, 
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      toast.success(response.data.msg);
      userInfo();
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg);
      } else if (error.request) {
        toast.error("No response from the server. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  }
  
  if (user.length === 0 && !userLoading) {
    return <LoggedInErrorPage />;
  }
  
  // With this
  if (!isAuthenticated && !userLoading) {
    return <LoggedInErrorPage />;
  }

  const onAddToFav = async (id) => {
    try{
      await axios.patch(`${APP_URI}/user/addfavourite/${id}`, {} ,{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
        userInfo();
      } catch(error) {
        toast.error('Error')
    }
  }


 return (
    <>
      <Nav searchQuery={setSearchQuery} />

      <div className="icon-header">
      <div  className="icon file-icon" >
        <i className="ri-file-upload-line" onClick={handleIconClick}></i> 
        <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        multiple={false} // ensures only one file
      /> 
        </div>
        <Link
          to="/filesharing"
          className="icon file-icon"
          style={{ textDecoration: "none" }}
        >
        <i className="ri-stackshare-line"></i>        
        </Link>
        <Link
          to="/file"
          className="icon file-icon"
          style={{ textDecoration: "none" }}
        >
          <i className="ri-file-add-line"></i>
        </Link>
        <Modal button={false} />
      </div>
      <main className="main-container">
        <div className="card-container">
          {isAllEmpty ? (
             <div className="not-logged-in-box">
               <h1>No files or folders found</h1>
               <p>Looks like there's nothing here yet. Start by creating a new folder or uploading a file to get organized!</p>
           </div>
          ) : (
            <>
              {/* Filtered Files */}
              {filteredNotes.map((note) => (
                <Card
                  img="/Images/file.png"
                  file={true}
                  title={note.title}
                  description={note.description}
                  id={note._id}
                  key={note._id}
                  onAddToFav={onAddToFav}
                  isFavorite={note.favourite}
                />
              ))}

              {/* Filtered Folders */}
              <div className="folder-container card-container">
                {filteredFolders.map((name, idx) => (
                  <Card
                    img="/Images/folder.png"
                    title={name}
                    description=""
                    file={false}
                    id={name.split(" ").join("_")}
                    key={idx}
                    onAddToFav={onAddToFav}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default Home;

import React, { useCallback, useContext, useEffect, useState } from "react";
import Nav from "../components/Nav";
import Card from "../components/Card";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { Auth } from "../context/Auth";
import axios from "axios";
import LoggedInErrorPage from "../components/LoggedInErrorPage";

function Home() {
  const [allNotes, setAllNotes] = useState([]);
  const [folder, setFolder] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const APP_URI = process.env.REACT_APP_URL;
  const token = localStorage.getItem("token");
  const [isAllEmpty, setIsAllEmpty] = useState(false);
  const { userData, userLoading, isAuthenticated} = useContext(Auth);
  const [user, setUser] = useState("");

    useEffect(() => {
      document.title = `DocsNest : Home`;
    }, []);

  useEffect(() => {
    if (userData) {
      setUser(userData);
      setAllNotes(userData.notes || []);
      console.log(userData)
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
 

  if (user.length === 0 && !userLoading) {
    return <LoggedInErrorPage />;
  }
  
  // With this
  if (!isAuthenticated && !userLoading) {
    return <LoggedInErrorPage />;
  }

 return (
    <>
      <Nav searchQuery={setSearchQuery} />

      <div className="icon-header">
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

import React, { useCallback, useEffect, useState } from "react";
import Nav from "../components/Nav";
import axios from "axios";
import { useParams } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import { toast } from "react-toastify";

function SharedPage() {
  const {userId , fileName , folderName} = useParams()
  const [title , setTitle] = useState(""); 
  const [description , setDescription] = useState(""); 
  const [loading , setLoading] = useState(true)
  let newFileName = fileName?.split("_").join(" ")
  let newFolderName = folderName?.split("_").join(" ")

  
  const fetchFile =  useCallback(async () => {
    let API = folderName ? `${process.env.REACT_APP_URL}/filesharing/share/${userId}/${newFolderName}/${newFileName}` : `${process.env.REACT_APP_URL}/filesharing/share/${userId}/${newFileName}`

    try{
      const response = await axios(API)
      setTitle(response.data.msg.title || newFileName)
      setDescription(response.data.msg.description || response.data.msg)
    }catch(err){
      toast.error({msg : "Access denied"})
    }finally{
      setLoading(false)
    }
  }, [folderName , newFileName , newFolderName, userId])

  useEffect(() => {
    fetchFile(); 
  }, [fetchFile])

  if(loading){
    return(
      <LoadingSpinner></LoadingSpinner>
    )
  }
  return (
    <>
      <Nav />

     {title?.length > 0 ? (
      <div className="notepad">
        <div className="file-title-container">
          <textarea
            className="title-area"
            placeholder={title}
            disabled
          />
        </div>
        <textarea
          className="note-area"
          placeholder={description}
          rows="10"
          cols="30"
          disabled
        />
      </div>
     ) : (
      <main className="main-container">
        <div className="card-container">
             <div className="not-logged-in-box">
               <h1>The File is private</h1>
               <p>Either File settings is kept private by the user or there is some problem in you network connection. </p>
           </div>
           </div>
      </main>
     )
      }
    </>
  );
}

export default SharedPage;

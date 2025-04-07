import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '../context/Auth'
import { toast } from 'react-toastify'
import ModalPortal from './ModalPortal'
import LoadingButton from './LoadingButton'
import { isValidFolderName } from './isValidFolderName'

function Modal({button = true, heading , description, buttonFunction, clickButton}) {
    const [title , setTitle] = useState("")
    const [btnLoading, setBtnLoading] = useState(false);
    const {userInfo} = useContext(Auth)
    const APP_URI = process.env.REACT_APP_URL
    const navigate = useNavigate()
    const token = localStorage.getItem("token")

    const createFolder = async () => {
        if (!title) {
          toast.warning("Please enter a folder name.");
          return;
        }
        if (!isValidFolderName(title)) return;
        setBtnLoading(true);
        try {
          const response = await axios.post(`${APP_URI}/user/file/createfolder`, {
              folderName: title },
              {
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`,
                },
              }
            );
          toast.success(response.data.msg)
          userInfo(); // Refetch user info
          navigate(`/folder/${title}`); 
        } catch(error) {
          console.log(error)
          if (error.response) {
            console.error('Error:', error.response.data.message);
            toast.error(error.response.data.message); 
          } else if (error.request) {
            console.error('No response from server:', error.request);
            toast.error("No response from the server. Please try again.");
          } else {
            console.error('Error:', error.message);
            toast.error("Something went wrong. Please try again.");
          }
        }
        setBtnLoading(false);
    }

    return (
      <>
        {!button ? (
          <i className="icon folder-icon" data-bs-toggle="modal" data-bs-target="#exampleModal">
            <i className="ri-folder-add-line"></i>
          </i>
        ) : (
          <div className="btn btn-danger" data-bs-toggle="modal" data-bs-target="#exampleModal">
            {clickButton}
          </div>
        )}

        <ModalPortal>
          <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                {button ? (
                  <>
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="exampleModalLabel">{heading}</h1>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">{description}</div>
                  </>
                ) : (
                  <>
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="exampleModalLabel">Enter the folder name</h1>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                    </div>
                    <div className="modal-body">
                      <textarea
                        className="form-control folder-title"
                        placeholder="Folder name"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      ></textarea>
                    </div>
                  </>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  {button ? (
                    <button type="button" className="btn btn-danger" onClick={buttonFunction}>{clickButton}</button>
                  ) : (
                    btnLoading ? (
                      <LoadingButton classButton="btn btn-success" />
                    ) : (
                      <button type="button" className="btn btn-success" onClick={createFolder}>Create Folder</button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      </>
    );
}

export default Modal
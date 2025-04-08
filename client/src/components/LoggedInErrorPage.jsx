import React from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from './Nav';

function LoggedInErrorPage() {
    const navigate = useNavigate()

    return (
    <>
    <Nav></Nav>
      <div className="not-logged-in-container">
        <div className="not-logged-in-box">
          <h1>🔒 Access Denied</h1>
          <p>Either You are not logged in or Network Error. Please login register or check the internet to continue.</p>
          <div className="button-group">
            <button className="btn login-btn" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="btn register-btn" onClick={() => navigate("/register")}>
              Register
            </button>
          </div>
        </div>
      </div>
    </>
    );
  }

export default LoggedInErrorPage

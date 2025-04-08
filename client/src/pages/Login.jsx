import React, { useContext, useEffect, useState } from "react"; 
import "../RegisterPage.css"
import axios from "axios"
import {Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingButton from "../components/LoadingButton";
import { Auth } from "../context/Auth";
function Login(){
    const [loading , setLoading] = useState(false)
    const [show , setShow ] = useState(false)
    const APP_URI = process.env.REACT_APP_URL
    const [email , setEmail] = useState("")
    const [password , setPassword] = useState("")
    const {userInfo} = useContext(Auth)
    const navigate = useNavigate();

      useEffect(() => {
        document.title = `DocsNest : Login`;
      }, []);

    const handelSubmit = async ()=>{
      setLoading(true)
     try{
           const response = await axios.post(`${APP_URI}/auth/login`, {
            email , password
        })
        localStorage.setItem("token", response.data.token);
        toast.success(response.data.msg)
        userInfo()
        navigate("/")
    } catch (error) {
        if (error.response) {
          console.error('Error:', error.response.data.msg);
          toast.error(error.response.data.msg); 
        } else if (error.request) {
          console.error('No response from server:', error.request);
          toast.error("No response from the server. Please try again.");
        } else {
          console.error('Error:', error.message);
          toast.error("Something went wrong. Please try again.");
        }
}finally{
  setLoading(false)
}
}

const toggleButton = () => {
  setShow(prev => !prev)
}
    return(
<div className="main-body">
<div className="container">
  <div className="text" style={{color : "white"}}>
    Login
  </div>
  <form action="#">
    <div className="form-row">
      <div className="input-data">
        <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)}/>
        <div className="underline" />
        <label htmlFor>Email Address</label>
      </div>
    </div>
    <div className="form-row">
      <div className="input-data">
        <div className="flex-body">
        <input type={ show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}/>
        <i className={show ? "ri-eye-line" : "ri-eye-off-line"} onClick={toggleButton}></i> 
        </div>
        <div className="underline" />
        <label htmlFor>Password</label>
      </div>
    </div>
    <div className="form-row">
      <div className="input-data textarea">
        <div className="form-row submit-btn">
          <div className="input-data">
            <div className="inner" />
    {
      loading ? 
      <LoadingButton></LoadingButton> :
            <input type="submit" defaultValue="submit" onClick={(e) => {
                e.preventDefault()
                handelSubmit()}}/>
    }
          </div>
        </div>
      </div>
    </div>
   
      <span>Don't have an Account? <Link to={"/register"}>Register</Link></span>
    </form></div>
</div>
    )
}

export default Login
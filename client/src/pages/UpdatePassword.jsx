import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav';

const API_URL = process.env.REACT_APP_URL;

function UpdatePassword() {
    const [password, setPassword] = useState(""); 
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate(); 
    
    const updatePasswordAuth = async (e) => {
        e.preventDefault();
        setLoading(true)
        // Check if email is present before sending the request
        if (!password) {
            toast.error("Password cannot be empty!");
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/auth/updatepassword`, {
                method: "POST",
                headers: {  
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({password}),  // Ensure email is part of the JSON object
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setLoading(false)
                localStorage.removeItem('email');
                navigate("/login");
                toast.success(result.msg);
            } else {
                setLoading(false)
                toast.error(result.msg);
            }
        } catch (err) {
            setLoading(false)
            toast.error("There is some problem in the server please try again later");
        }
    };
    
     useEffect(() => {
     document.title = 'DocsNest - Update Password';
      }, []);

    return (
        <>
            <Nav />
            <div className="container my-4" style={{ maxWidth: '500px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                <form onSubmit={updatePasswordAuth}>
                    <div className="mb-3" style={{ marginBottom: '15px' }}>
                        <label htmlFor="exampleInputEmail1" className="form-label" style={{ fontWeight: 'bold', color: '#333', display: 'block', marginBottom: '5px'}}>
                            Enter the new password
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="exampleInputEmail1"
                            aria-describedby="emailHelp"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} 
                            style={{
                                width: '100%',
                                padding: '10px',
                                fontSize: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    {loading ? (
              <button class="btn btn-primary field" type="button" disabled>
                <span
                  class="spinner-border spinner-border-sm"
                  aria-hidden="true"
                ></span>
                <span role="status"> Verfying... </span>
              </button>
            ) :(
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px' }}>
                        Submit
                    </button>
            )}
                </form>
            </div>
        </>
    )
}

export default UpdatePassword;

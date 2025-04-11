import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Auth } from "../context/Auth";
function Nav({searchQuery}) {
  const { userData , userLoading } = useContext(Auth);
  const [user , setUser ] = useState(); 
  const [search , setSearch ] = useState(""); 

  useEffect(() => {
    if (searchQuery) {
      searchQuery(search); // only call if it's defined
    }
  }, [search, searchQuery])
  
  useEffect(() => {
    if(userData){
        setUser(userData);
    }
  }, [userData])
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          DocSNesT
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">
                Home
              </Link>
            </li>
            {userLoading ? (null) : (
                user ? (
                    <li className="nav-item">
                    <Link className="nav-link" to="/logout">
                    logout
                </Link>
              </li>
            ) : (
              <>
                <li className="nav-item">
                <Link className="nav-link" to="/register">
                Register
                    </Link>
                    </li>
                    <li className="nav-item">
                    <Link className="nav-link" to="/login">
                    Login
                    </Link>
                    </li>
                    </>
                )
            )}
                    <li className="nav-item">
                    <Link className="nav-link" to="/filesharing">
                    File Sharing
                    </Link>
                    </li>
          </ul>
          <form className="d-flex" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
      </div>
    </nav>
  );
}

export default Nav;

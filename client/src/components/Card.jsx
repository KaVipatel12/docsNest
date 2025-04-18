import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

function Card({
  img,
  title = "Card title",
  file = false,
  id,
  onDelete,
  onUpdate,
  onAddToFav,
  isFavorite,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleOptionClick = (e, action) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === "delete") {
      onDelete(id);
    } else if (action === "update") {
      onUpdate(id);
    } else if (action === "favorite") {
      onAddToFav(id);
    }

    setShowMenu(false);
  };

  return (
    <div className="position-relative" style={{ width: "18rem" }}>
      {/* Three dots menu */}
      <div
        className="position-absolute top-0 end-0 p-2"
        style={{ zIndex: 1 }}
        ref={menuRef}
      >
        <button
          className="btn btn-sm d-flex justify-content-center align-items-center"
          onClick={handleMenuClick}
          style={{ width: "30px", height: "30px", background: "#f8f9fa" }}
        >
          <span style={{ fontSize: "18px", lineHeight: 1, fontWeight: "bold" }}>
            ⋮
          </span>
        </button>

        {showMenu && (
          <div
            className="dropdown-menu show position-absolute end-0"
            style={{ minWidth: "180px" }}
          >
            <button
              className="dropdown-item"
              onClick={(e) => handleOptionClick(e, "delete")}
            >
              <i className="fas fa-trash-alt me-2"></i> Delete
            </button>
            <button
              className="dropdown-item"
              onClick={(e) => handleOptionClick(e, "update")}
            >
              <i className="fas fa-edit me-2"></i> Update
            </button>
          { 
            file &&           
            <button
              className="dropdown-item"
              onClick={(e) => handleOptionClick(e, "favorite")}
            >
              <i
                className={`${
                  isFavorite ? "fas fa-star" : "far fa-star"
                } me-2`}
                style={{ zIndex: 100 }}
              ></i>
              {isFavorite ? "Remove from favorites" : "Add to favorites"}
            </button>}
          </div>
        )}
      </div>

      {/* Toggle star icon (favorite) */}
    {     
    file &&
    <div
        className="position-absolute bottom-0 end-0 p-2"
        style={{ zIndex: 100, cursor: "pointer" }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onAddToFav(id); // Toggle favorite
        }}
      >
        <span
          className="bg-primary rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "25px", height: "25px" }}
        >
          <i
            className={isFavorite ? "ri-star-fill" : "ri-star-line"}
            style={{ color: "white" }}
          ></i>
        </span>
      </div>}

      {/* Main Card Content */}
      <Link
        to={file ? `/file/${id}` : `/folder/${id}`}
        className="card"
        style={{ width: "100%", textDecoration: "none" }}
      >
        {img && (
          <center>
            <img
              src={img}
              className="card-img"
              alt="..."
              style={{ width: "70%", height: "auto" }}
            />
          </center>
        )}
        <center>
          <div className="card-body">
            <h5 className="card-title">{title}</h5>
          </div>
        </center>
      </Link>
    </div>
  );
}

export default Card;

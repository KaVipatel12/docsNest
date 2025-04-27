import React from "react";
import { Link } from "react-router-dom";

function Card({
  img,
  title = "Card title",
  file = false,
  id,
  onAddToFav,
  isFavorite,
}) {

  return (
    <div className="position-relative" style={{ width: "18rem" }}>
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
              loading="lazy"
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

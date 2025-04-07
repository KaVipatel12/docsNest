import React from "react";
import { Link } from "react-router-dom";

function Card({ img, title = "Card title", file=false, id}) {
  return (

    <Link
      to={ file ? `/file/${id}` : `/folder/${id}`}
      className="card "
      style={{ width: "18rem", textDecoration: "none" }}
    >
      {img && (
        <center>
        <img
          src={img}
          className="card-img"
          alt="..."
          style={{ width: "70%", height: "auto" }}
          ></img>
          </center>
      )}
      <center>
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
      </div>
      </center>
    </Link>
  );
}
  
export default Card;

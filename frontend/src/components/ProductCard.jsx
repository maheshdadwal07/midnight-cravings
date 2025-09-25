import React from "react";

const ProductCard = ({ product, addToCart }) => {
  return (
    <div style={cardStyle}>
      <h4>{product.name}</h4>
      <p>₹{product.price}</p>
      <button style={btnStyle} onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
};

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "8px",
  padding: "15px",
  textAlign: "center",
  transition: "transform 0.2s",
};
const btnStyle = {
  marginTop: "10px",
  padding: "5px 10px",
  borderRadius: "6px",
  background: "#ff0000",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

export default ProductCard;

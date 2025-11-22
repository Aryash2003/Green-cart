import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import bgImage from "./assets/bgimg.jpg";

const Cart = ({ cart, setCart }) => {
  const [showPopup, setShowPopup] = useState(false);

  const handleClear = () => {
    setCart([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          zIndex: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />
      <div className="container mt-4" style={{ position: "relative", zIndex: 1 }}>
        <h1 className="text-center">Your Cart</h1>
        <div className="d-flex justify-content-end mb-3" style={{ gap: '1rem' }}>
          <button className="btn btn-danger" onClick={handleClear}>Clear</button>
        </div>
        {cart.length === 0 ? (
          <div className="alert alert-info text-center">Your cart is empty.</div>
        ) : (
          <div className="row">
            {cart.map((item, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <div className="card" style={{ width: '20rem', height: '34rem', margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: '1rem', overflow: 'hidden' }}>
                  <img
                    src={item.photo}
                    className="card-img-top"
                    alt={item.title}
                    style={{ height: '14rem', objectFit: 'contain', marginBottom: '1rem' }}
                  />
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', gap: '0.5rem', width: '100%', padding: 0, flex: 1 }}>
                    <div style={{ flex: 1, width: '100%' }}>
                      <h5 className="card-title" style={{ fontSize: '0.7rem', fontWeight: 'bold', minHeight: '3rem', overflow: 'hidden' }}>{item.title}</h5>
                      <p className="card-text">Price: {item.price}</p>
                      <p className="card-text">URL: {item.url}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {showPopup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center',
              minWidth: '300px'
            }}>
              <h4>Order Placed!</h4>
              <p>Your items have been added to the cart for purchase.</p>
              <button className="btn btn-primary mt-2" onClick={handleClosePopup}>Close</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
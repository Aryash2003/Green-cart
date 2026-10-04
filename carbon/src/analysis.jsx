import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation } from "react-router-dom";
import bgImage from "./assets/bgimg.jpg";
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:8080"
  : "https://green-cart-backend-cofn.onrender.com";

function decodeHtmlEntities(value) {
  const parsed = new DOMParser().parseFromString(value, "text/html");
  return parsed.body.textContent || value;
}

function BackgroundImage() {
  return (
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
        zIndex: "-1",
      }}
      aria-hidden="true"
    />
  );
}
// Analysis component to fetch and display product analysis
const Analysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const location = useLocation();
  const requestedProduct = useRef(null);

  useEffect(() => {
    const storedProduct = localStorage.getItem("productToAnalyse");
    let productObj = location.state?.product;
    if (!productObj && storedProduct) {
      try {
        productObj = JSON.parse(storedProduct);
      } catch {
        localStorage.removeItem("productToAnalyse");
      }
    }
    if (!productObj) {
      setError("No product found for analysis.");
      setLoading(false);
      return;
    }
    productObj = {
      ...productObj,
      title: decodeHtmlEntities(productObj.title),
    };
    localStorage.setItem("productToAnalyse", JSON.stringify(productObj));
    setProduct(productObj);
    const requestKey = `${productObj.asin}:${productObj.url}`;
    if (requestedProduct.current === requestKey) return;
    requestedProduct.current = requestKey;

    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analyse-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            asin: productObj.asin,
            title: productObj.title,
            url: productObj.url,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          const message = [data.error, data.details].filter(Boolean).join(" ");
          throw new Error(message || `Analysis request failed (${response.status}).`);
        }
        if (data.product_title !== productObj.title) {
          throw new Error(
            "The analysis server did not confirm the selected product. Deploy the latest backend and try again."
          );
        }
        setAnalysis(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching analysis.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [location.state]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  return (
    <>
      <BackgroundImage />
      <div className="container mt-4">
        <h1 className="text-center" style={{ color: "white" }}>
          {product && product.title ? product.title : "Product Analysis"}
        </h1>
        <div className="card mt-4">
          <div className="card-body">
            <h5 style={{fontSize:'2rem'}} className="card-title">Eco-Friendliness Analysis</h5>
            <ul>
              {analysis && analysis.points && analysis.points.map((point, index) => (
                <div key={index}>
                  <ul style={{fontStyle: 'italic', fontSize: '1.5rem' }}>{point}</ul>
                  <br />
                </div>
              ))}
            </ul>
            <h5 className="card-title mt-4">Product Details</h5>
            {product && (
              <>
                <img src={product.photo} alt={product.title} style={{ maxWidth: '200px', marginBottom: '1rem' }} />
                <p><strong>Description:</strong> {product.title}</p>
                <p><strong>Price:</strong> {product.price}</p>
                <p><strong>Product URL:</strong> <a href={product.url} target="_blank" rel="noopener noreferrer">{product.url}</a></p>
                <p><strong>ASIN:</strong> {product.asin}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Analysis;

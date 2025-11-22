import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import bgImage from "./assets/bgimg.jpg";
const API_BASE_URL = "http://localhost:8080";
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

  useEffect(() => {
    const storedProduct = localStorage.getItem("productToAnalyse");
    if (!storedProduct) {
      setError("No product found for analysis.");
      setLoading(false);
      return;
    }
    const productObj = JSON.parse(storedProduct);
    setProduct(productObj);
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analyse-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asin: productObj.asin }),
        });
        if (!response.ok) throw new Error("Failed to fetch analysis.");
        const data = await response.json();
        setAnalysis(data);
      } catch {
        setError("An error occurred while fetching analysis.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Analysis;

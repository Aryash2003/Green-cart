import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import Card from "react-bootstrap/Card";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import Nav from "react-bootstrap/Nav"; // Added missing import for Nav
import { Link, useNavigate } from "react-router-dom";
import bgImage from "./assets/bgimg.jpg";
const API_BASE_URL = "https://orlando-roy-audio-votes.trycloudflare.com"
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
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        zIndex: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}

const ProductSearch = ({ cart, setCart }) => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState(() => {
    // Load products from localStorage if available
    const stored = localStorage.getItem("products");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a search query.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Send POST request to backend
      const postResponse = await axios.post(`${API_BASE_URL}/search`, { query });
      console.log("POST Response:", postResponse.data); // Log POST response
      if (postResponse.status === 200) {
        const { filename } = postResponse.data; // Get the filename from the POST response
        console.log("Filename received:", filename); // Log the filename

        // Read the file directly by sending a request to the new backend endpoint
        const filePath = filename; // Use just the filename for backend compatibility
        const response = await axios.post(`${API_BASE_URL}/read-file`, { filePath }); // Use the backend endpoint to read the file
        console.log("File Data:", response.data); // Log the file data

        // Extract product details from the file data
        const products = (response.data.data.products || []).map((product) => ({
          title: product.product_title || "No title available",
          price: product.product_price || "Price not available",
          url: product.product_url || "#",
          photo: product.product_photo || "https://via.placeholder.com/150",
          asin: product.asin || ""
        }));

        setProducts(products); // Set the extracted products
        localStorage.setItem("products", JSON.stringify(products)); // Persist products
      } else {
        setError("Failed to fetch products. Please try again.");
      }
    } catch (err) {
      setError("An error occurred while fetching products.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyse = async (product) => {
    localStorage.setItem("productToAnalyse", JSON.stringify(product));
    navigate("/analysis"); // No reload, just navigate
  };

  const handleAddToCart = (product) => {
    // Prevent duplicate items (by asin)
    if (cart.some((item) => item.asin === product.asin)) {
      setPopupMessage("Item cannot be added (already in cart)");
      setShowPopup(true);
      return;
    }
    setCart((prevCart) => [...prevCart, product]);
    setPopupMessage("Item added successfully");
    setShowPopup(true);
  };
  
  // When component mounts, keep products in sync with localStorage
  React.useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // Add this reset handler
  const handleReset = () => {
    setProducts([]);
    setQuery("");
    localStorage.removeItem("products");
  };

  return (
    <>
      <BackgroundImage />
      <div className="p-4" style={{ position: "relative", zIndex: 1 }}>
        <Navbar bg="dark" variant="dark">
          <Container>
            <Navbar.Brand as={Link} to="/product-search">Eco Cart</Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/cart">Cart ({cart.length})</Nav.Link>
            </Nav>
          </Container>
        </Navbar>

        <div className="mt-4">
          <h1 className="text-center">Search for Products</h1>
          <div className="d-flex justify-content-center mt-3">
            <input
              type="text"
              placeholder="Enter product name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="form-control w-50"
            />
            <button
              type="button"
              onClick={handleSearch}
              className="btn btn-primary ms-2"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger ms-2"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </div>

        <div className="mt-4">
          <div className="row">
            {products.map((product, index) => (
              <div className="col-md-4 mb-4" key={index}>
                <Card style={{ width: '20rem', height: '34rem', margin: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', padding: '1rem', overflow: 'hidden' }}>
                  <Card.Img 
                    variant="top" 
                    src={product.photo} 
                    alt={product.title} 
                    style={{ height: '14rem', objectFit: 'contain', marginBottom: '1rem' }} 
                  />
                  <Card.Body style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', gap: '0.5rem', width: '100%', padding: 0, flex: 1 }}>
                    <div style={{ flex: 1, width: '100%' }}>
                      <Card.Text style={{ fontSize: '0.7rem', fontWeight: 'bold', minHeight: '3rem', overflow: 'hidden' }}>
                        {product.title}
                      </Card.Text>
                      <Card.Text>
                        Price: {product.price}
                      </Card.Text>
                    </div>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary w-100"
                    >
                      View Product
                    </a>
                    <button
                      type="button"
                      className="btn btn-secondary w-100 mt-2"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="btn btn-info w-100 mt-2"
                      style={{ marginBottom: 0 }}
                      onClick={() => handleAnalyse(product)}
                    >
                      Analyse Product
                    </button>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

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
          zIndex: 2000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '300px'
          }}>
            <h5>{popupMessage}</h5>
            <button className="btn btn-primary mt-2" onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductSearch;

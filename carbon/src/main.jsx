import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import bgImage from "./assets/image.jpg";
import Card from "react-bootstrap/Card";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav"; // Added missing import
import Spinner from "react-bootstrap/Spinner";
import Alert from "react-bootstrap/Alert";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductSearch from "./index.jsx";
import Analysis from "./analysis.jsx";
import Cart from "./cart.jsx";
const API_BASE_URL = "https://green-cart-backend-cofn.onrender.com";
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

function AppNavbar() {
  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="#home">Carbon Footprint</Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="#home">Home</Nav.Link>
          <Nav.Link href="/product-search">Product Search</Nav.Link>
        </Nav>
      </Container>
    </Navbar>
  );
}

function InfoCard() {
  return (
    <Card
      className="mb-3 shadow-sm"
      role="region"
      aria-label="Information"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}
    >
      <Card.Body>
        Please enter valid product links from genuine websites like Nykaa,
        Myntra, Flipkart, Amazon, etc.
      </Card.Body>
    </Card>
  );
}

function ResultsDisplay({ results }) {
  if (!results || results.length === 0) return null;
  return (
    <Card
      className="mt-3 shadow-sm"
      role="region"
      aria-live="polite"
      aria-label="Fetched product analysis"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", fontFamily: 'Segoe UI, Arial, sans-serif' }}
    >
      <Card.Body>
        <h4 style={{ fontWeight: 'bold', color: '#2d6a4f', marginBottom: '1rem' }}>Carbon Footprint Analysis</h4>
        <ul style={{ paddingLeft: '1.5rem', fontSize: '1.1rem', color: '#222' }}>
          {results.map(analysis =>
            analysis.split('\n').map((point, i) =>
              point.trim() ? (
                <li key={i} style={{ marginBottom: '0.5rem', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: point.includes(':') ? 'bold' : 'normal', color: point.includes('eco') ? '#40916c' : '#222' }}>{point}</span>
                </li>
              ) : null
            )
          )}
        </ul>
      </Card.Body>
    </Card>
  );
}

const CarbonFootprintForm = () => {
  const [results, setResults] = useState([]); // Stores fetched links
  const [productLink, setProductLink] = useState(""); // Stores user input
  const [showResults, setShowResults] = useState(false); // Controls visibility of results
  const [loading, setLoading] = useState(false); // Loading state for API calls
  const [error, setError] = useState(null); // Error message

  const postAPI = async () => {
    if (!productLink.trim()) {
      setError("Please enter a product link before submitting.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/submit`, {
        productLink: productLink.trim(),
      });
      await fetchAPI();
    } catch (err) {
      setError("Failed to send data. Please try again.");
      console.error("Error sending data to Flask:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAPI = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`);
      setResults(response.data.users);
      setShowResults(true);
    } catch (err) {
      setError("Error fetching data from server.");
      console.error("Error fetching API:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductLink("");
    setResults([]);
    setShowResults(false);
    setError(null);
  };

  return (
    <div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <AppNavbar />
        <div className="container d-flex flex-column align-items-center position-relative">
          <h1 className="mb-4 mt-3 text-white text-center position-relative">
            Carbon Footprint Calculator
          </h1>
          <InfoCard />
          <form
            onSubmit={(e) => e.preventDefault()}
            className="text-center w-100"
            aria-label="Carbon footprint product link form"
          >
            <label htmlFor="productLink" className="form-label text-white mt-4">
              Product Link:
            </label>
            <input
              id="productLink"
              type="url"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              className="form-control"
              placeholder="Enter product URL"
              aria-describedby="productLinkHelp"
              aria-invalid={error ? "true" : "false"}
              required
            />
            <div id="productLinkHelp" className="form-text text-white mb-3">
              Please enter a valid URL.
            </div>
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )}
            <div className="d-flex justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-primary px-4"
                onClick={postAPI}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Calculating...
                  </>
                ) : (
                  "Fetch & Calculate"
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-danger px-4"
                onClick={resetForm}
                disabled={loading}
              >
                Reset
              </button>
            </div>
            <ResultsDisplay results={showResults ? results : []} />
          </form>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<ProductSearch cart={cart} setCart={setCart} />}
        />
        <Route
          path="/product-search"
          element={<ProductSearch cart={cart} setCart={setCart} />}
        />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/cart" element={<Cart cart={cart} />} />
      </Routes>
    </Router>
  );
}

const AppWrapper = () => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  return (
    <>
      <BackgroundImage />
      <Router>
        <Routes>
          <Route path="/" element={<CarbonFootprintForm />} />
          <Route
            path="/product-search"
            element={<ProductSearch cart={cart} setCart={setCart} />}
          />
          <Route path="/analysis" element={<Analysis />} />
          <Route
            path="/cart"
            element={<Cart cart={cart} setCart={setCart} />}
          />
        </Routes>
      </Router>
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);

export default CarbonFootprintForm;
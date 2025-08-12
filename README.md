# Green Cart – Carbon Footprint Product Analysis

Green Cart is a full-stack web application that allows users to search for products, analyze their carbon footprint and eco-friendliness, and manage a shopping cart. The backend uses Flask and Google Gemini API for analysis, while the frontend is built with React and Vite.

## Features

- **Product Search:** Search for products (Amazon, etc.) and view details.
- **Carbon Footprint Analysis:** Get AI-powered sustainability and carbon footprint analysis for each product.
- **Cart Management:** Add products to a cart for easy management.
- **Modern UI:** Responsive React frontend with Bootstrap styling.

## Website's images

### Home Page
![Home Page](images/Screenshot%202025-05-27%20030652.png)

### Carbon Footprint Analysis For Any Product
![Carbon Footprint Analysis](images/Screenshot%202025-05-27%20030819.png)

### Product Search Results
![Product Search Results](images/Screenshot%202025-05-27%20030902.png)

### Add to Cart
![Add to cart](images/Screenshot%202025-05-27%20030957.png)

### Product Sustainability analysis and Environmental Friendliness analysis
![--](images/Screenshot%202025-05-27%20031033.png)

###  Product Sustainability analysis and Environmental Friendliness analysis
![--](images/Screenshot%202025-05-27%20031047.png)

### Checkout Page
![Checkout Page](images/Screenshot%202025-05-27%20031107.png)

### Checkout Page Empty
![empty](images/Screenshot%202025-05-27%20031117.png)

## Deployed Application

- **Frontend:** https://green-cart-pearl.vercel.app
- **Backend API:** https://green-cart-backend-cofn.onrender.com

## Local Development Setup

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.9+
- pip (Python package manager)
- (Optional) A virtual environment tool like venv

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Backend Setup (Flask)

- Set up environment variables if needed (e.g., for API keys).
- Edit `main.py` to add your Google Gemini API key if not already present.
- Run the backend locally:

```bash
cd server
pip install -r requirements.txt
python main.py
```

The backend will run on http://localhost:8080 by default.

### 3. Frontend Setup (React + Vite)

```bash
cd carbon
npm install
npm run dev
```

The frontend will run on http://localhost:5173 by default.

### 4. Configuration

- The frontend expects the backend API URL to be set in the code (see `API_BASE_URL` in `main.jsx`, `index.jsx`, and `analysis.jsx`). Update this if running locally or deploying elsewhere.
- CORS is configured in the backend to allow requests from your deployed frontend and localhost.

### 5. Deployment

- **Frontend:** Deploy the `carbon` folder to Vercel (or your preferred static hosting).
- **Backend:** Deploy the `server` folder to Render.com (or your preferred Python hosting).
- Make sure to update CORS origins in `main.py` to match your deployed frontend URLs.

## Usage

1. Open the frontend in your browser.
2. Search for a product.
3. View product details and click "Analyse Product" for a carbon footprint report.
4. Add products to your cart as desired.

## Troubleshooting

- If you see CORS errors, ensure your backend CORS settings include your frontend’s deployed URL.
- If API calls fail, check that both frontend and backend are running and accessible.

## License

MIT (or your chosen license)

---

### Deployed Links

- **Frontend:** https://green-cart-pearl.vercel.app
- **Backend:** https://green-cart-backend-cofn.onrender.com

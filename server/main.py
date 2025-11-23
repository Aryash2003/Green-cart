from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from google import genai
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import os
from datetime import datetime
import time
from google.genai.errors import ClientError
import re
import glob
from dotenv import load_dotenv
import logging

# Load environment variables and configure Google Gemini API client
load_dotenv()
logging.basicConfig(level=logging.INFO)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=GEMINI_API_KEY)

app = Flask(__name__)


CORS(app)

DATA_FILE = "data.json"

# Get the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Read stored product links
def read_links():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data.get("users", [])  # Get stored links
    except (FileNotFoundError, json.JSONDecodeError):
        return []  # Return empty list if file doesn't exist

# Write product links to file
def write_links(links):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump({"users": links}, file, indent=4)

# Analyze carbon footprint

def analyze_carbon_footprint(last_link):
    """Generates a carbon footprint analysis using Google Gemini API with retry logic for quota errors."""
    if not last_link:
        return "No product link found."

    prompt = f"""
    You are an environmental expert. Analyze the following product page for carbon footprint and sustainability from its provided link.

    Product Link: {last_link}
    
    Consider:
    - Material composition
    - Manufacturing and transportation impact
    - The estimated total carbon footprint it leaves in the environment
    - Eco-friendly alternatives
    - Sustainability rating (out of 10)

    Provide a structured analysis in detailed points showcasing quality, sustainability, ecofriendliness and carbon footprint of the product.
    IMPORTANT: Do NOT mention lack of data, do NOT say you cannot provide a precise calculation, and do NOT use generic disclaimers. Always provide a detailed, actionable analysis based on reasonable assumptions and typical product characteristics. Never say you cannot analyze. If you must assume, do so confidently and state your assumptions.
    Please keep it short and concise, ideally under 300 words.
    """

    max_retries = 4
    backoff = 1.0
    for attempt in range(1, max_retries + 1):
        try:
            response = client.models.generate_content(
                model="gemini-2.0-flash", contents=[prompt]
            )
            break
        except ClientError as e:
            status_code = getattr(e, 'status_code', None)
            if status_code == 429:
                if attempt == max_retries:
                    raise
                sleep_time = backoff * (2 ** (attempt - 1))
                sleep_time += (0.1 * sleep_time)  # jitter
                time.sleep(sleep_time)
                continue
            else:
                raise

    # Extract response properly
    try:
        result_text = response.candidates[0].content.parts[0].text
    except (AttributeError, IndexError):
        result_text = "Error: Unable to generate analysis."

    # Filter out generic fallback responses
    fallback_phrases = [
        "without access to the manufacturer's specific data",
        "precise carbon footprint calculation is impossible",
        "cannot provide",
        "impossible to calculate",
        "cannot determine",
        "not enough data",
        "not possible to provide",
        "lack of data"
    ]
    if any(phrase in result_text.lower() for phrase in fallback_phrases):
        # Optionally, you could re-prompt here, but for now, return a custom message
        result_text = "This product's carbon footprint has been estimated based on typical materials, manufacturing, and shipping practices. See below for a detailed, actionable analysis and recommendations."
    return result_text

# Analyze carbon footprint with product object

# API to get last product and its analysis
@app.route("/api/users", methods=["GET"])
def users():
    links = read_links()
    last_link = links[-1] if links else None  # Get last product link
    print(last_link)
    try:
        analysis = [analyze_carbon_footprint(last_link)]
        print(analysis)
        return jsonify({
            "users": analysis
        })
    except ClientError as e:
        app.logger.error("GenAI ClientError: %s", e)
        return jsonify({"error": "External analysis temporarily unavailable due to quota limits. Please try again later."}), 503

# API to submit new product link
@app.route("/api/submit", methods=["POST"])
def submit():
    data = request.json
    product_link = data.get("productLink")

    if product_link:
        links = read_links()
        links.append(product_link)  # Add new product link
        write_links(links)  # Save updated list
        return jsonify({"message": "Product link saved successfully!"}), 200

    return jsonify({"error": "Invalid product link"}), 400

item = 0  # Set item as zero initially
pattern = re.compile(r"data(\\d+)\\.json")
# Initialize item based on existing dataN.json files
for fname in os.listdir(BASE_DIR):
    match = pattern.match(fname)
    if match:
        num = int(match.group(1))
        if num > item:
            item = num

# API to search for products
# API to search for products (POST)
@app.route('/search', methods=['POST'])
def search_products_post():
    data = request.json
    query = data.get('query')  # Extract query from POST request body
    print("/search POST endpoint triggered")  # Log when the endpoint is hit
    print("Received query:", query)  # Log the received query

    # Check for existing file with matching query
    for fname in os.listdir(BASE_DIR):
        if pattern.match(fname):
            fpath = os.path.join(BASE_DIR, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    params = content.get("parameters", {})
                    if params.get("query", "").strip().lower() == query.strip().lower():
                        print(f"Found existing file {fname} for query '{query}'")
                        return jsonify({"message": "Search results found in existing file.", "filename": fname}), 200
            except Exception as e:
                print(f"Error reading {fname}: {e}")

    url = 'https://real-time-amazon-data.p.rapidapi.com/search'
    headers = {
        'x-rapidapi-host': 'real-time-amazon-data.p.rapidapi.com',
        'x-rapidapi-key': '6910db8c34msh129e51a9e2b5869p188878jsncfddeb166b8d'
    }
    params = {
        'query': query,
        'page': 1,
        'country': 'IN',
        'sort_by': 'RELEVANCE',
        'product_condition': 'ALL',
        'is_prime': 'false',
        'deals_and_discounts': 'NONE'
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        print("API Response Status Code:", response.status_code)  # Log API response status code
        print("API Response Data:", response.json())  # Log API response data

        if response.status_code == 200:
            data = response.json()
            # Remove all previous dataN.json files
            for f in glob.glob(os.path.join(BASE_DIR, "data*.json")):
                os.remove(f)
            # Always save as data1.json
            filename = "data1.json"
            filepath = os.path.join(BASE_DIR, filename)
            with open(filepath, "w", encoding="utf-8") as file:
                json.dump(data, file, indent=4)
            print(f"Full data saved to {filename}")  # Log data saving
            return jsonify({"message": "Search results saved successfully.", "filename": filename}), 200
        else:
            return jsonify({"error": "Failed to fetch data from API.", "details": response.text}), response.status_code
    except Exception as e:
        return jsonify({"error": "An error occurred while fetching data.", "details": str(e)}), 500

# API to fetch stored search results
@app.route('/search-results', methods=['GET'])
def get_search_results():
    try:
        # Simulate fetching stored results (in a real app, this might come from a database or cache)
        with open("data.json", "r") as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": "Failed to fetch search results.", "details": str(e)}), 500

@app.route('/get-filename', methods=['GET'])
def get_filename():
    try:
        global item
        if item > 0:
            filename = f"data{item}.json"
            return jsonify({"filename": filename}), 200
        else:
            return jsonify({"error": "No files have been saved yet."}), 404
    except Exception as e:
        return jsonify({"error": "An error occurred while fetching the filename.", "details": str(e)}), 500

@app.route('/read-file', methods=['POST'])
def read_file():
    try:
        data = request.json
        file_path = data.get('filePath')
        if not file_path or not os.path.exists(file_path):
            return jsonify({"error": "File not found."}), 404

        with open(file_path, 'r') as file:
            file_data = json.load(file)
        return jsonify(file_data), 200
    except Exception as e:
        return jsonify({"error": "An error occurred while reading the file.", "details": str(e)}), 500

# Updated /api/analyse-url to accept ASIN and analyze corresponding product
@app.route('/api/analyse-url', methods=['POST'])
def analyse_url():
    try:
        data = request.json
        asin = data.get('asin')
        if not asin:
            return jsonify({"error": "Product ASIN is required."}), 400
        # Load data1.json (or latest dataN.json if you want) and extract product_url
        with open(os.path.join(BASE_DIR, 'data1.json'), 'r', encoding='utf-8') as f:
            products = json.load(f)["data"]["products"]
        product = next((p for p in products if p.get('asin') == asin), None)
        if not product:
            print("Product not found in data1.json for ASIN:", asin)
            return jsonify({"error": "Product not found in data1.json."}), 404
        last_link = product.get('product_url') or product.get('url') or product.get('product_link')
        if not last_link:
            app.logger.info("Product URL missing for ASIN %s; cannot use analyze_carbon_footprint", asin)
            return jsonify({"error": "Product URL missing for ASIN; cannot analyze."}), 400

        analysis = analyze_carbon_footprint(last_link)
        if not analysis:
            raise RuntimeError("Empty analysis returned from external API")
        result_points = analysis.split("\n") if isinstance(analysis, str) else [str(analysis)]
        return jsonify({
            "points": result_points,
            "description": "Detailed analysis of the product.",
            "asin": asin,
            "link": last_link
        }), 200
    except Exception as e:
        print(e)
        return jsonify({"error": "An error occurred during analysis.", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8080)

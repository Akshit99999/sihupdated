import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient

# Load env variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB connection
mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["sih_db"]   # database name
collection = db["data"] # collection name

@app.route("/")
def home():
    return "Python Flask backend is running 🚀"

# Example GET route
@app.route("/api/data", methods=["GET"])
def get_data():
    items = list(collection.find({}, {"_id": 0}))  # exclude Mongo _id
    return jsonify(items)

# Example POST route
@app.route("/api/data", methods=["POST"])
def add_data():
    data = request.get_json()
    if not data or "name" not in data:
        return jsonify({"error": "Missing 'name'"}), 400
    collection.insert_one(data)
    return jsonify({"message": "Item added", "data": data}), 201

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)

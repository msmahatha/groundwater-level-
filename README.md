# 💧 Hydro Vision: AI-Powered Groundwater Dashboard

![Hydro Vision Banner](https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1350&q=80)  
*A water-wise step towards sustainable living.*

---

## 🌍 Overview
**Hydro Vision** is a full-stack web application designed to forecast groundwater levels across major cities in India using an advanced **LSTM neural network**.  
It transforms complex hydrological data into **beautiful, interactive visualizations**, empowering policymakers, researchers, and citizens to understand and act on water resource trends.

**🔗 Live Demo:** [hydro-vision.netlify.app](https://groundwater.netlify.app/)

---

## 🌊 Core Features

- **🤖 AI-Powered Predictions**  
  Built with TensorFlow + Keras, trained on rainfall, temperature, and population growth data to forecast groundwater levels.
  
- **🗺️ Interactive Map Dashboard**  
  A color-coded map (Blue → Healthy, Red → Critical) powered by React Leaflet.

- **🔍 Smart City Search**  
  Instantly locate any city and view predictions.

- **📊 Detailed Insights**  
  Popups reveal predicted groundwater levels, population, and growth rate.

- **✨ Sleek, Translucent UI**  
  Responsive, “frosted glass” design with water-themed colors.

---

## 💻 Tech Stack

**Frontend**  
- ⚛️ React – Interactive UI  
- 🗺️ React Leaflet – Dynamic map rendering  
- 🎨 Tailwind CSS – Modern responsive styling  

**Backend**  
- 🐍 Flask – Lightweight API backend  
- 🛠️ Gunicorn – Production WSGI server  
- 🔄 CORS – Cross-origin request handling  

**Machine Learning**  
- 🧠 TensorFlow & Keras – LSTM model  
- 📊 Pandas, NumPy – Data processing  
- 📏 Scikit-learn – Scaling & preprocessing  

---

## 📂 Project Structure
```
groundwater-level/
│
├── backend/
│   ├── app.py                 # Main Flask server
│   ├── models/                # Saved LSTM model (global_model.h5) and scaler
│   ├── data/                   # CSV dataset
│   ├── notebooks/              # Jupyter Notebooks for training & analysis
│   ├── requirements.txt        # Python dependencies
│   └── Procfile                 # Deployment config for Render
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── _redirects           # Netlify deployment rules
    ├── src/
    │   ├── App.js               # Main React component
    │   ├── components/          # Reusable UI components
    │   ├── pages/               # Page-level components
    │   ├── assets/               # Images, icons, and styles
    │   └── utils/               # Helper functions
    └── package.json             # Node.js dependencies
```

---

## 🚀 Getting Started Locally

**1️⃣ Backend Setup**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app.py
➡ Backend runs on http://localhost:5001
```
➡ Backend runs on ```http://localhost:5001```

2️⃣ Frontend Setup


```
cd frontend
npm install
npm start
```
📝 License
This project is licensed under the MIT License – you’re free to use, modify, and distribute.

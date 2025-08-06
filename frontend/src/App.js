import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- Helper Function for Color Scaling (REVERSED as requested) ---
const getColor = (level) => {
  if (level >= 25) return '#d73027';    // Red: WORST, largest number
  if (level >= 20) return '#fc8d59';    // Orange
  if (level >= 15) return '#fee090';    // Yellow
  if (level >= 10) return '#e0f3f8';    // Light Blue
  return '#91bfdb';                     // Blue: BEST, smallest number
};

const IndiaMap = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/all-cities-data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setCities(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCityData();
  }, []);

  if (loading) {
    return <p className="text-center text-lg">Loading map data...</p>;
  }
  if (error) {
    return <p className="text-center text-lg text-red-400">Error: {error}</p>;
  }

  const position = [22.5937, 78.9629];

  return (
    <MapContainer center={position} zoom={5} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      {Array.isArray(cities) && cities.map(city =>
        (typeof city.latitude === 'number' && typeof city.longitude === 'number') ? (
          <CircleMarker
            key={city.name}
            center={[city.latitude, city.longitude]}
            radius={10}
            pathOptions={{
              color: getColor(city.prediction),
              fillColor: getColor(city.prediction),
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <div className="font-sans">
                <h3 className="font-bold text-lg mb-1">{city.name}</h3>
                <p>Predicted Level: <span className="font-bold">{city.prediction}m</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ) : null
      )}
    </MapContainer>
  );
};

function App() {
  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden bg-gray-900">
      <div className="relative z-10 flex flex-col h-screen">
        <header className="text-center p-4 bg-black/20 backdrop-blur-sm">
          <h1 className="text-3xl font-bold text-white">India Groundwater Dashboard Hydro Vission</h1>
          <p className="text-md text-gray-300">An overview of predicted groundwater levels in major cities.</p>
        </header>
        <main className="flex-grow">
          <IndiaMap />
        </main>
      </div>
    </div>
  );
}

export default App;

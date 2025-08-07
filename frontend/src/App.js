import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- Helper Function for Color Scaling ---
const getColor = (level) => {
  if (level >= 25) return '#d73027';
  if (level >= 20) return '#fc8d59';
  if (level >= 15) return '#fee090';
  if (level >= 10) return '#e0f3f8';
  return '#91bfdb';
};

// --- Legend Component ---
const Legend = () => {
  const grades = [0, 10, 15, 20, 25];
  const labels = [
    'Excellent (0-10m)',
    'Good (10-15m)',
    'Moderate (15-20m)',
    'Poor (20-25m)',
    'Critical (>25m)'
  ];
  return (
    <div className="absolute bottom-10 right-4 bg-black/50 backdrop-blur-md p-3 rounded-lg text-white z-[1000] border border-white/20">
      <h4 className="font-bold mb-2">Groundwater Level</h4>
      {grades.map((grade, index) => (
        <div key={grade} className="flex items-center mb-1">
          <i className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: getColor(grade) }}></i>
          <span>{labels[index]}</span>
        </div>
      ))}
    </div>
  );
};

// --- Change Map View Component ---
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  map.flyTo(center, zoom);
  return null;
};

// --- India Map Component ---
const IndiaMap = ({ cities, selectedCity }) => {
  const position = [22.5937, 78.9629];
  const zoom = 5;
  return (
    <MapContainer center={position} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      {selectedCity && typeof selectedCity.latitude === 'number' && typeof selectedCity.longitude === 'number' && (
        <ChangeView center={[selectedCity.latitude, selectedCity.longitude]} zoom={10} />
      )}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
      />
      {Array.isArray(cities) && cities.map(city => (
        typeof city.latitude === 'number' && typeof city.longitude === 'number' ? (
          <CircleMarker
            key={city.city}
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
              <div className="font-sans text-sm">
                <h3 className="font-bold text-lg mb-1">{city.city}</h3>
                <p>Predicted Level: <span className="font-bold">{city.prediction}m</span></p>
                <hr className="my-1" />
                <p>Population: <span className="font-semibold">{city.population_millions} M</span></p>
                <p>Growth Rate: <span className="font-semibold">{city.growth_rate_pct}%</span></p>
              </div>
            </Popup>
            <Tooltip
              permanent
              direction="top"
              offset={[0, -10]}
              opacity={1}
              className="leaflet-tooltip-custom"
            >
              {city.city}
            </Tooltip>
          </CircleMarker>
        ) : null
      ))}
      <Legend />
    </MapContainer>
  );
};

// --- City Sidebar with HIGH CONTRAST for Visibility ---
const CitySidebar = ({ cities, onCityClick }) => (
  // UPDATED: Light, semi-transparent background for high contrast
  <div className="w-full md:w-1/4 h-1/3 md:h-full bg-gray-200/80 backdrop-blur-md p-4 overflow-y-auto border-r border-gray-300/50">
    {/* UPDATED: Dark text for the heading */}
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Cities</h2>
    <ul>
      {cities && cities.length > 0 ? (
        cities.map(city => (
          <li
            key={city.city}
            aria-label={`Select ${city.city} city`}
            tabIndex={0}
            // UPDATED: Dark text on a light background for list items
            className="p-2 my-1 rounded-md text-lg font-semibold text-gray-900 hover:bg-blue-500 hover:text-white cursor-pointer transition-colors"
            onClick={() => onCityClick(city)}
          >
            {city.city}
          </li>
        ))
      ) : (
        <li className="p-3 text-lg font-semibold text-red-700">
          No city data loaded.
          <span className="block mt-2 text-base font-normal text-gray-800">
            Please ensure your backend server is running and has no errors.
          </span>
        </li>
      )}
    </ul>
  </div>
);

// --- Social Icons & Footer ---
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
);
const GithubIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.617l-5.21-6.817-6.045 6.817h-3.308l7.73-8.805-8.335-10.69h6.78l4.596 6.131 5.437-6.131z"/></svg>
);

const Footer = () => (
  <footer className="text-center p-4 bg-black/10 backdrop-blur-md border-t border-white/10">
    <div className="flex justify-center items-center space-x-6">
      <a href="https://www.linkedin.com/in/msmahatha/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
        <LinkedInIcon />
      </a>
      <a href="https://github.com/msmahatha" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
        <GithubIcon />
      </a>
      <a href="https://x.com/MsMahatha" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
        <TwitterIcon />
      </a>
    </div>
    <p className="text-sm text-gray-500 mt-2">
      Hydro Vision &copy; {new Date().getFullYear()}
    </p>
  </footer>
);

// --- Main App Component ---
function App() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/all-cities-data');
        if (!response.ok) throw new Error('Network response was not ok');
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

  return (
    <div className="relative min-h-screen font-sans text-white overflow-hidden bg-gray-900">
      <div className="relative z-10 flex flex-col h-screen">
        <header className="text-center p-4 bg-black/10 backdrop-blur-md border-b border-white/10">
          <h1 className="text-3xl font-bold text-white">India Groundwater Dashboard Hydro Vision</h1>
          <p className="text-md text-gray-300">An overview of predicted groundwater levels in major cities.</p>
        </header>
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
          {loading ? (
            <p className="text-center text-lg w-full">Loading data...</p>
          ) : error ? (
            <p className="text-center text-lg text-red-400 w-full">Error: {error}</p>
          ) : (
            <>
              <CitySidebar cities={cities} onCityClick={setSelectedCity} />
              <main className="flex-grow h-2/3 md:h-full">
                <IndiaMap cities={cities} selectedCity={selectedCity} />
              </main>
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;

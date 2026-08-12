import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to dynamically re-center map on location change
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const WeatherMapComponent = ({ latitude = 28.6139, longitude = 77.2090, cityName = 'Target City', temperature, condition }) => {
  const center = [latitude, longitude];

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer center={center} zoom={11} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapRecenter center={center} />
        <Marker position={center}>
          <Popup>
            <div className="p-1 text-slate-800">
              <h4 className="font-bold text-sm font-heading">{cityName}</h4>
              {temperature !== undefined && <p className="text-xs font-semibold text-blue-600">{temperature}°C • {condition || 'Sunny'}</p>}
              <p className="text-[10px] text-slate-500 font-mono mt-1">{latitude.toFixed(2)}°, {longitude.toFixed(2)}°</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default WeatherMapComponent;

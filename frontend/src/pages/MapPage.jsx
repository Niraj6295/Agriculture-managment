import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const healthColor = { healthy: '#22c55e', warning: '#f59e0b', critical: '#ef4444' };

function createCropIcon(health) {
  return L.divIcon({
    html: `<div style="background:${healthColor[health] || '#22c55e'};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [16, 16],
    className: '',
  });
}

function ClickMarker({ onAdd }) {
  useMapEvents({
    click(e) { onAdd(e.latlng); },
  });
  return null;
}

export default function MapPage() {
  const [crops, setCrops] = useState([]);
  const [markers, setMarkers] = useState([]);
  const center = [22.5726, 88.3639]; // Kolkata default

  useEffect(() => {
    api.get('/crops').then(r => {
      const c = r.data.crops.filter(crop => crop.fieldLocation?.lat && crop.fieldLocation?.lng);
      setCrops(c);
    }).catch(() => {});
  }, []);

  const handleMapClick = (latlng) => {
    setMarkers(prev => [...prev, { ...latlng, id: Date.now() }]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Field Map</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Visualize your farm locations. Click on map to add a marker.</p>
      </div>

      {/* Legend */}
      <div className="card p-4 flex items-center gap-6 flex-wrap">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Legend:</p>
        {Object.entries(healthColor).map(([h, c]) => (
          <div key={h} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-white shadow" style={{ background: c }} />
            <span className="capitalize">{h}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-3.5 h-3.5 rounded-full border-2 border-white shadow bg-blue-500" />
          <span>Custom Marker</span>
        </div>
      </div>

      <div className="card overflow-hidden" style={{ height: '500px' }}>
        <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickMarker onAdd={handleMapClick} />

          {/* Crop markers */}
          {crops.map(crop => (
            <Marker
              key={crop._id}
              position={[crop.fieldLocation.lat, crop.fieldLocation.lng]}
              icon={createCropIcon(crop.healthStatus)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{crop.name}</p>
                  {crop.variety && <p className="text-gray-500">{crop.variety}</p>}
                  <p className="capitalize mt-1">Stage: {crop.currentStage}</p>
                  <p className={`capitalize font-medium`} style={{ color: healthColor[crop.healthStatus] }}>
                    {crop.healthStatus}
                  </p>
                  {crop.fieldSize && <p className="text-gray-500">{crop.fieldSize} acres</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Custom markers */}
          {markers.map(m => (
            <Marker
              key={m.id}
              position={[m.lat, m.lng]}
              icon={L.divIcon({
                html: `<div style="background:#3b82f6;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
                iconSize: [16, 16],
                className: '',
              })}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">Custom Marker</p>
                  <p className="text-gray-500">Lat: {m.lat.toFixed(4)}</p>
                  <p className="text-gray-500">Lng: {m.lng.toFixed(4)}</p>
                  <button
                    onClick={() => setMarkers(prev => prev.filter(x => x.id !== m.id))}
                    className="mt-2 text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {crops.length === 0 && (
        <div className="card p-4 text-sm text-gray-500 text-center">
          No crops with location data yet. Edit a crop and add its field location coordinates.
        </div>
      )}
    </div>
  );
}

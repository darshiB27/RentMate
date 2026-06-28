// Leaflet Map Wrapper Component
// Purpose: Sets up OpenStreetMap tiles, renders coordinate markers, and captures map drags.
import React from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';

// Fix Leaflet Default Icon image asset loading paths in Vite bundler environment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapContainer({ properties = [], center = [12.9716, 77.5946], zoom = 12, className = '' }) {
  // Filter out any properties without valid coordinates
  const validProperties = properties.filter(
    (p) => p.location?.coordinates && p.location.coordinates.length === 2
  );

  // If we have valid properties, dynamically calculate center based on first property if default center is used
  const mapCenter = validProperties.length > 0 && center[0] === 12.9716 && center[1] === 77.5946
    ? [validProperties[0].location.coordinates[1], validProperties[0].location.coordinates[0]]
    : center;

  return (
    <div className={`w-full h-full rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 relative z-10 ${className}`}>
      <LeafletMap
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[400px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validProperties.map((property) => {
          const lat = property.location.coordinates[1];
          const lng = property.location.coordinates[0];

          return (
            <Marker key={property._id} position={[lat, lng]}>
              <Popup>
                <div className="p-1 space-y-2 text-slate-800">
                  {property.images?.[0] && (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-20 object-cover rounded-md"
                    />
                  )}
                  <h4 className="font-semibold text-xs leading-tight line-clamp-2">{property.title}</h4>
                  <div className="flex items-center justify-between text-[10px] mt-1">
                    <span className="font-bold text-indigo-600">₹{property.price}/mo</span>
                    <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 font-medium text-slate-500">
                      {property.type}
                    </span>
                  </div>
                  <Link
                    to={`/property/${property._id}`}
                    className="block text-center text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg mt-2 transition-colors duration-150"
                  >
                    View Listing
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
}


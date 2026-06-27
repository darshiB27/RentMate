// Navigator geolocation retrieval hook
// Purpose: Retrieves visitor GPS coordinates for map overlays.
import { useState, useEffect } from 'react';
export default function useGeoLocation() {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  }, []);
  return coords;
}

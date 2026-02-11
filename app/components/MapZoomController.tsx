'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapZoomControllerProps {
  zoomToLocation: { lat: number; lng: number } | null;
}

export function MapZoomController({ zoomToLocation }: MapZoomControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!zoomToLocation) return;

    try {
      const ZOOM_LEVEL = 8;
      map.flyTo([zoomToLocation.lat, zoomToLocation.lng], ZOOM_LEVEL, {
        duration: 1.5,
        easeLinearity: 0.5,
      });
    } catch (error) {
      console.error('Error zooming to location:', error);
    }
  }, [zoomToLocation, map]);

  return null;
}

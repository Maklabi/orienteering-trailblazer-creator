
import React, { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPosition {
  lat: number;
  lng: number;
}

interface MapComponentProps {
  center: MapPosition;
  zoom: number;
  markers?: Array<{
    id: string;
    position: MapPosition;
    title: string;
  }>;
  startMarker?: MapPosition | null;
  onMapClick?: (position: MapPosition) => void;
  className?: string;
  style?: React.CSSProperties;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center,
  zoom,
  markers = [],
  startMarker = null,
  onMapClick,
  className = "h-[400px] w-full",
  style
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      // Disable zoom on click
      doubleClickZoom: false,
      // Keep other zoom controls available
      scrollWheelZoom: true,
      boxZoom: true,
      keyboard: true,
      zoomControl: true
    }).setView([center.lat, center.lng], zoom);
    
    // Add OSM tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Create a layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    
    // Add click handler if provided
    if (onMapClick) {
      map.on('click', (e) => {
        // Prevent default behavior and stop propagation
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();
        
        const position = {
          lat: e.latlng.lat,
          lng: e.latlng.lng
        };
        onMapClick(position);
      });
    }
    
    // Store references
    leafletMapRef.current = map;
    markersLayerRef.current = markersLayer;
    
    // Cleanup on unmount
    return () => {
      map.remove();
      leafletMapRef.current = null;
      markersLayerRef.current = null;
    };
  }, [center, zoom, onMapClick]);

  // Update markers when they change
  useEffect(() => {
    const map = leafletMapRef.current;
    const markersLayer = markersLayerRef.current;
    
    if (!map || !markersLayer) return;
    
    // Clear existing markers
    markersLayer.clearLayers();
    
    // Add new markers
    markers.forEach(marker => {
      const icon = L.divIcon({
        html: `<div class="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md border-2 border-white text-xs font-bold">${markers.indexOf(marker) + 1}</div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([marker.position.lat, marker.position.lng], { icon })
        .addTo(markersLayer)
        .bindTooltip(marker.title);
    });
  }, [markers]);

  // Update start marker when it changes
  useEffect(() => {
    const map = leafletMapRef.current;
    
    if (!map) return;
    
    // Remove existing start marker
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    
    // Add new start marker if provided
    if (startMarker) {
      const triangleIcon = L.divIcon({
        html: `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <polygon points="15,5 25,25 5,25" fill="none" stroke="magenta" stroke-width="2"/>
        </svg>`,
        className: 'start-marker-icon',
        iconSize: [30, 30],
        iconAnchor: [15, 25]
      });

      const marker = L.marker([startMarker.lat, startMarker.lng], { icon: triangleIcon })
        .addTo(map)
        .bindTooltip('Punto de Inicio');
      
      startMarkerRef.current = marker;
    }
  }, [startMarker]);

  return (
    <div ref={mapRef} className={className} style={style} />
  );
};

export default MapComponent;

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GeoData {
  [region: string]: number;
}

interface LeafletGeoMapProps {
  data: GeoData;
}

// Coordinates for key regions in India
const REGION_COORDS: Record<string, [number, number]> = {
  'Delhi NCR': [28.6139, 77.2090],
  'Maharashtra': [19.7515, 75.7139],
  'Karnataka': [15.3173, 75.7139],
  'Telangana': [18.1124, 79.0193],
  'West Bengal': [22.9868, 87.8550],
  'Punjab': [31.1471, 75.3412],
  'Tamil Nadu': [11.1271, 78.6569],
  'Gujarat': [22.2587, 71.1924],
  'Uttar Pradesh': [26.8467, 80.9462],
  'Rajasthan': [27.0238, 74.2179],
};

export const LeafletGeoMap: React.FC<LeafletGeoMapProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Destroy existing map instance if any
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Initialize Leaflet Map over India center
    const map = L.map(mapRef.current, {
      center: [22.5937, 78.9629],
      zoom: 4.5,
      zoomControl: true,
      attributionControl: false
    });

    mapInstance.current = map;

    // Dark carto tiles for sleek defense intelligence aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    // Plot choropleth density circles
    Object.entries(data).forEach(([region, density]) => {
      const coords = REGION_COORDS[region] || [20.5937, 78.9629];
      const pct = Math.round(density * 100);
      const radius = Math.max(150000, density * 750000);

      const circle = L.circle(coords, {
        color: '#06b6d4',
        fillColor: '#0891b2',
        fillOpacity: 0.6,
        radius: radius
      }).addTo(map);

      circle.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 2px 6px; background: #0f172a; color: #fff; border-radius: 4px; border: 1px solid #06b6d4;">
          <strong>${region}</strong>: ${pct}% PostGIS Density
        </div>`,
        { permanent: false, direction: 'top' }
      );
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div className="space-y-2">
      <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <div ref={mapRef} className="h-full w-full" />
      </div>
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
        <span>Leaflet Choropleth • Dark Carto tiles</span>
        <span className="text-cyan-400">PostGIS Aggregated Geofence</span>
      </div>
    </div>
  );
};

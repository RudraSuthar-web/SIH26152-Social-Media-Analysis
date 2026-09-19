import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Eye } from 'lucide-react';

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

type MapProvider = 'esri_dark' | 'osm' | 'esri_satellite' | 'vector_radar';

export const LeafletGeoMap: React.FC<LeafletGeoMapProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [provider, setProvider] = useState<MapProvider>('esri_dark');
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  useEffect(() => {
    if (provider === 'vector_radar') {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      return;
    }

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

    // Select tile URL based on chosen non-Carto provider
    let tileUrl = '';
    let maxZoom = 18;

    if (provider === 'esri_dark') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 16;
    } else if (provider === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      maxZoom = 19;
    } else if (provider === 'esri_satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      maxZoom = 17;
    }

    if (tileUrl) {
      L.tileLayer(tileUrl, { maxZoom }).addTo(map);
    }

    // Plot density circles for regional geofences
    Object.entries(data).forEach(([region, density]) => {
      const coords = REGION_COORDS[region] || [20.5937, 78.9629];
      const pct = Math.round(density * 100);
      const radius = Math.max(120000, density * 650000);

      const circle = L.circle(coords, {
        color: '#06b6d4',
        fillColor: '#0891b2',
        fillOpacity: 0.65,
        radius: radius
      }).addTo(map);

      circle.bindTooltip(
        `<div style="font-family: monospace; font-size: 11px; padding: 3px 8px; background: #0f172a; color: #38bdf8; border-radius: 6px; border: 1px solid #0284c7; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
          <strong>${region}</strong>: ${pct}% Density Cluster
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
  }, [data, provider]);

  return (
    <div className="space-y-3">
      {/* Map Control Toolbar */}
      <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Geospatial Provider:</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setProvider('esri_dark')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
              provider === 'esri_dark'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Esri Dark Canvas
          </button>
          <button
            onClick={() => setProvider('osm')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
              provider === 'osm'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            OpenStreetMap
          </button>
          <button
            onClick={() => setProvider('esri_satellite')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
              provider === 'esri_satellite'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setProvider('vector_radar')}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-md transition-all ${
              provider === 'vector_radar'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Vector Radar
          </button>
        </div>
      </div>

      {/* Map Renderer Container */}
      <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800 relative z-0 bg-slate-950">
        {provider !== 'vector_radar' ? (
          <div ref={mapRef} className="h-full w-full" />
        ) : (
          /* High-Tech Vector Radar Density Heatmap */
          <div className="h-full w-full relative flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
            {/* Grid overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Radar sweep line */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 rounded-full border border-cyan-900/40 relative animate-spin [animation-duration:12s]">
                <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-cyan-500/60 to-transparent transform -translate-y-1/2 origin-left" />
              </div>
            </div>

            {/* Region Spatial Radar Dots */}
            <div className="relative w-full h-full max-w-md mx-auto flex items-center justify-center">
              {Object.entries(data).map(([region, density], idx) => {
                const pct = Math.round(density * 100);
                // Normalized position layout based on region names
                const posMap: Record<string, { top: string; left: string }> = {
                  'Delhi NCR': { top: '30%', left: '42%' },
                  'Gujarat': { top: '50%', left: '25%' },
                  'Maharashtra': { top: '62%', left: '40%' },
                  'Karnataka': { top: '78%', left: '44%' },
                  'Telangana': { top: '68%', left: '55%' },
                  'West Bengal': { top: '52%', left: '78%' },
                  'Punjab': { top: '22%', left: '35%' },
                  'Tamil Nadu': { top: '88%', left: '52%' },
                  'Uttar Pradesh': { top: '38%', left: '56%' },
                  'Rajasthan': { top: '42%', left: '32%' },
                };

                const pos = posMap[region] || { top: `${30 + idx * 10}%`, left: `${30 + idx * 10}%` };
                const sizePx = Math.max(24, Math.round(density * 90));

                return (
                  <div
                    key={region}
                    style={{ top: pos.top, left: pos.left }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  >
                    {/* Pulsing radar aura */}
                    <div
                      style={{ width: `${sizePx * 1.6}px`, height: `${sizePx * 1.6}px` }}
                      className="rounded-full bg-cyan-500/20 border border-cyan-400/50 absolute -top-1/2 -left-1/2 transform translate-x-1/4 translate-y-1/4 animate-ping"
                    />

                    {/* Glowing core badge */}
                    <div
                      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
                      className="rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/40 relative z-10 transition-transform group-hover:scale-125"
                    >
                      <span className="text-[10px] font-mono font-bold text-white">{pct}%</span>
                    </div>

                    {/* Hover Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none z-20">
                      <div className="bg-slate-900 border border-cyan-500 text-white font-mono text-[11px] px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap">
                        <span className="text-cyan-400 font-bold">{region}:</span> {pct}% Spatial Density
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Provider: <strong className="text-slate-200 capitalize">{provider.replace('_', ' ')}</strong> (Carto-Free)
          </span>
        </span>
        <span className="text-cyan-400 font-semibold">PostGIS Aggregated Geofence</span>
      </div>
    </div>
  );
};

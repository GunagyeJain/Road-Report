import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Issue } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface IssuesMapProps {
  issues: Issue[];
  onIssueSelect?: (issue: Issue) => void;
  showHeatmap?: boolean;
  onToggleHeatmap?: (enabled: boolean) => void;
}

// Custom marker colors based on status
const getMarkerIcon = (status: string) => {
  const color = status === 'pending' ? 'red' : status === 'in-progress' ? 'blue' : 'green';
  
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

// Enhanced Heatmap component with position preservation
const HeatmapLayer: React.FC<{ issues: Issue[], mapMode: string }> = ({ issues, mapMode }) => {
  const map = useMap();
  const heatmapRef = useRef<any>(null);
  const zoomListenerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || issues.length === 0 || mapMode === 'markers') {
      // Remove heatmap if switching to markers only
      if (heatmapRef.current) {
        map.removeLayer(heatmapRef.current);
        heatmapRef.current = null;
      }
      // Remove zoom listener
      if (zoomListenerRef.current) {
        map.off('zoomend', zoomListenerRef.current);
        zoomListenerRef.current = null;
      }
      return;
    }

    // Function to create/update heatmap
    const createHeatmap = (preserveView = true) => {
      // Store current view
      const currentCenter = preserveView ? map.getCenter() : null;
      const currentZoom = preserveView ? map.getZoom() : null;

      // Remove existing heatmap
      if (heatmapRef.current) {
        map.removeLayer(heatmapRef.current);
      }

      // Prepare heatmap data
      const heatmapData = issues.map(issue => {
        const intensity = issue.status === 'pending' ? 1.0 : 
                        issue.status === 'in-progress' ? 0.8 : 0.4;
        
        return [
          issue.location.latitude,
          issue.location.longitude,
          intensity
        ] as [number, number, number];
      });

      // Calculate dynamic radius based on current zoom
      const currentMapZoom = map.getZoom();
      const dynamicRadius = Math.max(20, Math.min(60, 40 + (10 - currentMapZoom) * 3));

      // Create heatmap
      heatmapRef.current = (L as any).heatLayer(heatmapData, {
        radius: dynamicRadius,
        blur: Math.max(15, dynamicRadius * 0.6),
        maxZoom: 18,
        max: 1.0,
        minOpacity: currentMapZoom < 6 ? 0.6 : 0.4,
        gradient: {
          0.0: '#313695',
          0.1: '#4575b4',
          0.2: '#74add1',
          0.3: '#abd9e9',
          0.4: '#e0f3f8',
          0.5: '#ffffcc',
          0.6: '#fed976',
          0.7: '#feb24c',
          0.8: '#fd8d3c',
          0.9: '#fc4e2a',
          1.0: '#e31a1c'
        }
      }).addTo(map);

      // Restore view if preserving
      if (preserveView && currentCenter && currentZoom) {
        map.setView(currentCenter, currentZoom);
      }
    };

    // Create initial heatmap
    createHeatmap(false);

    // Add zoom listener for dynamic updates
    zoomListenerRef.current = () => {
      if (heatmapRef.current && (mapMode === 'heatmap' || mapMode === 'both')) {
        createHeatmap(true); // Preserve view when updating on zoom
      }
    };

    map.on('zoomend', zoomListenerRef.current);

    return () => {
      if (heatmapRef.current && map) {
        map.removeLayer(heatmapRef.current);
      }
      if (zoomListenerRef.current) {
        map.off('zoomend', zoomListenerRef.current);
      }
    };
  }, [map, issues, mapMode]);

  return null;
};

// Smart fit bounds component that only fits on initial load
const SmartFitBounds: React.FC<{ bounds: [number, number][], isInitialLoad: boolean }> = ({ bounds, isInitialLoad }) => {
  const map = useMap();
  
  useEffect(() => {
    if (isInitialLoad && bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds);
      map.fitBounds(leafletBounds, { padding: [20, 20] });
    } else if (bounds.length === 0) {
      // Default to India if no issues (only on initial load)
      if (isInitialLoad) {
        map.setView([20.5937, 78.9629], 5);
      }
    }
  }, [map, bounds, isInitialLoad]);
  
  return null;
};

const IssuesMap: React.FC<IssuesMapProps> = ({ 
  issues, 
  onIssueSelect, 
  showHeatmap = false,
  onToggleHeatmap 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mapMode, setMapMode] = useState<'markers' | 'heatmap' | 'both'>('markers');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Center map on India
  const center: [number, number] = [20.5937, 78.9629];

  // Calculate bounds to fit all markers
  const bounds = issues.length > 0 
    ? issues.map(issue => [issue.location.latitude, issue.location.longitude] as [number, number])
    : [];

  const handleModeChange = (mode: 'markers' | 'heatmap' | 'both') => {
    setMapMode(mode);
    setIsInitialLoad(false); // Prevent bounds fitting after initial load
    if (onToggleHeatmap) {
      onToggleHeatmap(mode === 'heatmap' || mode === 'both');
    }
  };

  // Handle initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000); // Allow 1 second for initial bounds fitting

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {/* Map Controls */}
      <div style={{ 
        marginBottom: '1rem', 
        display: 'flex', 
        gap: '0.5rem', 
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
          Map View:
        </span>
        
        <button
          onClick={() => handleModeChange('markers')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '20px',
            background: mapMode === 'markers' ? '#3b82f6' : '#e5e7eb',
            color: mapMode === 'markers' ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          📍 Pin Markers
        </button>
        
        <button
          onClick={() => handleModeChange('heatmap')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '20px',
            background: mapMode === 'heatmap' ? '#ef4444' : '#e5e7eb',
            color: mapMode === 'heatmap' ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          🔥 Heat Density
        </button>
        
        <button
          onClick={() => handleModeChange('both')}
          style={{
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '20px',
            background: mapMode === 'both' ? '#8b5cf6' : '#e5e7eb',
            color: mapMode === 'both' ? 'white' : '#374151',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          🎯 Both Views
        </button>

        {/* Legend */}
        {(mapMode === 'heatmap' || mapMode === 'both') && (
          <div style={{ 
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            <span>Density:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#313695', borderRadius: '2px' }}></div>
              <span>Low</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#fed976', borderRadius: '2px' }}></div>
              <span>Med</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#e31a1c', borderRadius: '2px' }}></div>
              <span>High</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Smart bounds fitting - only on initial load */}
          <SmartFitBounds bounds={bounds} isInitialLoad={isInitialLoad} />
          
          {/* Heatmap layer with mode awareness */}
          {(mapMode === 'heatmap' || mapMode === 'both') && issues.length > 0 && (
            <HeatmapLayer issues={issues} mapMode={mapMode} />
          )}
          
          {/* Issue markers */}
          {(mapMode === 'markers' || mapMode === 'both') && issues.map(issue => (
            <Marker
              key={issue.id}
              position={[issue.location.latitude, issue.location.longitude]}
              icon={getMarkerIcon(issue.status)}
              eventHandlers={{
                click: () => onIssueSelect && onIssueSelect(issue)
              }}
            >
              <Popup maxWidth={300}>
                <div style={{ minWidth: '200px' }}>
                  {issue.photoURL && (
                    <img 
                      src={issue.photoURL} 
                      alt="Issue" 
                      style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }}
                    />
                  )}
                  
                  <div style={{ 
                    background: issue.status === 'pending' ? '#fef3c7' : issue.status === 'in-progress' ? '#dbeafe' : '#d1fae5',
                    color: issue.status === 'pending' ? '#92400e' : issue.status === 'in-progress' ? '#1e40af' : '#065f46',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '8px',
                    textTransform: 'uppercase'
                  }}>
                    {issue.status.replace('-', ' ')}
                  </div>
                  
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px' }}>
                    {issue.category.charAt(0).toUpperCase() + issue.category.slice(1)} Issue
                  </h4>
                  
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#666' }}>
                    {issue.description.length > 100 
                      ? issue.description.substring(0, 100) + '...' 
                      : issue.description
                    }
                  </p>
                  
                  <div style={{ fontSize: '11px', color: '#888' }}>
                    <p style={{ margin: '2px 0' }}>📅 {new Date(issue.timestamp).toLocaleDateString()}</p>
                    {issue.reporterEmail && (
                      <p style={{ margin: '2px 0' }}>👤 {issue.reporterEmail}</p>
                    )}
                    <p style={{ margin: '2px 0' }}>📍 {issue.location.latitude.toFixed(4)}, {issue.location.longitude.toFixed(4)}</p>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Stats */}
      <div style={{ 
        marginTop: '1rem',
        padding: '0.75rem',
        background: '#f8fafc',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          📊 <strong>{issues.length}</strong> issues displayed • 
          🔴 <strong>{issues.filter(i => i.status === 'pending').length}</strong> pending • 
          🔵 <strong>{issues.filter(i => i.status === 'in-progress').length}</strong> in progress • 
          🟢 <strong>{issues.filter(i => i.status === 'resolved').length}</strong> resolved
        </div>
        
        {mapMode === 'heatmap' && (
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            💡 Brighter areas = More issues
          </div>
        )}
      </div>
    </div>
  );
};

export default IssuesMap;

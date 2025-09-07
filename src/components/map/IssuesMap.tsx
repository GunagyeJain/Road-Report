import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Issue } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

const IssuesMap: React.FC<IssuesMapProps> = ({ issues, onIssueSelect }) => {
  const mapRef = useRef<L.Map | null>(null);

  // Center map on India (you can change this to your city)
  const center: [number, number] = [20.5937, 78.9629];

  // Calculate bounds to fit all markers
  const bounds = issues.length > 0 
    ? issues.map(issue => [issue.location.latitude, issue.location.longitude] as [number, number])
    : [];

  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
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
        
        {/* Fit bounds to show all markers */}
        {bounds.length > 0 && <FitBounds bounds={bounds} />}
        
        {/* Issue markers */}
        {issues.map(issue => (
          <Marker
            key={issue.id}
            position={[issue.location.latitude, issue.location.longitude]}
            icon={getMarkerIcon(issue.status)}
            eventHandlers={{
              click: () => onIssueSelect && onIssueSelect(issue)
            }}
          >
            <Popup>
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
                  {issue.description.substring(0, 100)}...
                </p>
                
                <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
                  Reported: {new Date(issue.timestamp).toLocaleDateString()}
                </p>
                
                {issue.reporterEmail && (
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>
                    By: {issue.reporterEmail}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Component to fit map bounds to markers
const FitBounds: React.FC<{ bounds: [number, number][] }> = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds);
      map.fitBounds(leafletBounds, { padding: [20, 20] });
    }
  }, [map, bounds]);
  
  return null;
};

export default IssuesMap;

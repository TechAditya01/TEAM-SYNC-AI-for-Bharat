/**
 * AWS Location Service Map Component
 * Uses MapLibre GL with AWS Location Service API Key Authentication
 * 
 * Simple setup - just needs API Key from AWS Console
 */

import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const AWS_REGION = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const API_KEY = import.meta.env.VITE_AWS_LOCATION_API_KEY;

// Map style URL with API key
const getMapStyleUrl = () => {
  return `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/Standard/descriptor?key=${API_KEY}`;
};

const AWSMapView = ({ 
  center = [79.0882, 21.1458], // [lng, lat] - Default: Nagpur
  zoom = 14,
  markers = [],
  onMarkerClick,
  userLocation,
  className = "w-full h-full",
  style = "Standard", // Standard, Monochrome, Hybrid, Satellite
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!API_KEY) {
      setError('AWS Location API Key not configured. Please update .env file.');
      setLoading(false);
      return;
    }

    try {
      const styleUrl = `https://maps.geo.${AWS_REGION}.amazonaws.com/v2/styles/${style}/descriptor?key=${API_KEY}`;
      
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: center,
        zoom: zoom,
      });

      map.current.on('load', () => {
        setLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map. Check API key permissions.');
        setLoading(false);
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      // Add geolocation control
      map.current.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        'top-right'
      );

      // Add scale
      map.current.addControl(new maplibregl.ScaleControl({ maxWidth: 100 }), 'bottom-left');

      // Add fullscreen control
      map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    } catch (err) {
      console.error('Failed to initialize map:', err);
      setError('Failed to initialize map.');
      setLoading(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, style]);

  // Add/update markers
  useEffect(() => {
    if (!map.current) return;

    // Wait for map to load
    const addMarkers = () => {
      // Clear existing markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add new markers
      markers.forEach((markerData) => {
        const { lat, lng, color = '#3b82f6', title, description, data, category } = markerData;
        
        // Create custom marker element
        const el = document.createElement('div');
        el.className = 'aws-map-marker';
        el.style.cssText = `
          width: 32px;
          height: 32px;
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Add icon based on category
        const icon = getCategoryIcon(category);
        el.innerHTML = `<span style="font-size: 14px;">${icon}</span>`;
        
        el.onmouseenter = () => el.style.transform = 'scale(1.2)';
        el.onmouseleave = () => el.style.transform = 'scale(1)';

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map.current);

        // Add popup
        if (title || description) {
          const popup = new maplibregl.Popup({ offset: 25, closeButton: true })
            .setHTML(`
              <div style="padding: 10px; max-width: 200px;">
                <strong style="font-size: 14px; color: #1e293b;">${title || ''}</strong>
                ${description ? `<p style="margin: 6px 0 0; font-size: 12px; color: #64748b;">${description}</p>` : ''}
                ${category ? `<span style="display: inline-block; margin-top: 6px; padding: 2px 8px; background: ${color}22; color: ${color}; border-radius: 12px; font-size: 11px;">${category}</span>` : ''}
              </div>
            `);
          marker.setPopup(popup);
        }

        // Click handler
        if (onMarkerClick) {
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            onMarkerClick(data || markerData);
          });
        }

        markersRef.current.push(marker);
      });
    };

    if (map.current.loaded()) {
      addMarkers();
    } else {
      map.current.on('load', addMarkers);
    }
  }, [markers, onMarkerClick]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation) return;

    const el = document.createElement('div');
    el.style.cssText = `
      width: 20px;
      height: 20px;
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
      animation: pulse 2s infinite;
    `;

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
        70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
    `;
    document.head.appendChild(style);

    const userMarker = new maplibregl.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map.current);

    return () => {
      userMarker.remove();
      style.remove();
    };
  }, [userLocation]);

  // Center map on location changes
  useEffect(() => {
    if (map.current && center) {
      map.current.flyTo({ center, zoom, duration: 1000 });
    }
  }, [center, zoom]);

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100 dark:bg-slate-900`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading AWS Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-slate-100 dark:bg-slate-900`}>
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Map Error</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
};

// Helper function to get icon based on category
const getCategoryIcon = (category) => {
  const icons = {
    'pothole': '🕳️',
    'road_damage': '🚧',
    'street_light': '💡',
    'garbage': '🗑️',
    'water_supply': '💧',
    'sewage': '🚰',
    'electricity': '⚡',
    'traffic': '🚦',
    'noise': '🔊',
    'encroachment': '🏗️',
    'stray_animals': '🐕',
    'other': '📍',
  };
  return icons[category?.toLowerCase()] || '📍';
};

// Geocoding helper using AWS Location Service Places API
export const searchPlaces = async (query, maxResults = 5) => {
  if (!API_KEY) {
    throw new Error('AWS Location API Key not configured');
  }

  try {
    const response = await fetch(
      `https://places.geo.${AWS_REGION}.amazonaws.com/v2/search-text?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          QueryText: query,
          MaxResults: maxResults,
          BiasPosition: [79.0882, 21.1458], // Bias towards Nagpur
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Places search failed');
    }

    const data = await response.json();
    
    return data.ResultItems?.map(result => ({
      label: result.Title,
      lat: result.Position[1],
      lng: result.Position[0],
      address: result.Address?.Label || result.Title,
      municipality: result.Address?.Municipality,
      region: result.Address?.Region,
      country: result.Address?.Country,
    })) || [];
  } catch (error) {
    console.error('Places search error:', error);
    throw error;
  }
};

// Reverse geocoding - get address from coordinates
export const reverseGeocode = async (lat, lng) => {
  if (!API_KEY) {
    throw new Error('AWS Location API Key not configured');
  }

  try {
    const response = await fetch(
      `https://places.geo.${AWS_REGION}.amazonaws.com/v2/reverse-geocode?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          QueryPosition: [lng, lat],
          MaxResults: 1,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Reverse geocode failed');
    }

    const data = await response.json();
    const result = data.ResultItems?.[0];
    
    if (result) {
      return {
        label: result.Title,
        address: result.Address?.Label || result.Title,
        street: result.Address?.Street,
        municipality: result.Address?.Municipality,
        region: result.Address?.Region,
        postalCode: result.Address?.PostalCode,
        country: result.Address?.Country,
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocode error:', error);
    throw error;
  }
};

export default AWSMapView;

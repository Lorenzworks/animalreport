import { useEffect, useRef } from 'react';
import { Post } from '@shared/schema';

interface MapProps {
  posts: Post[];
  height?: string;
  onMarkerClick?: (post: Post) => void;
}

export default function Map({ posts, height = "400px", onMarkerClick }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Load Leaflet dynamically
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;
      
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        return new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
    };

    loadLeaflet().then(() => {
      if (mapRef.current && (window as any).L && !mapInstanceRef.current) {
        const L = (window as any).L;
        
        // Initialize map
        const map = L.map(mapRef.current).setView([40.7829, -73.9654], 12); // Default to NYC
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        mapInstanceRef.current = map;

        // Custom icons
        const lostIcon = L.divIcon({
          html: '<div style="background-color: #F4D03F; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: #1f2937;">!</div>',
          iconSize: [20, 20],
          className: 'custom-div-icon'
        });

        const foundIcon = L.divIcon({
          html: '<div style="background-color: #4FC3F7; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white;">✓</div>',
          iconSize: [20, 20],
          className: 'custom-div-icon'
        });

           // Add markers for posts with location
        const newMarkers: any[] = [];
        const bounds = L.latLngBounds([]);

        posts.forEach((post) => {
          if (post.lat != null && post.lng != null) {   // ← cambiato da && a != null (più sicuro)
            const icon = post.status === 'LOST' ? lostIcon : foundIcon;
            const description = post.details 
              ? post.details.substring(0, 100) + (post.details.length > 100 ? '...' : '') 
              : 'No details provided';

            const marker = L.marker([post.lat, post.lng], { icon })
              .bindPopup(`
                <div style="max-width: 220px; font-family: system-ui;">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <img src="${post.mediaUrl}" 
                         alt="${post.animalName}"
                         style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; margin-right: 10px;">
                    <div>
                      <strong>${post.animalName}</strong><br>
                      <span style="font-size: 12px; color: #666;">${post.species}</span>
                    </div>
                  </div>
                  <p style="margin: 0 0 8px; font-size: 13px; line-height: 1.4;">
                    ${description}
                  </p>
                  ${post.contact ? `<div style="font-size: 12px; color: #666;">📞 ${post.contact}</div>` : ''}
                  ${post.location ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">📍 ${post.location}</div>` : ''}
                </div>
              `)
              .addTo(map);

            if (onMarkerClick) {
              marker.on('click', () => onMarkerClick(post));
            }

            bounds.extend([post.lat, post.lng]);
            newMarkers.push(marker);
          }
        });

        // Fit map to show all markers
        if (newMarkers.length > 0) {
          map.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    });

    return () => {
      // Cleanup markers
      if (mapInstanceRef.current && markersRef.current) {
        markersRef.current.forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = [];
      }
    };
  }, [posts, onMarkerClick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={mapRef} 
      style={{ height, width: '100%' }}
      className="rounded-lg border border-gray-200"
    />
  );
}

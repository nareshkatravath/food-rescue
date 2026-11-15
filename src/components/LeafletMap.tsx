import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface FoodMapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
}

interface LeafletMapProps {
  pickupPoint?: { lat: number; lng: number; label?: string } | null;
  draggablePickup?: boolean;
  onPickupChange?: (lat: number, lng: number) => void;
  userPoint?: { lat: number; lng: number; label?: string } | null;
  foodMarkers?: FoodMapMarker[];
  onSelectFood?: (id: string) => void;
  heightClass?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

function createPickupPinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'foodrescue-pickup-pin',
    html: `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#087A28" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3.5" fill="#FFFFFF"></circle>
      </svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function createUserLocationIcon(): L.DivIcon {
  return L.divIcon({
    className: 'foodrescue-user-pin',
    html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
      <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(37,99,235,0.28);"></span>
      <span style="width:12px;height:12px;border-radius:9999px;background:#2563EB;border:2.5px solid #FFFFFF;box-shadow:0 1px 4px rgba(0,0,0,0.35);"></span>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  pickupPoint,
  draggablePickup = false,
  onPickupChange,
  userPoint,
  foodMarkers,
  onSelectFood,
  heightClass = 'h-48',
  center,
  zoom = 14,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const pickupMarkerRef = useRef<L.Marker | null>(null);
  const onPickupChangeRef = useRef(onPickupChange);
  const onSelectFoodRef = useRef(onSelectFood);

  onPickupChangeRef.current = onPickupChange;
  onSelectFoodRef.current = onSelectFood;

  // Initialize Leaflet map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const initialCenter = pickupPoint || userPoint || center || { lat: 12.9716, lng: 77.5946 };

    const map = L.map(el, {
      center: [initialCenter.lat, initialCenter.lng],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const group = L.layerGroup().addTo(map);
    mapRef.current = map;
    layerGroupRef.current = group;

    // Ensure proper tile rendering inside scrollable containers
    const resizeTimer = window.setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      window.clearTimeout(resizeTimer);
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
      pickupMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click-to-place pin when draggablePickup is enabled
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !draggablePickup) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onPickupChangeRef.current?.(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [draggablePickup]);

  // Sync markers and map bounds
  useEffect(() => {
    const map = mapRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    pickupMarkerRef.current = null;

    const points: L.LatLngExpression[] = [];

    if (userPoint) {
      const marker = L.marker([userPoint.lat, userPoint.lng], {
        icon: createUserLocationIcon(),
        zIndexOffset: 500,
      }).addTo(group);
      marker.bindPopup(userPoint.label || 'Your current location');
      points.push([userPoint.lat, userPoint.lng]);
    }

    if (pickupPoint) {
      const marker = L.marker([pickupPoint.lat, pickupPoint.lng], {
        icon: createPickupPinIcon(),
        draggable: draggablePickup,
        zIndexOffset: 800,
      }).addTo(group);

      if (pickupPoint.label) {
        marker.bindPopup(pickupPoint.label);
      }

      if (draggablePickup) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onPickupChangeRef.current?.(pos.lat, pos.lng);
        });
      }

      pickupMarkerRef.current = marker;
      points.push([pickupPoint.lat, pickupPoint.lng]);
    }

    if (foodMarkers && foodMarkers.length > 0) {
      foodMarkers.forEach((fm) => {
        const marker = L.marker([fm.lat, fm.lng], {
          icon: createPickupPinIcon(),
        }).addTo(group);

        const popupContent = document.createElement('div');
        popupContent.className = 'text-xs';
        const titleEl = document.createElement('div');
        titleEl.className = 'font-bold text-slate-900';
        titleEl.textContent = fm.title;
        popupContent.appendChild(titleEl);

        if (fm.subtitle) {
          const subEl = document.createElement('div');
          subEl.className = 'text-[11px] text-slate-600 mt-0.5';
          subEl.textContent = fm.subtitle;
          popupContent.appendChild(subEl);
        }

        if (onSelectFoodRef.current) {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className =
            'mt-1.5 px-2 py-1 bg-[#087A28] text-white text-[10px] font-bold rounded-md';
          btn.textContent = 'View Details';
          btn.onclick = () => onSelectFoodRef.current?.(fm.id);
          popupContent.appendChild(btn);
        }

        marker.bindPopup(popupContent);
        points.push([fm.lat, fm.lng]);
      });
    }

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
    } else if (points.length === 1) {
      map.setView(points[0], Math.max(map.getZoom(), zoom));
    } else if (center) {
      map.setView([center.lat, center.lng], zoom);
    }

    map.invalidateSize();
  }, [pickupPoint, draggablePickup, userPoint, foodMarkers, center, zoom]);

  return (
    <div
      ref={containerRef}
      className={`w-full ${heightClass} rounded-xl overflow-hidden border border-slate-200 z-0`}
    />
  );
};

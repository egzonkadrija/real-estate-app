"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface PropertyMapInnerProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  className?: string;
}

export default function PropertyMapInner({
  latitude,
  longitude,
  title,
  zoom = 15,
  className,
}: PropertyMapInnerProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      className={className || "h-[300px] w-full rounded-xl"}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={icon}>
        {title && <Popup>{title}</Popup>}
      </Marker>
    </MapContainer>
  );
}

"use client";

import { useEffect } from "react";
import L from "leaflet";

// Victim marker
const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Helper marker
const blueIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
import "leaflet/dist/leaflet.css";

export default function MapComponent({ sosList }: any) {
  useEffect(() => {
    const map = L.map("map").setView([27.7, 85.3], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "OpenStreetMap",
    }).addTo(map);

sosList.forEach((sos: any) => {
  if (sos.latitude != null && sos.longitude != null) {
    const lat = Number(sos.latitude);
    const lng = Number(sos.longitude);

    // Victim marker
    L.marker([lat, lng], { icon: redIcon })
      .addTo(map)
      .bindPopup(`<b>${sos.user?.name || "Victim"}</b><br/>SOS Active`);

    // Helper marker (if it exists)
    if (sos.helperLocation) {
      const hLat = Number(sos.helperLocation.latitude);
      const hLng = Number(sos.helperLocation.longitude);

      L.marker([hLat, hLng], { icon: blueIcon })
        .addTo(map)
        .bindPopup(`<b>Helper</b><br/>On the way`);
    }
  }
});

    return () => {
      map.remove();
    };
  }, [sosList]);

  return <div id="map" style={{ height: "400px", borderRadius: "10px" }} />;
}
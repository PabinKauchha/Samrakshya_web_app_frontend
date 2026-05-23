"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const redIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const blueIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function MapComponent({ sosList }: any) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Create map ONCE
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map("map").setView([27.7, 85.3], 13);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "OpenStreetMap",
      }
    ).addTo(mapRef.current);

    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers only
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;

    markersRef.current.clearLayers();

    sosList.forEach((sos: any) => {
      if (sos.latitude && sos.longitude) {
        const lat = Number(sos.latitude);
        const lng = Number(sos.longitude);

        L.marker([lat, lng], { icon: redIcon })
          .addTo(markersRef.current!)
          .bindPopup(
            `<b>${sos.user?.name || "Victim"}</b><br/>SOS Active`
          );

        if (sos.helperLocation) {
          const hLat = Number(sos.helperLocation.latitude);
          const hLng = Number(sos.helperLocation.longitude);

          L.marker([hLat, hLng], { icon: blueIcon })
            .addTo(markersRef.current!)
            .bindPopup("<b>Helper</b><br/>On the way");
        }
      }
    });
  }, [sosList]);

  return (
    <div
      id="map"
      style={{
        height: "400px",
        width: "100%",
        borderRadius: "10px",
      }}
    />
  );
}
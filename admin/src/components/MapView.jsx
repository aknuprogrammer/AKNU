import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix missing marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper component to auto-fit the map view
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      map.fitBounds(points, { padding: [100, 100] });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }
  }, [map, points]);
  return null;
};

const MapView = () => {
  const [params] = useSearchParams();

  const startLat = parseFloat(params.get("startLat"));
  const startLng = parseFloat(params.get("startLng"));
  const currentLat = parseFloat(params.get("currentLat"));
  const currentLng = parseFloat(params.get("currentLng"));
  const endLat = parseFloat(params.get("endLat"));
  const endLng = parseFloat(params.get("endLng"));

  // Parse stop points from URL (expecting JSON string)
  const stopPointsParam = params.get("stopPoints");
  let stopPoints = [];
  try {
    if (stopPointsParam) {
      // Try parsing directly first, then with decodeURIComponent if that fails
      try {
        stopPoints = JSON.parse(stopPointsParam);
      } catch (e) {
        stopPoints = JSON.parse(decodeURIComponent(stopPointsParam));
      }
      console.log("Parsed stop points:", stopPoints);
    }
  } catch (error) {
    console.error("Error parsing stop points:", error);
  }

  // Build the route: start → stop points → current → end
  const routePoints = [];

  // Add start point
  if (!isNaN(startLat) && !isNaN(startLng)) {
    routePoints.push([startLat, startLng]);
  }

  // Add stop points in order
  stopPoints.forEach((stop) => {
    const lat = parseFloat(stop.coordinates?.lat);
    const lng = parseFloat(stop.coordinates?.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
      routePoints.push([lat, lng]);
    }
  });

  // Add current location
  if (!isNaN(currentLat) && !isNaN(currentLng)) {
    routePoints.push([currentLat, currentLng]);
  }

  // Add end point
  if (!isNaN(endLat) && !isNaN(endLng)) {
    routePoints.push([endLat, endLng]);
  }

  // Custom icons with proper anchor points
  const iconStart = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const iconCurrent = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const iconEnd = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const iconStop = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div
      className="w-full h-screen overflow-hidden"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div className="bg-purple-600 text-white shadow-md z-10">
        <div className="text-center py-3 text-xl font-semibold">
          🚗 Journey Map View
        </div>

        {/* Legend */}
        <div className="px-4 pb-3 flex justify-center items-center gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-600 rounded-full border-2 border-white shadow"></div>
            <span>Start Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow"></div>
            <span>Stop Points</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow"></div>
            <span>Current Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow"></div>
            <span>End Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-blue-500 rounded"></div>
            <span>Route Path</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, width: "100%", height: "100%" }}>
        <MapContainer
          center={routePoints[0] || [20.5937, 78.9629]}
          zoom={6}
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds points={routePoints} />

          {/* Start Marker */}
          {startLat && startLng && (
            <Marker position={[startLat, startLng]} icon={iconStart}>
              <Popup>
                <strong>Start Location</strong>
              </Popup>
            </Marker>
          )}

          {/* Stop Points Markers */}
          {stopPoints.map((stop, index) => {
            const lat = parseFloat(stop.coordinates?.lat);
            const lng = parseFloat(stop.coordinates?.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
              return (
                <Marker key={index} position={[lat, lng]} icon={iconStop}>
                  <Popup>
                    <div>
                      <strong>Stop Point {index + 1}</strong>
                      {stop.name && (
                        <p>
                          <strong>Name:</strong> {stop.name}
                        </p>
                      )}
                      {stop.location && (
                        <p>
                          <strong>Location:</strong> {stop.location}
                        </p>
                      )}
                      {stop.description && (
                        <p>
                          <strong>Description:</strong> {stop.description}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            }
            return null;
          })}

          {/* Current Location Marker */}
          {currentLat && currentLng && (
            <Marker position={[currentLat, currentLng]} icon={iconCurrent}>
              <Popup>
                <strong>Current Location</strong>
              </Popup>
            </Marker>
          )}

          {/* End Marker */}
          {endLat && endLng && (
            <Marker position={[endLat, endLng]} icon={iconEnd}>
              <Popup>
                <strong>End Location</strong>
              </Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {routePoints.length > 1 && (
            <Polyline
              positions={routePoints}
              color="blue"
              weight={5}
              opacity={0.7}
              lineJoin="round"
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;

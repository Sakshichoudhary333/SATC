import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function TestMap() {
  return (
    <div style={{ height: "400px" }}>
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[28.6139, 77.2090]}>
          <Popup>Delhi </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
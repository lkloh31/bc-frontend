import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";

import "../styles/pages/map.css";
import "../styles/components/button.css";

export default function MapPage() {
  const { token } = useAuth();

  return (
    <div className="map-page">
      <div className="map-box">Map box goes here.</div>
      <div className="map-sidebar">
        <div className="map-selection">Selection #1</div>
        <div className="map-selection">Selection #2</div>
        <div className="map-selection">+</div>
      </div>
    </div>
  );
}

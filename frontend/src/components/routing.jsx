import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const Routing = ({ start, end, onRouteFound }) => {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!start || !end) return;

    if (!routingRef.current) {
      routingRef.current = L.Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false, // Prevent map jumping
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [
            {
              color: "#00a63e",
              weight: 5,
              opacity: 0.8,
            },
          ],
        },
      }).addTo(map);

      routingRef.current.on("routesfound", (e) => {
        const route = e.routes[0];

        onRouteFound?.({
          distance: route.summary.totalDistance / 1000,
          duration: route.summary.totalTime / 60,
        });
      });
    } else {
      routingRef.current.setWaypoints([
        L.latLng(start[0], start[1]),
        L.latLng(end[0], end[1]),
      ]);
    }
  }, [start, end, map, onRouteFound]);

  useEffect(() => {
    return () => {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
      }
    };
  }, [map]);

  return null;
};

export default Routing;

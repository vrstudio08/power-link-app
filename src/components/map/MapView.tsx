import { useState, useCallback, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navigation2, Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useGoogleMaps } from "./GoogleMapsProvider";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0B0B0B" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0B0B0B" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#AAAAAA" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#CCCCCC" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#888888" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#151515" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#666666" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#222222" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#333333" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2A2A2A" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1A1A1A" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#1A1A1A" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#555555" }],
  },
];

interface MapViewProps {
  chargers: any[];
  onChargerSelect: (charger: any) => void;
  filteredChargers: any[];
}

const MapView = ({ chargers, onChargerSelect, filteredChargers }: MapViewProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCharger, setSelectedCharger] = useState<any>(null);
  const [center, setCenter] = useState({ lat: 15.4909, lng: 73.8278 }); // Goa default
  
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setCenter(location);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleRecenter = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(14);
    }
  };

  const handleMarkerClick = (charger: any) => {
    setSelectedCharger(charger);
    onChargerSelect(charger);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="relative h-full rounded-2xl overflow-hidden">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: darkMapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
        }}
      >
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#00E6FF",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            }}
          />
        )}

        {/* Charger markers */}
        {filteredChargers.map((charger) => (
          <Marker
            key={charger.id}
            position={{
              lat: parseFloat(charger.latitude),
              lng: parseFloat(charger.longitude),
            }}
            onClick={() => handleMarkerClick(charger)}
            icon={{
              path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
              fillColor: charger.is_active ? "#00FF99" : "#666666",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 1,
              scale: 1.5,
              anchor: new google.maps.Point(12, 22),
            }}
            animation={
              selectedCharger?.id === charger.id
                ? google.maps.Animation.BOUNCE
                : undefined
            }
          />
        ))}

        {/* Info Window */}
        {selectedCharger && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedCharger.latitude),
              lng: parseFloat(selectedCharger.longitude),
            }}
            onCloseClick={() => setSelectedCharger(null)}
          >
            <Card className="bg-card border-none shadow-none p-4 min-w-[250px]">
              <h3 className="font-semibold text-lg mb-2">{selectedCharger.title}</h3>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>{selectedCharger.power_output_kw} kW</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span>
                    {selectedCharger.rating_avg || 0} ({selectedCharger.total_reviews || 0})
                  </span>
                </div>
                <div className="text-primary font-semibold">
                  ₹{selectedCharger.price_per_hour}/hr
                </div>
              </div>
              <Link to={`/book/${selectedCharger.id}`}>
                <Button className="w-full rounded-full bg-primary hover:bg-primary/90" size="sm">
                  Book Now
                </Button>
              </Link>
            </Card>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Recenter button */}
      {userLocation && (
        <Button
          onClick={handleRecenter}
          size="icon"
          className="absolute bottom-4 right-4 rounded-full shadow-glow-cyan bg-secondary hover:bg-secondary/90"
        >
          <Navigation2 className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default MapView;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Navigation2, Phone } from "lucide-react";
import { useGoogleMaps } from "@/components/map/GoogleMapsProvider";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const NavigationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charger, setCharger] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (id) fetchCharger();
    getUserLocation();
  }, [id]);

  const fetchCharger = async () => {
    const { data } = await supabase
      .from("chargers")
      .select("*, profiles(name, email)")
      .eq("id", id)
      .single();

    if (data) {
      setCharger(data);
      if (userLocation) {
        calculateRoute(data);
      }
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        if (charger) {
          calculateRoute(charger);
        }
      });
    }
  };

  const calculateRoute = async (chargerData: any) => {
    if (!userLocation || !isLoaded) return;

    const directionsService = new google.maps.DirectionsService();
    const result = await directionsService.route({
      origin: userLocation,
      destination: {
        lat: parseFloat(chargerData.latitude),
        lng: parseFloat(chargerData.longitude),
      },
      travelMode: google.maps.TravelMode.DRIVING,
    });

    setDirections(result);
  };

  if (!isLoaded || !charger || !userLocation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
        }}
      >
        {/* User location */}
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

        {/* Destination */}
        <Marker
          position={{
            lat: parseFloat(charger.latitude),
            lng: parseFloat(charger.longitude),
          }}
          icon={{
            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
            fillColor: "#00FF99",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 1,
            scale: 2,
            anchor: new google.maps.Point(12, 22),
          }}
        />

        {/* Directions */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              polylineOptions: {
                strokeColor: "#00FF99",
                strokeWeight: 6,
              },
              suppressMarkers: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-background to-transparent">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="bg-card/95 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom info card */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <Card className="p-6 bg-card/95 backdrop-blur-sm border-border shadow-glow-green">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{charger.title}</h2>
              <p className="text-muted-foreground">{charger.address}</p>
            </div>
            <Button
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90"
              onClick={() => window.open(`tel:${charger.profiles?.email}`)}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>

          {directions && (
            <div className="flex items-center justify-between text-sm">
              <div>
                <span className="text-muted-foreground">Distance: </span>
                <span className="font-semibold">
                  {directions.routes[0].legs[0].distance?.text}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">ETA: </span>
                <span className="font-semibold">
                  {directions.routes[0].legs[0].duration?.text}
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default NavigationView;

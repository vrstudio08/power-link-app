import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Navigation as NavigationIcon } from "lucide-react";
import { useGoogleMaps } from "@/components/map/GoogleMapsProvider";

const mapContainerStyle = {
  width: "100%",
  height: "100dvh",
};

const ShareTrip = () => {
  const { token } = useParams();
  const [tripData, setTripData] = useState<any>(null);
  const [charger, setCharger] = useState<any>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (token) {
      fetchTripData();
      subscribeToUpdates();
    }
  }, [token]);

  const fetchTripData = async () => {
    const { data, error } = await supabase
      .from("trip_shares")
      .select("*")
      .eq("share_token", token)
      .eq("is_active", true)
      .single();

    if (!error && data) {
      setTripData(data);
      fetchCharger(data.charger_id);
      if (data.current_latitude && data.current_longitude) {
        calculateRoute(data);
      }
    }
  };

  const fetchCharger = async (chargerId: string) => {
    const { data } = await supabase
      .from("chargers")
      .select("*, profiles(name)")
      .eq("id", chargerId)
      .single();

    if (data) setCharger(data);
  };

  const subscribeToUpdates = () => {
    const channel = supabase
      .channel(`trip-${token}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trip_shares",
          filter: `share_token=eq.${token}`,
        },
        (payload) => {
          setTripData(payload.new);
          if (payload.new.current_latitude && payload.new.current_longitude) {
            calculateRoute(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateRoute = async (trip: any) => {
    if (!isLoaded || !trip.current_latitude || !trip.current_longitude) return;

    const directionsService = new google.maps.DirectionsService();
    try {
      const result = await directionsService.route({
        origin: {
          lat: parseFloat(trip.current_latitude),
          lng: parseFloat(trip.current_longitude),
        },
        destination: {
          lat: parseFloat(trip.destination_latitude),
          lng: parseFloat(trip.destination_longitude),
        },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  if (!isLoaded || !tripData || !charger) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading shared trip...</p>
        </div>
      </div>
    );
  }

  if (!tripData.is_active) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Trip Sharing Ended</h2>
          <p className="text-muted-foreground">
            This trip share is no longer active.
          </p>
        </Card>
      </div>
    );
  }

  const currentLocation = tripData.current_latitude && tripData.current_longitude
    ? { lat: parseFloat(tripData.current_latitude), lng: parseFloat(tripData.current_longitude) }
    : null;

  return (
    <div className="relative h-screen">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={currentLocation || {
          lat: parseFloat(tripData.destination_latitude),
          lng: parseFloat(tripData.destination_longitude),
        }}
        zoom={13}
        options={{
          disableDefaultUI: true,
          zoomControl: false,
        }}
      >
        {/* Current location */}
        {currentLocation && (
          <Marker
            position={currentLocation}
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

        {/* Destination */}
        <Marker
          position={{
            lat: parseFloat(tripData.destination_latitude),
            lng: parseFloat(tripData.destination_longitude),
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

        {/* Route */}
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

      {/* Info card */}
      <div className="absolute bottom-0 left-0 right-0 p-4 safe-bottom z-10">
        <Card className="p-4 md:p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NavigationIcon className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">En route to</span>
              </div>
              <h2 className="text-lg md:text-xl font-bold">{charger.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-1">{charger.address}</p>
            </div>

            {tripData.eta_minutes && tripData.distance_remaining_km && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">ETA</p>
                    <p className="text-sm font-semibold">{tripData.eta_minutes} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Distance</p>
                    <p className="text-sm font-semibold">{tripData.distance_remaining_km} km</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ShareTrip;

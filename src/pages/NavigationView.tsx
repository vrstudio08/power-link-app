import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Navigation2, Phone, Share2 } from "lucide-react";
import { useGoogleMaps } from "@/components/map/GoogleMapsProvider";
import { toast } from "sonner";

const mapContainerStyle = {
  width: "100%",
  height: "100dvh",
};

const NavigationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charger, setCharger] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (id) fetchCharger();
    getUserLocation();
  }, [id]);

  useEffect(() => {
    if (shareToken && userLocation && directions) {
      updateSharedLocation();
    }
  }, [userLocation, shareToken]);

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
    try {
      const result = await directionsService.route({
        origin: userLocation,
        destination: {
          lat: parseFloat(chargerData.latitude),
          lng: parseFloat(chargerData.longitude),
        },
        travelMode: google.maps.TravelMode.DRIVING,
      });

      setDirections(result);
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  const handleShare = async () => {
    if (!charger || !userLocation) return;

    setIsSharing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please login to share");
        return;
      }

      const token = crypto.randomUUID();
      const { data, error } = await supabase
        .from("trip_shares")
        .insert({
          charger_id: id,
          user_id: user.id,
          share_token: token,
          current_latitude: userLocation.lat,
          current_longitude: userLocation.lng,
          destination_latitude: parseFloat(charger.latitude),
          destination_longitude: parseFloat(charger.longitude),
          eta_minutes: directions?.routes[0].legs[0].duration?.value 
            ? Math.round(directions.routes[0].legs[0].duration.value / 60) 
            : null,
          distance_remaining_km: directions?.routes[0].legs[0].distance?.value
            ? parseFloat((directions.routes[0].legs[0].distance.value / 1000).toFixed(2))
            : null,
        })
        .select()
        .single();

      if (error) throw error;

      setShareToken(token);
      const shareUrl = `${window.location.origin}/share/${token}`;

      if (navigator.share) {
        await navigator.share({
          title: `I'm heading to ${charger.title}`,
          text: `Track my location and ETA to ${charger.address}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Failed to share location");
    } finally {
      setIsSharing(false);
    }
  };

  const updateSharedLocation = async () => {
    if (!shareToken || !userLocation || !directions) return;

    try {
      await supabase
        .from("trip_shares")
        .update({
          current_latitude: userLocation.lat,
          current_longitude: userLocation.lng,
          eta_minutes: Math.round(directions.routes[0].legs[0].duration?.value / 60),
          distance_remaining_km: parseFloat((directions.routes[0].legs[0].distance?.value / 1000).toFixed(2)),
        })
        .eq("share_token", shareToken);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const stopSharing = async () => {
    if (!shareToken) return;

    try {
      await supabase
        .from("trip_shares")
        .update({ is_active: false })
        .eq("share_token", shareToken);
      
      setShareToken(null);
      toast.success("Stopped sharing location");
    } catch (error) {
      console.error("Error stopping share:", error);
    }
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
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-background to-transparent z-10 safe-top">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="bg-card/95 backdrop-blur-sm shadow-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {shareToken ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={stopSharing}
              className="bg-card/95 backdrop-blur-sm shadow-lg text-destructive"
            >
              Stop Sharing
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              disabled={isSharing}
              className="bg-card/95 backdrop-blur-sm shadow-lg"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Bottom info card */}
      <div className="absolute bottom-0 left-0 right-0 p-4 safe-bottom z-10">
        <Card className="p-4 md:p-6 bg-card/95 backdrop-blur-sm border-border shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold mb-1 truncate">{charger.title}</h2>
              <p className="text-sm text-muted-foreground line-clamp-2">{charger.address}</p>
            </div>
            <Button
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 flex-shrink-0 ml-2"
              onClick={() => window.open(`tel:${charger.profiles?.email}`)}
            >
              <Phone className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>

          {directions && (
            <div className="flex items-center justify-between text-xs md:text-sm gap-4">
              <div className="flex-1">
                <span className="text-muted-foreground">Distance: </span>
                <span className="font-semibold">
                  {directions.routes[0].legs[0].distance?.text}
                </span>
              </div>
              <div className="flex-1">
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

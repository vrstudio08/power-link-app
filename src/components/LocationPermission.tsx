import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, AlertCircle } from "lucide-react";

interface LocationPermissionProps {
  onPermissionGranted: (location: { lat: number; lng: number }) => void;
}

const LocationPermission = ({ onPermissionGranted }: LocationPermissionProps) => {
  const [permissionStatus, setPermissionStatus] = useState<"prompt" | "granted" | "denied">("prompt");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!navigator.permissions) {
      setIsChecking(false);
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
      setPermissionStatus(result.state as "prompt" | "granted" | "denied");
      
      if (result.state === "granted") {
        requestLocation();
      } else {
        setIsChecking(false);
      }
    } catch (error) {
      setIsChecking(false);
    }
  };

  const requestLocation = () => {
    setIsChecking(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setPermissionStatus("granted");
        onPermissionGranted(location);
      },
      (error) => {
        console.error("Location error:", error);
        setPermissionStatus("denied");
        setIsChecking(false);
      }
    );
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (permissionStatus === "granted") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 bg-gradient-card backdrop-blur-sm border-border shadow-card text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
          {permissionStatus === "denied" ? (
            <AlertCircle className="w-10 h-10 text-destructive" />
          ) : (
            <MapPin className="w-10 h-10 text-primary" />
          )}
        </div>

        <h2 className="text-2xl font-bold mb-4">
          {permissionStatus === "denied" ? "Location Access Denied" : "Enable Location"}
        </h2>

        <p className="text-muted-foreground mb-6">
          {permissionStatus === "denied"
            ? "We need your location to show nearby chargers and provide navigation. Please enable location access in your browser settings."
            : "We need your location to find the best chargers near you and provide accurate navigation."}
        </p>

        {permissionStatus === "prompt" && (
          <Button
            onClick={requestLocation}
            className="w-full rounded-full bg-primary hover:bg-primary/90 shadow-glow-green"
            size="lg"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Enable Location
          </Button>
        )}

        {permissionStatus === "denied" && (
          <div className="space-y-3">
            <Button
              onClick={checkPermission}
              className="w-full rounded-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Check Again
            </Button>
            <p className="text-xs text-muted-foreground">
              Location blocked? Check your browser settings to allow access.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LocationPermission;

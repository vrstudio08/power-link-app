import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Zap, Star, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import MapView from "@/components/map/MapView";
import MapFilters, { FilterState } from "@/components/map/MapFilters";
import SearchAutocomplete from "@/components/map/SearchAutocomplete";
import ChargerDetailSheet from "@/components/map/ChargerDetailSheet";
import LocationPermission from "@/components/LocationPermission";

interface DriverDashboardProps {
  user: any;
  profile: any;
}

const DriverDashboard = ({ user, profile }: DriverDashboardProps) => {
  const [chargers, setChargers] = useState<any[]>([]);
  const [selectedCharger, setSelectedCharger] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    connectorType: "All",
    maxPrice: 500,
    minRating: 0,
    distance: 50,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userVehicles, setUserVehicles] = useState<any[]>([]);

  useEffect(() => {
    if (locationGranted) {
      fetchChargers();
      fetchFavorites();
      fetchUserVehicles();
    }

    // Set up real-time subscription
    const channel = supabase
      .channel("chargers-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chargers",
        },
        () => {
          fetchChargers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [locationGranted]);

  const fetchChargers = async () => {
    const { data, error } = await supabase
      .from("chargers")
      .select("*, profiles(name)")
      .eq("is_active", true);

    if (!error && data) {
      setChargers(data);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("charger_id")
      .eq("user_id", user.id);

    if (data) {
      setFavorites(new Set(data.map((f) => f.charger_id)));
    }
  };

  const fetchUserVehicles = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", user.id);

    if (data && data.length > 0) {
      setUserVehicles(data);
      // Auto-set connector type filter to match user's vehicle
      if (data[0].connector_type) {
        setFilters((prev) => ({
          ...prev,
          connectorType: data[0].connector_type,
        }));
      }
    }
  };

  const toggleFavorite = async (chargerId: string) => {
    if (!user) return;

    if (favorites.has(chargerId)) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("charger_id", chargerId);
      
      setFavorites((prev) => {
        const next = new Set(prev);
        next.delete(chargerId);
        return next;
      });
      toast.success("Removed from favorites");
    } else {
      await supabase
        .from("favorites")
        .insert({ user_id: user.id, charger_id: chargerId });
      
      setFavorites((prev) => new Set([...prev, chargerId]));
      toast.success("Added to favorites");
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredChargers = useMemo(() => {
    return chargers.filter((charger) => {
      // Connector type filter
      if (filters.connectorType !== "All" && charger.connector_type !== filters.connectorType) {
        return false;
      }

      // Price filter
      if (parseFloat(charger.price_per_hour) > filters.maxPrice) {
        return false;
      }

      // Rating filter
      if ((charger.rating_avg || 0) < filters.minRating) {
        return false;
      }

      // Distance filter
      if (userLocation && filters.distance < 50) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          parseFloat(charger.latitude),
          parseFloat(charger.longitude)
        );
        if (distance > filters.distance) {
          return false;
        }
      }

      return true;
    });
  }, [chargers, filters, userLocation]);

  const handleChargerSelect = (charger: any) => {
    setSelectedCharger(charger);
    setIsDetailOpen(true);
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      const newCenter = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setMapCenter(newCenter);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      connectorType: "All",
      maxPrice: 500,
      minRating: 0,
      distance: 50,
    });
  };

  // Get closest 3 chargers
  const closestChargers = useMemo(() => {
    if (!userLocation) return [];
    const withDistance = filteredChargers.map((charger) => ({
      ...charger,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        parseFloat(charger.latitude),
        parseFloat(charger.longitude)
      ),
    }));
    return withDistance.sort((a, b) => a.distance - b.distance).slice(0, 3);
  }, [filteredChargers, userLocation]);

  // Get favorite chargers
  const favoriteChargers = useMemo(() => {
    return chargers.filter((c) => favorites.has(c.id));
  }, [chargers, favorites]);

  if (!locationGranted) {
    return (
      <LocationPermission
        onPermissionGranted={(location) => {
          setUserLocation(location);
          setLocationGranted(true);
        }}
      />
    );
  }

  const ChargerCard = ({ charger, showDistance }: { charger: any; showDistance?: boolean }) => (
    <Card
      key={charger.id}
      className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card hover:shadow-glow-green transition-all cursor-pointer"
      onClick={() => handleChargerSelect(charger)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-semibold">{charger.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(charger.id);
              }}
              className="h-8 w-8"
            >
              <Heart
                className={`h-5 w-5 ${
                  favorites.has(charger.id) ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
            </Button>
          </div>
          <p className="text-muted-foreground mb-3">{charger.address}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-primary" />
              <span>{charger.power_output_kw} kW</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-primary" />
              <span>
                {charger.rating_avg || 0} ({charger.total_reviews || 0})
              </span>
            </div>
            <div className="text-primary font-semibold">₹{charger.price_per_hour}/hr</div>
            {showDistance && charger.distance && (
              <div className="text-muted-foreground">{charger.distance.toFixed(1)} km away</div>
            )}
          </div>
        </div>
        <Link to={`/book/${charger.id}`} onClick={(e) => e.stopPropagation()}>
          <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-glow-green">
            Book Now
          </Button>
        </Link>
      </div>
    </Card>
  );

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-card border-b border-border p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">Find Chargers</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.name}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <SearchAutocomplete onPlaceSelect={handlePlaceSelect} />
          <MapFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Map View */}
        <div className="mb-6 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-card">
          <MapView
            chargers={chargers}
            onChargerSelect={handleChargerSelect}
            filteredChargers={filteredChargers}
            searchCenter={mapCenter}
            userLocation={userLocation}
          />
        </div>

        {/* Closest Chargers */}
        {closestChargers.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">Nearest Chargers</h2>
            {closestChargers.map((charger) => (
              <ChargerCard key={charger.id} charger={charger} showDistance />
            ))}
          </div>
        )}

        {/* Favorite Chargers */}
        {favoriteChargers.length > 0 && (
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Heart className="h-6 w-6 fill-primary text-primary" />
              Favorites
            </h2>
            {favoriteChargers.map((charger) => (
              <ChargerCard key={charger.id} charger={charger} />
            ))}
          </div>
        )}

        {/* All Chargers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              {filteredChargers.length} Chargers Available
            </h2>
          </div>

          {filteredChargers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No chargers match your filters</p>
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            filteredChargers.map((charger) => <ChargerCard key={charger.id} charger={charger} />)
          )}
        </div>
      </div>

      {/* Charger Detail Sheet */}
      <ChargerDetailSheet
        charger={selectedCharger}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Add EV Button */}
      <Link to="/add">
        <Button
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-glow-green z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>

      <Navigation />
    </div>
  );
};

export default DriverDashboard;
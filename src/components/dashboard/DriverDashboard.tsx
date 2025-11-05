import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Zap, Star, Filter, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface DriverDashboardProps {
  user: any;
  profile: any;
}

const DriverDashboard = ({ user, profile }: DriverDashboardProps) => {
  const [chargers, setChargers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchChargers();
  }, []);

  const fetchChargers = async () => {
    const { data, error } = await supabase
      .from("chargers")
      .select("*, profiles(name)")
      .eq("is_active", true);

    if (!error && data) {
      setChargers(data);
    }
  };

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
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="icon" className="border-border">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Map Placeholder */}
        <div className="mb-6 h-64 rounded-2xl bg-gradient-card border border-border flex items-center justify-center">
          <p className="text-muted-foreground">Map view coming soon</p>
        </div>

        {/* Charger List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold mb-4">Available Chargers</h2>
          {chargers.map((charger) => (
            <Card
              key={charger.id}
              className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card hover:shadow-glow-green transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{charger.title}</h3>
                  <p className="text-muted-foreground mb-3">{charger.address}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-primary" />
                      <span>{charger.power_output_kw} kW</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-primary" />
                      <span>{charger.rating_avg || 0} ({charger.total_reviews || 0})</span>
                    </div>
                    <div className="text-primary font-semibold">
                      ₹{charger.price_per_hour}/hr
                    </div>
                  </div>
                </div>
                <Link to={`/book/${charger.id}`}>
                  <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-glow-green">
                    Book Now
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add EV Button */}
      <Link to="/add">
        <Button
          className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-glow-green"
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
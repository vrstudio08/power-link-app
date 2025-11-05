import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, DollarSign, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

interface OwnerDashboardProps {
  user: any;
  profile: any;
}

const OwnerDashboard = ({ user, profile }: OwnerDashboardProps) => {
  const [chargers, setChargers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, totalEarnings: 0, avgRating: 0 });

  useEffect(() => {
    fetchChargers();
    fetchStats();
  }, [user]);

  const fetchChargers = async () => {
    const { data, error } = await supabase
      .from("chargers")
      .select("*")
      .eq("owner_id", user?.id);

    if (!error && data) {
      setChargers(data);
    }
  };

  const fetchStats = async () => {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("amount_paid, chargers(owner_id)")
      .eq("chargers.owner_id", user?.id)
      .eq("status", "completed");

    if (bookings) {
      const totalEarnings = bookings.reduce((sum, b) => sum + Number(b.amount_paid), 0);
      setStats({
        totalBookings: bookings.length,
        totalEarnings,
        avgRating: 4.5,
      });
    }
  };

  const toggleChargerStatus = async (chargerId: string, currentStatus: boolean) => {
    await supabase
      .from("chargers")
      .update({ is_active: !currentStatus })
      .eq("id", chargerId);
    fetchChargers();
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-card border-b border-border p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">My Chargers</h1>
          <p className="text-muted-foreground">Manage your charging stations</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-card border-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Bookings</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalBookings}</p>
          </Card>
          <Card className="p-4 bg-gradient-card border-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Earnings</span>
            </div>
            <p className="text-2xl font-bold">₹{stats.totalEarnings}</p>
          </Card>
          <Card className="p-4 bg-gradient-card border-border shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Rating</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgRating}</p>
          </Card>
        </div>

        {/* Charger List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Your Chargers</h2>
            <Link to="/add">
              <Button className="rounded-full bg-primary hover:bg-primary/90 shadow-glow-green">
                <Plus className="mr-2 h-4 w-4" />
                Add Charger
              </Button>
            </Link>
          </div>

          {chargers.map((charger) => (
            <Card
              key={charger.id}
              className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{charger.title}</h3>
                    <Badge variant={charger.is_active ? "default" : "secondary"}>
                      {charger.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
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
                <Button
                  variant="outline"
                  onClick={() => toggleChargerStatus(charger.id, charger.is_active)}
                  className="border-border"
                >
                  {charger.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </Card>
          ))}

          {chargers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No chargers added yet</p>
              <Link to="/add">
                <Button className="rounded-full bg-primary hover:bg-primary/90">
                  Add Your First Charger
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
};

export default OwnerDashboard;
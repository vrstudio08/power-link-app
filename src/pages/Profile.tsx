import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, User, Mail, Shield, Car, Zap, Edit, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [chargers, setChargers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchVehicles();
    fetchChargers();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const fetchVehicles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("vehicles")
      .select("*")
      .eq("owner_id", user.id);

    if (data) {
      setVehicles(data);
    }
  };

  const fetchChargers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("chargers")
      .select("*")
      .eq("owner_id", user.id);

    if (data) {
      setChargers(data);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    } else {
      toast({ title: "Vehicle deleted successfully" });
      fetchVehicles();
    }
  };

  const handleDeleteCharger = async (chargerId: string) => {
    const { error } = await supabase
      .from("chargers")
      .delete()
      .eq("id", chargerId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete charger",
        variant: "destructive",
      });
    } else {
      toast({ title: "Charger deleted successfully" });
      fetchChargers();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-card border-b border-border p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {profile.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-muted-foreground capitalize">{profile.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{profile.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Vehicles Section */}
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Car className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">My Vehicles</h2>
          </div>
          {vehicles.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No vehicles registered</p>
          ) : (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {vehicle.vehicle_name || `${vehicle.company} ${vehicle.model}`}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{vehicle.connector_type}</Badge>
                      <Badge variant="outline">{vehicle.battery_capacity} kWh</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/add?type=vehicle&edit=${vehicle.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this vehicle? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteVehicle(vehicle.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Chargers Section */}
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">My Chargers</h2>
          </div>
          {chargers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No chargers registered</p>
          ) : (
            <div className="space-y-3">
              {chargers.map((charger) => (
                <div
                  key={charger.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{charger.title}</h3>
                    <p className="text-sm text-muted-foreground">{charger.address}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{charger.power_output_kw} kW</Badge>
                      <Badge variant="outline">₹{charger.price_per_hour}/hr</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/add?type=charger&edit=${charger.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Charger?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this charger? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteCharger(charger.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="w-full rounded-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default Profile;
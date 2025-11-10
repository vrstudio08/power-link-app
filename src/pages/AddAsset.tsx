import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";

const AddAsset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("charger");

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'vehicle' || type === 'charger') {
      setActiveTab(type);
    }
  }, [searchParams]);

  const handleAddCharger = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    const chargerData = {
      owner_id: user.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      connector_type: formData.get("connector_type") as string,
      power_output_kw: parseFloat(formData.get("power_output_kw") as string),
      company: formData.get("company") as string,
      price_per_hour: parseFloat(formData.get("price_per_hour") as string),
      address: formData.get("address") as string,
      latitude: parseFloat(formData.get("latitude") as string) || 15.4909,
      longitude: parseFloat(formData.get("longitude") as string) || 73.8278,
      parking_type: formData.get("parking_type") as string,
    };

    const { error } = await supabase.from("chargers").insert([chargerData]);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success!", description: "Charger added successfully" });
      navigate("/dashboard");
    }
  };

  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate("/auth");
      return;
    }

    const vehicleData = {
      owner_id: user.id,
      model: formData.get("model") as string,
      company: formData.get("company") as string,
      connector_type: formData.get("connector_type") as string,
      battery_capacity: parseFloat(formData.get("battery_capacity") as string),
      power_output: parseFloat(formData.get("power_output") as string),
      plate_number: formData.get("plate_number") as string,
      bms_protocol: formData.get("bms_protocol") as string,
      charging_preferences: formData.get("charging_preferences") as string,
    };

    const { error } = await supabase.from("vehicles").insert([vehicleData]);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success!", description: "Vehicle added successfully" });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-card border-b border-border p-6">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Add Asset</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="charger">Add Charger</TabsTrigger>
            <TabsTrigger value="vehicle">Add EV</TabsTrigger>
          </TabsList>

          <TabsContent value="charger">
            <Card className="p-6 bg-gradient-card border-border shadow-card">
              <form onSubmit={handleAddCharger} className="space-y-4">
                <div>
                  <Label htmlFor="title">Charger Name</Label>
                  <Input id="title" name="title" required className="bg-muted/50" />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" className="bg-muted/50" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="connector_type">Connector Type</Label>
                    <Input id="connector_type" name="connector_type" required className="bg-muted/50" />
                  </div>
                  <div>
                    <Label htmlFor="power_output_kw">Power Output (kW)</Label>
                    <Input id="power_output_kw" name="power_output_kw" type="number" step="0.1" required className="bg-muted/50" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" name="company" className="bg-muted/50" />
                  </div>
                  <div>
                    <Label htmlFor="price_per_hour">Price per Hour (₹)</Label>
                    <Input id="price_per_hour" name="price_per_hour" type="number" step="0.01" required className="bg-muted/50" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" required className="bg-muted/50" />
                </div>
                <div>
                  <Label htmlFor="parking_type">Parking Type</Label>
                  <Input id="parking_type" name="parking_type" placeholder="e.g., Covered, Open" className="bg-muted/50" />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-primary hover:bg-primary/90 shadow-glow-green"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Charger
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="vehicle">
            <Card className="p-6 bg-gradient-card border-border shadow-card">
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="v-company">Company</Label>
                    <Input id="v-company" name="company" required className="bg-muted/50" />
                  </div>
                  <div>
                    <Label htmlFor="v-model">Model</Label>
                    <Input id="v-model" name="model" required className="bg-muted/50" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="v-connector_type">Connector Type</Label>
                    <Input id="v-connector_type" name="connector_type" required className="bg-muted/50" />
                  </div>
                  <div>
                    <Label htmlFor="battery_capacity">Battery Capacity (kWh)</Label>
                    <Input id="battery_capacity" name="battery_capacity" type="number" step="0.1" required className="bg-muted/50" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="power_output">Power Output (kW)</Label>
                    <Input id="power_output" name="power_output" type="number" step="0.1" className="bg-muted/50" />
                  </div>
                  <div>
                    <Label htmlFor="plate_number">Plate Number</Label>
                    <Input id="plate_number" name="plate_number" className="bg-muted/50" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bms_protocol">BMS Protocol</Label>
                  <Input id="bms_protocol" name="bms_protocol" className="bg-muted/50" />
                </div>
                <div>
                  <Label htmlFor="charging_preferences">Charging Preferences</Label>
                  <Textarea id="charging_preferences" name="charging_preferences" className="bg-muted/50" />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full bg-primary hover:bg-primary/90 shadow-glow-green"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Vehicle
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Navigation />
    </div>
  );
};

export default AddAsset;
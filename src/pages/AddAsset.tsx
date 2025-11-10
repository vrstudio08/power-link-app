import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Plug, Battery, MapPin, Clock, DollarSign, Zap, Car, Upload, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import { GoogleMapsProvider } from "@/components/map/GoogleMapsProvider";
import SearchAutocomplete from "@/components/map/SearchAutocomplete";

// Constants for dropdown options
const CONNECTOR_TYPES = ["Type 2", "CCS2", "CHAdeMO", "Bharat AC001", "Bharat DC001"];
const POWER_OUTPUTS = [3.3, 7.4, 11, 22, 50];
const POWER_SOURCES = ["Grid", "Solar", "Hybrid"];
const PARKING_TYPES = ["Private Garage", "Public Lot", "Street Parking", "Mall Parking"];
const CHARGER_COMPANIES = ["Ather", "Ola Electric", "Bajaj", "TVS", "Tata Power", "Statiq", "Fortum", "Zeon Charging"];
const CHARGING_FEE_TYPES = ["Per Hour", "Per kWh"];
const AMENITIES = ["CCTV", "Washroom", "Wi-Fi", "Coffee Nearby", "24x7 Access"];

const EV_COMPANIES = ["Ather", "Ola Electric", "Bajaj", "TVS", "Revolt", "Hero Electric", "Simple Energy", "Ultraviolette"];
const MODEL_YEARS = Array.from({ length: 6 }, (_, i) => 2020 + i);
const CHARGING_PREFERENCES = ["Fast Charging", "Normal Charging", "Overnight"];
const BMS_PROTOCOLS = ["CAN", "RS485", "OCPP 1.6", "OCPP 2.0.1"];
const EV_TYPES = ["2-Wheeler", "3-Wheeler", "4-Wheeler"];
const BATTERY_CAPACITIES = [3.7, 5.0, 7.2, 10.0, 15.0];

const AddAsset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("charger");
  
  // Charger form state
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [chargerImages, setChargerImages] = useState<File[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  // Vehicle form state
  const [vehicleImage, setVehicleImage] = useState<File | null>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'vehicle' || type === 'charger') {
      setActiveTab(type);
    }
  }, [searchParams]);

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry?.location) {
      setSelectedLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      setAddress(place.formatted_address || "");
    }
  };

  const uploadFiles = async (files: File[], bucket: string, userId: string) => {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleAddCharger = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Validate required fields
      if (!selectedLocation) {
        toast({
          title: "Error",
          description: "Please select a location from the map",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Upload images if any
      let imageUrls: string[] = [];
      if (chargerImages.length > 0) {
        imageUrls = await uploadFiles(chargerImages, 'charger-images', user.id);
      }

      const chargerData = {
        owner_id: user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        connector_type: formData.get("connector_type") as string,
        power_output_kw: parseFloat(formData.get("power_output_kw") as string),
        power_source: formData.get("power_source") as string || null,
        company: formData.get("company") as string,
        price_per_hour: parseFloat(formData.get("price_per_hour") as string),
        charging_fee_type: formData.get("charging_fee_type") as string,
        availability_start: formData.get("availability_start") as string || null,
        availability_end: formData.get("availability_end") as string || null,
        address: address,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        parking_type: formData.get("parking_type") as string,
        amenities: selectedAmenities,
        images: imageUrls,
        contact_number: formData.get("contact_number") as string || null,
        is_active: isActive,
      };

      const { error } = await supabase.from("chargers").insert([chargerData]);

      if (error) throw error;

      toast({ title: "Success!", description: "Charger added successfully" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate("/auth");
        return;
      }

      // Upload vehicle image if any
      let imageUrl: string | null = null;
      if (vehicleImage) {
        const urls = await uploadFiles([vehicleImage], 'vehicle-images', user.id);
        imageUrl = urls[0];
      }

      const vehicleData = {
        owner_id: user.id,
        vehicle_name: formData.get("vehicle_name") as string,
        model: formData.get("model") as string,
        company: formData.get("company") as string,
        model_year: formData.get("model_year") ? parseInt(formData.get("model_year") as string) : null,
        connector_type: formData.get("connector_type") as string,
        battery_capacity: parseFloat(formData.get("battery_capacity") as string),
        power_output: formData.get("power_output") ? parseFloat(formData.get("power_output") as string) : null,
        preferred_charger_power: formData.get("preferred_charger_power") ? parseFloat(formData.get("preferred_charger_power") as string) : null,
        plate_number: formData.get("plate_number") as string || null,
        bms_protocol: formData.get("bms_protocol") as string || null,
        charging_preferences: formData.get("charging_preferences") as string || null,
        range_km: formData.get("range_km") ? parseFloat(formData.get("range_km") as string) : null,
        ev_type: formData.get("ev_type") as string,
        color: formData.get("color") as string || null,
        vehicle_image: imageUrl,
      };

      const { error } = await supabase.from("vehicles").insert([vehicleData]);

      if (error) throw error;

      toast({ title: "Success!", description: "Vehicle added successfully" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleMapsProvider>
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
              <TabsTrigger value="charger">
                <Plug className="mr-2 h-4 w-4" />
                Add Charger
              </TabsTrigger>
              <TabsTrigger value="vehicle">
                <Car className="mr-2 h-4 w-4" />
                Add EV
              </TabsTrigger>
            </TabsList>

          <TabsContent value="charger">
            <Card className="p-6 bg-gradient-card border-border shadow-card">
              <form onSubmit={handleAddCharger} className="space-y-6">
                {/* BASIC INFORMATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Basic Information</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <Plug className="h-4 w-4" />
                      Charger Name *
                    </Label>
                    <Input id="title" name="title" required className="bg-muted/50 mt-1" placeholder="e.g., Ather Grid Charger - Panjim" />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" className="bg-muted/50 mt-1" placeholder="Fast charger near Café Mojo, available 8am–10pm" />
                  </div>
                </div>

                {/* TECHNICAL SPECIFICATIONS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <Battery className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Technical Specifications</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="connector_type">Connector Type *</Label>
                      <Select name="connector_type" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select connector" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {CONNECTOR_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="power_output_kw">Power Output (kW) *</Label>
                      <Select name="power_output_kw" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select power" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {POWER_OUTPUTS.map((power) => (
                            <SelectItem key={power} value={power.toString()}>{power} kW</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="power_source">Power Source</Label>
                      <Select name="power_source">
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {POWER_SOURCES.map((source) => (
                            <SelectItem key={source} value={source}>{source}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="company">Company / Brand *</Label>
                      <Select name="company" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select company" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {CHARGER_COMPANIES.map((company) => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* PRICING & AVAILABILITY */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Pricing & Availability</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price_per_hour" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Price per Hour (₹) *
                      </Label>
                      <Input id="price_per_hour" name="price_per_hour" type="number" step="0.01" min="0" required className="bg-muted/50 mt-1" placeholder="50" />
                    </div>

                    <div>
                      <Label htmlFor="charging_fee_type">Charging Fee Type *</Label>
                      <Select name="charging_fee_type" defaultValue="Per Hour" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {CHARGING_FEE_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="availability_start" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Available From *
                      </Label>
                      <Input id="availability_start" name="availability_start" type="time" required className="bg-muted/50 mt-1" />
                    </div>

                    <div>
                      <Label htmlFor="availability_end">Available Until *</Label>
                      <Input id="availability_end" name="availability_end" type="time" required className="bg-muted/50 mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <Label htmlFor="is_active" className="cursor-pointer">Charger Active</Label>
                    <Switch id="is_active" checked={isActive} onCheckedChange={setIsActive} />
                  </div>
                </div>

                {/* LOCATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Location</h3>
                  </div>

                  <div>
                    <Label htmlFor="address">Search Address *</Label>
                    <div className="mt-1">
                      <SearchAutocomplete onPlaceSelect={handlePlaceSelect} placeholder="Search for your charger location..." />
                    </div>
                    {selectedLocation && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Selected: {address} ({selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)})
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="parking_type">Parking Type *</Label>
                    <Select name="parking_type" required>
                      <SelectTrigger className="bg-muted/50 mt-1">
                        <SelectValue placeholder="Select parking type" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border z-50">
                        {PARKING_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* AMENITIES */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Amenities</h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {AMENITIES.map((amenity) => (
                      <div key={amenity} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity}
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAmenities([...selectedAmenities, amenity]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                            }
                          }}
                        />
                        <Label htmlFor={amenity} className="text-sm cursor-pointer">{amenity}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* IMAGES & CONTACT */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Images & Contact</h3>
                  </div>

                  <div>
                    <Label htmlFor="charger_images">Upload Photos (Max 3)</Label>
                    <Input
                      id="charger_images"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []).slice(0, 3);
                        setChargerImages(files);
                      }}
                      className="bg-muted/50 mt-1"
                    />
                    {chargerImages.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {chargerImages.map((file, idx) => (
                          <div key={idx} className="relative">
                            <img src={URL.createObjectURL(file)} alt="Preview" className="h-16 w-16 object-cover rounded" />
                            <button
                              type="button"
                              onClick={() => setChargerImages(chargerImages.filter((_, i) => i !== idx))}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input id="contact_number" name="contact_number" type="tel" placeholder="+91 9XXXXXXXXX" className="bg-muted/50 mt-1" />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 shadow-glow-green transition-all"
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
              <form onSubmit={handleAddVehicle} className="space-y-6">
                {/* BASIC INFORMATION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <Car className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Vehicle Information</h3>
                  </div>

                  <div>
                    <Label htmlFor="vehicle_name">Vehicle Name *</Label>
                    <Input id="vehicle_name" name="vehicle_name" required className="bg-muted/50 mt-1" placeholder="e.g., Ather 450X Gen 3" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="v-company">Manufacturer / Company *</Label>
                      <Select name="company" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {EV_COMPANIES.map((company) => (
                            <SelectItem key={company} value={company}>{company}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="v-model">Model *</Label>
                      <Input id="v-model" name="model" required className="bg-muted/50 mt-1" placeholder="450X" />
                    </div>

                    <div>
                      <Label htmlFor="model_year">Model Year</Label>
                      <Select name="model_year">
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {MODEL_YEARS.map((year) => (
                            <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="ev_type">EV Type *</Label>
                      <Select name="ev_type" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {EV_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* TECHNICAL SPECIFICATIONS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <Battery className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Technical Specifications</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="v-connector_type">Connector Type *</Label>
                      <Select name="connector_type" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select connector" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {CONNECTOR_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="battery_capacity">Battery Capacity (kWh) *</Label>
                      <Select name="battery_capacity" required>
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {BATTERY_CAPACITIES.map((capacity) => (
                            <SelectItem key={capacity} value={capacity.toString()}>{capacity} kWh</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="power_output">Power Output (kW)</Label>
                      <Select name="power_output">
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select power" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {POWER_OUTPUTS.map((power) => (
                            <SelectItem key={power} value={power.toString()}>{power} kW</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="preferred_charger_power">Preferred Charger Power (kW)</Label>
                      <Select name="preferred_charger_power">
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select power" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {POWER_OUTPUTS.map((power) => (
                            <SelectItem key={power} value={power.toString()}>{power} kW</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="range_km">Range (km)</Label>
                      <Input id="range_km" name="range_km" type="number" min="0" className="bg-muted/50 mt-1" placeholder="100-200" />
                    </div>

                    <div>
                      <Label htmlFor="bms_protocol">BMS Protocol</Label>
                      <Select name="bms_protocol">
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {BMS_PROTOCOLS.map((protocol) => (
                            <SelectItem key={protocol} value={protocol}>{protocol}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* CHARGING & DETAILS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Charging & Details</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="charging_preferences">Charging Preference</Label>
                      <Select name="charging_preferences">
                        <SelectTrigger className="bg-muted/50 mt-1">
                          <SelectValue placeholder="Select preference" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border z-50">
                          {CHARGING_PREFERENCES.map((pref) => (
                            <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="plate_number">Plate Number</Label>
                      <Input id="plate_number" name="plate_number" className="bg-muted/50 mt-1" placeholder="GA-08-AX-1234" />
                    </div>

                    <div>
                      <Label htmlFor="color">Color</Label>
                      <Input id="color" name="color" type="color" className="bg-muted/50 mt-1 h-10" />
                    </div>
                  </div>
                </div>

                {/* VEHICLE IMAGE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                    <Upload className="h-5 w-5 text-primary" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">Vehicle Image</h3>
                  </div>

                  <div>
                    <Label htmlFor="vehicle_image">Upload EV Photo</Label>
                    <Input
                      id="vehicle_image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setVehicleImage(e.target.files[0]);
                        }
                      }}
                      className="bg-muted/50 mt-1"
                    />
                    {vehicleImage && (
                      <div className="relative mt-2 inline-block">
                        <img src={URL.createObjectURL(vehicleImage)} alt="Preview" className="h-24 w-24 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => setVehicleImage(null)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-full bg-gradient-to-r from-primary to-cyan-500 hover:opacity-90 shadow-glow-green transition-all"
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
    </GoogleMapsProvider>
  );
};

export default AddAsset;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarIcon, Clock, Zap, MapPin, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Book = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [charger, setCharger] = useState<any>(null);
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchCharger();
  }, [id]);

  const fetchCharger = async () => {
    const { data, error } = await supabase
      .from("chargers")
      .select("*, profiles(name)")
      .eq("id", id)
      .single();

    if (!error && data) {
      setCharger(data);
    }
  };

  const calculateAmount = () => {
    if (!startTime || !endTime) return 0;
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours * parseFloat(charger?.price_per_hour || 0);
  };

  const handleBooking = async () => {
    if (!date || !startTime || !endTime) {
      toast.error("Please fill all fields");
      return;
    }

    const amount = calculateAmount();
    if (amount <= 0) {
      toast.error("Invalid time selection");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please login first");
      setLoading(false);
      return;
    }

    const startDateTime = new Date(date);
    const [startHour, startMin] = startTime.split(":");
    startDateTime.setHours(parseInt(startHour), parseInt(startMin));

    const endDateTime = new Date(date);
    const [endHour, endMin] = endTime.split(":");
    endDateTime.setHours(parseInt(endHour), parseInt(endMin));

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        charger_id: id,
        driver_id: user.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        amount_paid: amount,
        payment_method: paymentMethod,
        payment_status: "paid",
        status: "confirmed",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error("Booking failed");
      return;
    }

    toast.success("Booking confirmed!");
    navigate(`/navigate/${id}`, { state: { booking: data } });
  };

  if (!charger) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-card border-b border-border p-6">
        <div className="container mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold mb-2">Book Charger</h1>
          <p className="text-muted-foreground">{charger.title}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card mb-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{charger.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>{charger.power_output_kw} kW</span>
            </div>
            <div className="text-2xl font-semibold text-primary">
              ₹{charger.price_per_hour}/hr
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card mb-6">
          <div className="space-y-6">
            <div>
              <Label className="mb-3 block">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-3 block">Start Time</Label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg"
                />
              </div>
              <div>
                <Label className="mb-3 block">End Time</Label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi" className="cursor-pointer flex-1">UPI</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="cursor-pointer flex-1">Card</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet" className="cursor-pointer flex-1">Wallet</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground">Total Amount</span>
            <span className="text-3xl font-bold text-primary">
              ₹{calculateAmount().toFixed(2)}
            </span>
          </div>
          <Button
            onClick={handleBooking}
            disabled={loading}
            className="w-full rounded-full bg-primary hover:bg-primary/90 shadow-glow-green"
            size="lg"
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Book;

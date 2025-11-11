import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Calendar, Clock, MapPin, Trash2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("*, chargers(title, address, power_output_kw)")
      .eq("driver_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", bookingId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully",
      });
      fetchBookings();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "confirmed": return "secondary";
      case "pending": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-gradient-card border-b border-border p-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">View your charging history</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="p-6 bg-gradient-card backdrop-blur-sm border-border shadow-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold">{booking.chargers?.title}</h3>
                  <Badge variant={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{booking.chargers?.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(booking.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {new Date(booking.start_time).toLocaleTimeString()} - {new Date(booking.end_time).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <span className="text-sm text-muted-foreground">Amount Paid</span>
                    <span className="text-lg font-semibold text-primary ml-4">₹{booking.amount_paid}</span>
                  </div>
                  {booking.status !== "cancelled" && booking.status !== "completed" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No, keep it</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteBooking(booking.id)}>
                            Yes, cancel booking
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  );
};

export default Bookings;
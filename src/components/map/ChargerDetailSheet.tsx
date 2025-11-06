import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { MapPin, Zap, Star, Clock, DollarSign, User } from "lucide-react";
import { Link } from "react-router-dom";

interface ChargerDetailSheetProps {
  charger: any;
  isOpen: boolean;
  onClose: () => void;
}

const ChargerDetailSheet = ({ charger, isOpen, onClose }: ChargerDetailSheetProps) => {
  if (!charger) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] bg-card/95 backdrop-blur-sm border-border rounded-t-3xl">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-2xl">{charger.title}</SheetTitle>
            <Badge variant={charger.is_active ? "default" : "secondary"}>
              {charger.is_active ? "Available" : "Inactive"}
            </Badge>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Address */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{charger.address}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Power</p>
                <p className="font-semibold">{charger.power_output_kw} kW</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="font-semibold">₹{charger.price_per_hour}/hr</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-semibold">
                  {charger.rating_avg || 0} ({charger.total_reviews || 0})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Owner</p>
                <p className="font-semibold">{charger.profiles?.name || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Connector Type */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Connector Type</p>
            <Badge variant="outline" className="text-primary border-primary">
              {charger.connector_type}
            </Badge>
          </div>

          {/* Description */}
          {charger.description && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground mb-2">About</p>
              <p className="text-sm">{charger.description}</p>
            </div>
          )}

          {/* Availability */}
          {charger.availability_start && charger.availability_end && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Available Hours</p>
                <p className="font-medium">
                  {charger.availability_start} - {charger.availability_end}
                </p>
              </div>
            </div>
          )}

          {/* Book Button */}
          <Link to={`/book/${charger.id}`} onClick={onClose}>
            <Button className="w-full rounded-full py-6 text-lg bg-primary hover:bg-primary/90 shadow-glow-green">
              Book This Charger
            </Button>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChargerDetailSheet;
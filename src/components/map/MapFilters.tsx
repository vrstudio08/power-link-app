import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface FilterState {
  connectorType: string;
  maxPrice: number;
  minRating: number;
  distance: number;
}

interface MapFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const connectorTypes = ["All", "Type 2", "CCS", "CHAdeMO", "GB/T"];

const MapFilters = ({ filters, onFiltersChange, onClearFilters }: MapFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = 
    filters.connectorType !== "All" || 
    filters.maxPrice < 500 || 
    filters.minRating > 0 || 
    filters.distance < 50;

  const handleConnectorChange = (value: string) => {
    onFiltersChange({ ...filters, connectorType: value });
  };

  const handlePriceChange = (value: number[]) => {
    onFiltersChange({ ...filters, maxPrice: value[0] });
  };

  const handleRatingChange = (value: number[]) => {
    onFiltersChange({ ...filters, minRating: value[0] });
  };

  const handleDistanceChange = (value: number[]) => {
    onFiltersChange({ ...filters, distance: value[0] });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative border-border bg-card/95 backdrop-blur-sm"
        >
          <Filter className="h-5 w-5" />
          {hasActiveFilters && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary">
              !
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-card/95 backdrop-blur-sm border-border">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Connector Type */}
          <div>
            <Label className="mb-3 block">Connector Type</Label>
            <Select value={filters.connectorType} onValueChange={handleConnectorChange}>
              <SelectTrigger className="bg-muted/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {connectorTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Max Price */}
          <div>
            <Label className="mb-3 block">
              Max Price: ₹{filters.maxPrice}/hr
            </Label>
            <Slider
              value={[filters.maxPrice]}
              onValueChange={handlePriceChange}
              max={500}
              min={50}
              step={10}
              className="w-full"
            />
          </div>

          {/* Min Rating */}
          <div>
            <Label className="mb-3 block">
              Min Rating: {filters.minRating === 0 ? "Any" : `${filters.minRating}★`}
            </Label>
            <Slider
              value={[filters.minRating]}
              onValueChange={handleRatingChange}
              max={5}
              min={0}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Distance */}
          <div>
            <Label className="mb-3 block">
              Distance: {filters.distance === 50 ? "50+ km" : `${filters.distance} km`}
            </Label>
            <Slider
              value={[filters.distance]}
              onValueChange={handleDistanceChange}
              max={50}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-border">
              <Label className="mb-2 block text-sm text-muted-foreground">
                Active Filters:
              </Label>
              <div className="flex flex-wrap gap-2">
                {filters.connectorType !== "All" && (
                  <Badge variant="secondary">{filters.connectorType}</Badge>
                )}
                {filters.maxPrice < 500 && (
                  <Badge variant="secondary">Max ₹{filters.maxPrice}</Badge>
                )}
                {filters.minRating > 0 && (
                  <Badge variant="secondary">Min {filters.minRating}★</Badge>
                )}
                {filters.distance < 50 && (
                  <Badge variant="secondary">Within {filters.distance}km</Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MapFilters;
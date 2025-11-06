import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useGoogleMaps } from "./GoogleMapsProvider";

interface SearchAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
}

const SearchAutocomplete = ({ onPlaceSelect, placeholder = "Search location..." }: SearchAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocomplete) {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode", "establishment"],
        fields: ["geometry", "name", "formatted_address"],
      });

      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry) {
          onPlaceSelect(place);
        }
      });

      setAutocomplete(autocompleteInstance);
    }
  }, [isLoaded, autocomplete, onPlaceSelect]);

  return (
    <div className="relative flex-1">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className="pl-10 bg-card/95 backdrop-blur-sm border-border focus:ring-primary"
      />
    </div>
  );
};

export default SearchAutocomplete;
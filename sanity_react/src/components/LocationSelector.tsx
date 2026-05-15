import { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import type { IState, ICity } from "country-state-city";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface LocationSelectorProps {
  countryValue?: string;
  stateValue?: string;
  cityValue?: string;
  onCountryChange: (countryName: string) => void;
  onStateChange: (stateName: string) => void;
  onCityChange: (cityName: string) => void;
  countryError?: string;
  stateError?: string;
  cityError?: string;
  countryLabel?: string;
  stateLabel?: string;
  cityLabel?: string;
  countryRequired?: boolean;
  stateRequired?: boolean;
  cityRequired?: boolean;
}

const ALL_COUNTRIES = Country.getAllCountries();

function getIsoFromCountryName(name: string) {
  return ALL_COUNTRIES.find((c) => c.name === name)?.isoCode ?? "";
}

export function LocationSelector({
  countryValue = "",
  cityValue = "",
  onCountryChange,
  onStateChange,
  onCityChange,
  countryError,
  stateError,
  cityError,
  countryLabel = "Country",
  stateLabel = "State",
  cityLabel = "City",
  countryRequired = true,
  stateRequired = true,
  cityRequired = true,
}: LocationSelectorProps) {
  const [countryIso, setCountryIso] = useState(() =>
    getIsoFromCountryName(countryValue)
  );
  const [stateIso, setStateIso] = useState("");
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Sync countryIso when countryValue changes externally
  useEffect(() => {
    const iso = getIsoFromCountryName(countryValue);
    if (iso !== countryIso) {
      setCountryIso(iso);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryValue]);

  // Load states when country changes
  useEffect(() => {
    if (!countryIso) {
      setStates([]);
      setCities([]);
      setStateIso("");
      return;
    }
    setLoadingStates(true);
    const id = setTimeout(() => {
      setStates(State.getStatesOfCountry(countryIso));
      setLoadingStates(false);
    }, 300);
    return () => clearTimeout(id);
  }, [countryIso]);

  // Load cities when state changes
  useEffect(() => {
    if (!stateIso || !countryIso) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    const id = setTimeout(() => {
      setCities(City.getCitiesOfState(countryIso, stateIso));
      setLoadingCities(false);
    }, 300);
    return () => clearTimeout(id);
  }, [stateIso, countryIso]);

  const handleCountryChange = (iso: string) => {
    const country = ALL_COUNTRIES.find((c) => c.isoCode === iso);
    if (!country) return;
    setCountryIso(iso);
    setStateIso("");
    onCountryChange(country.name);
    onStateChange("");
    onCityChange("");
  };

  const handleStateChange = (iso: string) => {
    const state = states.find((s) => s.isoCode === iso);
    if (!state) return;
    setStateIso(iso);
    onStateChange(state.name);
    onCityChange("");
  };

  const handleCityChange = (name: string) => {
    onCityChange(name);
  };

  return (
    <>
      {/* Country */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {countryLabel}
          {countryRequired ? " *" : ""}
        </label>
        <Select value={countryIso} onValueChange={handleCountryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            {ALL_COUNTRIES.map((c) => (
              <SelectItem key={c.isoCode} value={c.isoCode}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {countryError && (
          <p className="text-destructive text-xs">{countryError}</p>
        )}
      </div>

      {/* State */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {stateLabel}
          {stateRequired ? " *" : ""}
        </label>
        {loadingStates ? (
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" />
            Loading states…
          </div>
        ) : (
          <Select
            value={stateIso}
            onValueChange={handleStateChange}
            disabled={!countryIso || states.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !countryIso
                    ? "Select a country first"
                    : states.length === 0
                    ? "No states available"
                    : "Select state"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {stateError && (
          <p className="text-destructive text-xs">{stateError}</p>
        )}
      </div>

      {/* City */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          {cityLabel}
          {cityRequired ? " *" : ""}
        </label>
        {loadingCities ? (
          <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" />
            Loading cities…
          </div>
        ) : (
          <Select
            value={cityValue}
            onValueChange={handleCityChange}
            disabled={!stateIso || cities.length === 0}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !stateIso
                    ? "Select a state first"
                    : cities.length === 0
                    ? "No cities available"
                    : "Select city"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {cityError && (
          <p className="text-destructive text-xs">{cityError}</p>
        )}
      </div>
    </>
  );
}

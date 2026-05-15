import { useState, useEffect, useMemo } from "react";
import { Country } from "country-state-city";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

interface PhoneInputProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
}

// Build a deduplicated list of countries with dial codes once
const PHONE_COUNTRIES = Country.getAllCountries()
  .filter((c) => c.phonecode)
  .map((c) => ({
    isoCode: c.isoCode,
    name: c.name,
    dialCode: c.phonecode.startsWith("+") ? c.phonecode : `+${c.phonecode}`,
    flag: c.flag ?? "",
  }));

function parseValue(value: string) {
  // Try to match "+<dialCode> <number>" from an existing stored value
  const match = value.match(/^(\+\d+)\s?(.*)$/);
  if (match) {
    const found = PHONE_COUNTRIES.find((c) => c.dialCode === match[1]);
    if (found) return { isoCode: found.isoCode, number: match[2] };
  }
  return { isoCode: "IN", number: value.replace(/^\+\d+\s?/, "") };
}

export function PhoneInput({
  value = "",
  onChange,
  label = "Phone Number",
  error,
  required = true,
}: PhoneInputProps) {
  const [loading, setLoading] = useState(true);
  const [selectedIso, setSelectedIso] = useState("IN");
  const [number, setNumber] = useState("");

  // Simulate async load (country list is in-memory, but show spinner on mount)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  // Pre-fill from existing value
  useEffect(() => {
    if (value) {
      const parsed = parseValue(value);
      setSelectedIso(parsed.isoCode);
      setNumber(parsed.number);
    }
  }, []); // only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps

  const selectedCountry = useMemo(
    () => PHONE_COUNTRIES.find((c) => c.isoCode === selectedIso),
    [selectedIso]
  );

  const emit = (iso: string, num: string) => {
    const country = PHONE_COUNTRIES.find((c) => c.isoCode === iso);
    const dialCode = country?.dialCode ?? "";
    onChange(`${dialCode} ${num}`.trim());
  };

  const handleCountryChange = (iso: string) => {
    setSelectedIso(iso);
    emit(iso, number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = e.target.value.replace(/[^0-9]/g, "");
    setNumber(num);
    emit(selectedIso, num);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </label>

      {loading ? (
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin mr-2 shrink-0" />
          Loading dial codes…
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Country code selector */}
          <Select value={selectedIso} onValueChange={handleCountryChange}>
            <SelectTrigger className="w-max shrink-0">
              <SelectValue>
                {selectedCountry
                  ? `${selectedCountry.flag} ${selectedCountry.dialCode}`
                  : "Code"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {PHONE_COUNTRIES.map((c) => (
                <SelectItem key={c.isoCode} value={c.isoCode}>
                  <span className="mr-2">{c.flag}</span>
                  <span className="text-muted-foreground mr-1">{c.dialCode}</span>
                  <span className="truncate">{c.name}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Number input */}
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="9876543210"
            value={number}
            onChange={handleNumberChange}
            className="flex-1"
          />
        </div>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

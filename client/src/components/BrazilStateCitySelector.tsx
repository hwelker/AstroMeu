import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StateCitySelectorProps {
  onStateChange: (state: string) => void;
  onCityChange: (city: string) => void;
  selectedState?: string;
  selectedCity?: string;
  label?: string;
}

const brazilStates = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

const stateCodeMap: Record<string, number> = {
  "AC": 12, "AL": 27, "AP": 16, "AM": 13, "BA": 29, "CE": 23, "DF": 53,
  "ES": 32, "GO": 52, "MA": 21, "MT": 51, "MS": 50, "MG": 31, "PA": 15,
  "PB": 25, "PR": 41, "PE": 26, "PI": 22, "RJ": 33, "RN": 24, "RS": 43,
  "RO": 11, "RR": 14, "SC": 42, "SP": 35, "SE": 28, "TO": 17,
};

export function BrazilStateCitySelector({
  onStateChange,
  onCityChange,
  selectedState,
  selectedCity,
  label = "Local de nascimento"
}: StateCitySelectorProps) {
  const [state, setState] = useState(selectedState || "");
  const [city, setCity] = useState(selectedCity || "");
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }

    const code = stateCodeMap[state];
    if (!code) return;

    setLoadingCities(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${code}/municipios?orderBy=nome`)
      .then((res) => res.json())
      .then((data: Array<{ nome: string }>) => {
        setCities(data.map((m) => m.nome));
      })
      .catch(() => {
        setCities([]);
      })
      .finally(() => {
        setLoadingCities(false);
      });
  }, [state]);

  const handleStateChange = (newState: string) => {
    setState(newState);
    setCity("");
    onStateChange(newState);
    onCityChange("");
  };

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
    onCityChange(newCity);
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>{label} - Estado</Label>
        <Select value={state} onValueChange={handleStateChange}>
          <SelectTrigger data-testid="select-state">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {brazilStates.map((s) => (
              <SelectItem key={s.uf} value={s.uf} data-testid={`select-state-${s.uf}`}>
                {s.name} ({s.uf})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state && (
        <div>
          <Label>Cidade</Label>
          <Select value={city} onValueChange={handleCityChange} disabled={!state || loadingCities}>
            <SelectTrigger data-testid="select-city">
              <SelectValue placeholder={loadingCities ? "Carregando cidades..." : "Selecione a cidade"} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c} data-testid={`select-city-${c}`}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

import { SP_CITIES, type SeedCity } from "@/lib/data/sp-cities";

type StateCityOption = {
  nome: string;
  estado: string;
};

const STATE_CITY_BASES: Record<string, SeedCity[]> = {
  SP: SP_CITIES
};
const STATE_CITY_ALIASES: Record<string, Record<string, string>> = {
  SP: {
    florinea: "florinia",
    "sao luis do paraitinga": "sao luiz do paraitinga"
  }
};

const canonicalCityNameRegistry = new Map<string, Map<string, string>>();

function normalizeStateCode(value?: string) {
  return value?.trim().toUpperCase() ?? "";
}

function getSupportedStateCityBase(state?: string) {
  return STATE_CITY_BASES[normalizeStateCode(state)];
}

function getSupportedStateCityAliases(state?: string) {
  return STATE_CITY_ALIASES[normalizeStateCode(state)] ?? {};
}

function getCanonicalCityNameRegistry(state?: string) {
  const normalizedState = normalizeStateCode(state);
  const cached = canonicalCityNameRegistry.get(normalizedState);

  if (cached) {
    return cached;
  }

  const stateCities = getSupportedStateCityBase(normalizedState) ?? [];
  const registry = new Map<string, string>();

  for (const city of stateCities) {
    registry.set(normalizeCityLookupValue(city.nome), city.nome);
  }

  for (const [alias, canonicalKey] of Object.entries(
    getSupportedStateCityAliases(normalizedState)
  )) {
    const canonicalName = registry.get(canonicalKey);

    if (canonicalName) {
      registry.set(alias, canonicalName);
    }
  }

  canonicalCityNameRegistry.set(normalizedState, registry);

  return registry;
}

export function normalizeCityLookupValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function getExpectedStateCities(state = "SP") {
  return getSupportedStateCityBase(state) ?? [];
}

export function getCanonicalStateCityName(nome: string, estado: string) {
  const stateCities = getSupportedStateCityBase(estado);

  if (!stateCities) {
    return nome.trim() || undefined;
  }

  return getCanonicalCityNameRegistry(estado).get(normalizeCityLookupValue(nome));
}

export function formatStateCityName(nome: string, estado: string) {
  return getCanonicalStateCityName(nome, estado) ?? nome.trim();
}

export function getStateCitySearchVariants(nome: string, estado: string) {
  const trimmed = nome.trim();
  const canonical = getCanonicalStateCityName(trimmed, estado);
  const asciiCanonical = canonical
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return Array.from(
    new Set([trimmed, canonical, asciiCanonical].filter(Boolean) as string[])
  );
}

export function isSupportedStateCityName(nome: string, estado: string) {
  return Boolean(getCanonicalStateCityName(nome, estado));
}

export function sanitizeStateCityOptions<T extends StateCityOption>(cityOptions: T[]) {
  const seen = new Set<string>();

  return cityOptions
    .flatMap((city) => {
      const canonicalName = getCanonicalStateCityName(city.nome, city.estado);

      if (!canonicalName) {
        return [];
      }

      const state = normalizeStateCode(city.estado);
      const dedupeKey = `${state}:${canonicalName}`;

      if (seen.has(dedupeKey)) {
        return [];
      }

      seen.add(dedupeKey);

      return [
        {
          ...city,
          nome: canonicalName,
          estado: state
        }
      ];
    })
    .sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));
}

export function findCityOptionByName<T extends StateCityOption>(
  cityOptions: T[],
  value: string
) {
  const normalizedValue = normalizeCityLookupValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  return cityOptions.find(
    (city) => normalizeCityLookupValue(city.nome) === normalizedValue
  );
}

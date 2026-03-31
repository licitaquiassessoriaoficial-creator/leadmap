const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";

export type GeocodingResult = {
  latitude: number;
  longitude: number;
  provider: string;
};

export async function geocodeCityState(
  cidade: string,
  estado: string
): Promise<GeocodingResult | null> {
  const params = new URLSearchParams({
    city: cidade,
    state: estado,
    country: "Brasil",
    format: "jsonv2",
    limit: "1"
  });

  try {
    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params.toString()}`, {
      headers: {
        "Accept-Language": "pt-BR",
        "User-Agent": "LeadMap CRM/1.0"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;

    if (!payload.length) {
      return null;
    }

    return {
      latitude: Number(payload[0].lat),
      longitude: Number(payload[0].lon),
      provider: "nominatim"
    };
  } catch {
    return null;
  }
}

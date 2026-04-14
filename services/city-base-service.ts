import { prisma } from "@/lib/prisma";
import {
  getExpectedStateCities,
  normalizeCityLookupValue
} from "@/lib/domain/cities";

const syncRegistry = new Map<string, Promise<void>>();
type ExpectedCityRecord = (ReturnType<typeof getExpectedStateCities>)[number];
type ExistingCitySnapshot = {
  id: string;
  nome: string;
  estado: string;
  totalEleitores: number;
  codigoIbge: string | null;
  latitude: number | null;
  longitude: number | null;
};

function buildExactCityKey(nome: string, estado: string) {
  return `${nome}:${estado}`;
}

function buildNormalizedCityKey(nome: string, estado: string) {
  return `${normalizeCityLookupValue(nome)}:${estado}`;
}

function buildCityLookup(existingCities: ExistingCitySnapshot[]) {
  const exactExistingByKey = new Map(
    existingCities.map((city) => [buildExactCityKey(city.nome, city.estado), city])
  );
  const normalizedExistingByKey = new Map<string, ExistingCitySnapshot[]>();

  for (const city of existingCities) {
    const key = buildNormalizedCityKey(city.nome, city.estado);
    const current = normalizedExistingByKey.get(key) ?? [];
    current.push(city);
    normalizedExistingByKey.set(key, current);
  }

  return {
    exactExistingByKey,
    normalizedExistingByKey
  };
}

function findMatchingExistingCity(
  city: ExpectedCityRecord,
  lookup: ReturnType<typeof buildCityLookup>,
  matchedExistingCityIds: Set<string>
) {
  const exactMatch = lookup.exactExistingByKey.get(buildExactCityKey(city.nome, city.estado));

  if (exactMatch && !matchedExistingCityIds.has(exactMatch.id)) {
    return exactMatch;
  }

  const normalizedMatches =
    lookup.normalizedExistingByKey.get(buildNormalizedCityKey(city.nome, city.estado)) ?? [];

  return normalizedMatches.find((item) => !matchedExistingCityIds.has(item.id));
}

function hasCitySnapshotDrift(city: ExpectedCityRecord, existing: ExistingCitySnapshot) {
  return !(
    existing.nome === city.nome &&
    existing.totalEleitores === city.totalEleitores &&
    existing.codigoIbge === city.codigoIbge &&
    existing.latitude === city.latitude &&
    existing.longitude === city.longitude
  );
}

export function stateCityBaseNeedsSync(
  expectedCities: ExpectedCityRecord[],
  existingCities: ExistingCitySnapshot[]
) {
  if (expectedCities.length !== existingCities.length) {
    return true;
  }

  const expectedCityNames = new Set(expectedCities.map((city) => city.nome));

  if (existingCities.some((city) => !expectedCityNames.has(city.nome))) {
    return true;
  }

  const lookup = buildCityLookup(existingCities);
  const matchedExistingCityIds = new Set<string>();

  for (const city of expectedCities) {
    const existing = findMatchingExistingCity(city, lookup, matchedExistingCityIds);

    if (!existing) {
      return true;
    }

    matchedExistingCityIds.add(existing.id);

    if (hasCitySnapshotDrift(city, existing)) {
      return true;
    }
  }

  return matchedExistingCityIds.size !== existingCities.length;
}

export function getExpectedCityBaseCount(state = "SP") {
  return getExpectedStateCities(state).length;
}

async function syncStateCityBase(state = "SP") {
  const cities = getExpectedStateCities(state);

  if (!cities.length) {
    return;
  }

  const existingCities = await prisma.city.findMany({
    where: { estado: state },
    select: {
      id: true,
      nome: true,
      estado: true,
      totalEleitores: true,
      codigoIbge: true,
      latitude: true,
      longitude: true
    }
  });
  const lookup = buildCityLookup(existingCities);

  const matchedExistingCityIds = new Set<string>();

  const missingCities = cities.filter((city) => {
    const existing = findMatchingExistingCity(city, lookup, matchedExistingCityIds);

    if (existing) {
      matchedExistingCityIds.add(existing.id);
      return false;
    }

    return true;
  });

  if (missingCities.length) {
    await prisma.city.createMany({
      data: missingCities,
      skipDuplicates: true
    });
  }

  const updates = cities
    .map((city) => {
      const existing = findMatchingExistingCity(city, lookup, new Set());

      if (!existing) {
        return null;
      }

      if (!hasCitySnapshotDrift(city, existing)) {
        return null;
      }

      return prisma.city.update({
        where: { id: existing.id },
        data: {
          nome: city.nome,
          totalEleitores: city.totalEleitores,
          codigoIbge: city.codigoIbge,
          latitude: city.latitude,
          longitude: city.longitude
        }
      });
    })
    .filter(
      (operation): operation is ReturnType<typeof prisma.city.update> =>
        operation !== null
    );

  if (updates.length) {
    await prisma.$transaction(updates);
  }

  const extraCityIds = existingCities
    .filter((city) => !matchedExistingCityIds.has(city.id))
    .map((city) => city.id);

  if (!extraCityIds.length) {
    return;
  }

  const [baseReferences, coverageReferences] = await Promise.all([
    prisma.leadership.findMany({
      where: {
        cidadeId: {
          in: extraCityIds
        }
      },
      select: {
        cidadeId: true
      },
      distinct: ["cidadeId"]
    }),
    prisma.leadershipCity.findMany({
      where: {
        cityId: {
          in: extraCityIds
        }
      },
      select: {
        cityId: true
      },
      distinct: ["cityId"]
    })
  ]);
  const referencedCityIds = new Set([
    ...baseReferences.map((item) => item.cidadeId),
    ...coverageReferences.map((item) => item.cityId)
  ]);
  const removableCityIds = extraCityIds.filter((id) => !referencedCityIds.has(id));

  if (removableCityIds.length) {
    await prisma.city.deleteMany({
      where: {
        id: {
          in: removableCityIds
        }
      }
    });
  }
}

export async function ensureStateCityBase(state = "SP") {
  const expectedCities = getExpectedStateCities(state);
  const expectedCount = expectedCities.length;

  if (!expectedCount) {
    return;
  }

  const currentCities = await prisma.city.findMany({
    where: { estado: state },
    select: {
      id: true,
      nome: true,
      estado: true,
      totalEleitores: true,
      codigoIbge: true,
      latitude: true,
      longitude: true
    }
  });

  if (!stateCityBaseNeedsSync(expectedCities, currentCities)) {
    return;
  }

  const pendingSync = syncRegistry.get(state);

  if (pendingSync) {
    await pendingSync;
    return;
  }

  const syncPromise = syncStateCityBase(state).finally(() => {
    syncRegistry.delete(state);
  });

  syncRegistry.set(state, syncPromise);
  await syncPromise;
}

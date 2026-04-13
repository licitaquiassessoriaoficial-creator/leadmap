import { prisma } from "@/lib/prisma";
import {
  getExpectedStateCities,
  normalizeCityLookupValue
} from "@/lib/domain/cities";

const syncRegistry = new Map<string, Promise<void>>();

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
      latitude: true,
      longitude: true
    }
  });

  const exactExistingByKey = new Map(
    existingCities.map((city) => [`${city.nome}:${city.estado}`, city])
  );
  const normalizedExistingByKey = new Map<string, typeof existingCities>();

  for (const city of existingCities) {
    const key = `${normalizeCityLookupValue(city.nome)}:${city.estado}`;
    const current = normalizedExistingByKey.get(key) ?? [];
    current.push(city);
    normalizedExistingByKey.set(key, current);
  }

  const matchedExistingCityIds = new Set<string>();

  const missingCities = cities.filter((city) => {
    const exactKey = `${city.nome}:${city.estado}`;
    const exactMatch = exactExistingByKey.get(exactKey);

    if (exactMatch) {
      matchedExistingCityIds.add(exactMatch.id);
      return false;
    }

    const normalizedKey = `${normalizeCityLookupValue(city.nome)}:${city.estado}`;
    const normalizedMatches = normalizedExistingByKey.get(normalizedKey) ?? [];
    const normalizedMatch = normalizedMatches.find(
      (item) => !matchedExistingCityIds.has(item.id)
    );

    if (normalizedMatch) {
      matchedExistingCityIds.add(normalizedMatch.id);
    }

    return !normalizedMatch;
  });

  if (missingCities.length) {
    await prisma.city.createMany({
      data: missingCities,
      skipDuplicates: true
    });
  }

  const updates = cities
    .map((city) => {
      const exactKey = `${city.nome}:${city.estado}`;
      const exactMatch = exactExistingByKey.get(exactKey);
      const normalizedKey = `${normalizeCityLookupValue(city.nome)}:${city.estado}`;
      const normalizedMatch = (normalizedExistingByKey.get(normalizedKey) ?? []).find(
        (item) => matchedExistingCityIds.has(item.id)
      );
      const existing = exactMatch ?? normalizedMatch;

      if (!existing) {
        return null;
      }

      if (
        existing.nome === city.nome &&
        existing.totalEleitores === city.totalEleitores &&
        existing.latitude === city.latitude &&
        existing.longitude === city.longitude
      ) {
        return null;
      }

      return prisma.city.update({
        where: { id: existing.id },
        data: {
          nome: city.nome,
          totalEleitores: city.totalEleitores,
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
  const expectedCount = getExpectedCityBaseCount(state);

  if (!expectedCount) {
    return;
  }

  const currentCount = await prisma.city.count({
    where: { estado: state }
  });

  if (currentCount === expectedCount) {
    const hasUnexpectedCity = await prisma.city.findFirst({
      where: {
        estado: state,
        nome: {
          notIn: getExpectedStateCities(state).map((city) => city.nome)
        }
      },
      select: {
        id: true
      }
    });

    if (!hasUnexpectedCity) {
      return;
    }
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

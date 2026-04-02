import { prisma } from "@/lib/prisma";
import { SP_CITIES } from "@/lib/data/sp-cities";

const syncRegistry = new Map<string, Promise<void>>();

export function getExpectedCityBaseCount(state = "SP") {
  return SP_CITIES.filter((city) => city.estado === state).length;
}

async function syncStateCityBase(state = "SP") {
  const cities = SP_CITIES.filter((city) => city.estado === state);
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

  const existingByKey = new Map(
    existingCities.map((city) => [`${city.nome}:${city.estado}`, city])
  );

  const missingCities = cities.filter(
    (city) => !existingByKey.has(`${city.nome}:${city.estado}`)
  );

  if (missingCities.length) {
    await prisma.city.createMany({
      data: missingCities,
      skipDuplicates: true
    });
  }

  const updates = cities
    .map((city) => {
      const existing = existingByKey.get(`${city.nome}:${city.estado}`);

      if (!existing) {
        return null;
      }

      if (
        existing.totalEleitores === city.totalEleitores &&
        existing.latitude === city.latitude &&
        existing.longitude === city.longitude
      ) {
        return null;
      }

      return prisma.city.update({
        where: { id: existing.id },
        data: {
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
}

export async function ensureStateCityBase(state = "SP") {
  const expectedCount = getExpectedCityBaseCount(state);
  const currentCount = await prisma.city.count({
    where: { estado: state }
  });

  if (currentCount === expectedCount) {
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

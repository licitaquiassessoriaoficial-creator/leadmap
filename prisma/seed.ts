import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";

import { SP_CITIES } from "../lib/data/sp-cities";
import {
  getCanonicalStateCityName
} from "../lib/domain/cities";

const prisma = new PrismaClient();

function resolveSeedCityName(value: string) {
  return getCanonicalStateCityName(value, "SP") ?? value;
}

async function main() {
  const globalAdminPasswordHash = await bcrypt.hash("Global123!", 10);
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const operatorPasswordHash = await bcrypt.hash("Operador123!", 10);

  await prisma.auditLog.deleteMany();
  await prisma.performanceHistory.deleteMany();
  await prisma.referralSignup.deleteMany();
  await prisma.leadershipCity.deleteMany();
  await prisma.leadership.deleteMany();
  await prisma.city.deleteMany();
  await prisma.campaignSettings.deleteMany();
  await prisma.user.deleteMany();

  const globalAdmin = await prisma.user.create({
    data: {
      name: "Isabela Nascimento",
      email: "global@leadmap.local",
      passwordHash: globalAdminPasswordHash,
      role: Role.GLOBAL_ADMIN
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: "Mariana Souza",
      email: "admin@leadmap.local",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      createdById: globalAdmin.id
    }
  });

  const operator = await prisma.user.create({
    data: {
      name: "Carlos Lima",
      email: "operador@leadmap.local",
      passwordHash: operatorPasswordHash,
      role: Role.OPERATOR,
      createdById: admin.id
    }
  });

  void operator;

  await prisma.campaignSettings.create({
    data: {
      id: "default",
      nomeCampanha: "Radar de Lideranças SP",
      estadoPadrao: "SP",
      restringirAoEstadoPadrao: true
    }
  });

  await prisma.city.createMany({
    data: SP_CITIES,
    skipDuplicates: true
  });

  const strategicCities = [
    { nome: "Sao Paulo", codigoIbge: "3550308", metaVotosCidade: 1800000 },
    { nome: "Guarulhos", codigoIbge: "3518800", metaVotosCidade: 180000 },
    { nome: "Campinas", codigoIbge: "3509502", metaVotosCidade: 180000 },
    { nome: "Santos", codigoIbge: "3548500", metaVotosCidade: 70000 },
    {
      nome: "Sao Jose dos Campos",
      codigoIbge: "3549904",
      metaVotosCidade: 120000
    },
    {
      nome: "Sao Bernardo do Campo",
      codigoIbge: "3548708",
      metaVotosCidade: 115000
    },
    { nome: "Sorocaba", codigoIbge: "3552205", metaVotosCidade: 110000 },
    {
      nome: "Ribeirao Preto",
      codigoIbge: "3543402",
      metaVotosCidade: 95000
    },
    {
      nome: "Sao Jose do Rio Preto",
      codigoIbge: "3549805",
      metaVotosCidade: 85000
    }
  ];

  for (const city of strategicCities) {
    const cityName = resolveSeedCityName(city.nome);

    await prisma.city.updateMany({
      where: {
        nome: cityName,
        estado: "SP"
      },
      data: {
        codigoIbge: city.codigoIbge,
        metaVotosCidade: city.metaVotosCidade
      }
    });
  }

  const cityCount = await prisma.city.count();

  console.log("Seed concluído:");
  console.log("- Usuários: 3");
  console.log(`- Cidades de SP: ${cityCount}`);
  console.log("- Lideranças: 0 (base limpa para uso real)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

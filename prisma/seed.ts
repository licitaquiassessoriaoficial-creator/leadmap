import bcrypt from "bcryptjs";
import {
  LeadershipStatus,
  LocationStatus,
  PrismaClient,
  Role
} from "@prisma/client";

import { classifyPotentialLevel } from "../lib/constants/potential";
import { SP_CITIES } from "../lib/data/sp-cities";
import {
  getCanonicalStateCityName,
  normalizeCityLookupValue
} from "../lib/domain/cities";
import {
  buildWhatsAppNumber,
  calculateCostPerVote,
  generateReferralCode,
  resolveLeadershipVoteBase
} from "../lib/domain/leadership";
import { calculateLeadershipScore } from "../lib/domain/score";

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

  const cityRecords = await prisma.city.findMany();
  const cityMap = new Map(
    cityRecords.map((city) => [normalizeCityLookupValue(city.nome), city])
  );

  const campinas = cityMap.get(normalizeCityLookupValue("Campinas"));

  if (!campinas) {
    throw new Error("Cidade Campinas não encontrada na seed.");
  }

  const osvaldoBiografia = `Osvaldo Quadro nasceu em Campinas, São Paulo, em 10 de março de 1974. Filho caçula, cresceu em família simples, com os pais e duas irmãs mais velhas. Formou-se técnico em Processamento de Dados, graduou-se em Direito e se especializou com pós-graduação em Direito Civil.

Empreendedor por natureza, atuou por cerca de 20 anos no ramo de comunicação visual. Em 2005, sua mãe foi assassinada durante um assalto — tragédia que o levou a uma depressão profunda, chegando a pesar quase 290 quilos. Foi nesse fundo do poço que encontrou força na fé e decidiu recomeçar do zero.

Em apenas 30 dias, ao lado de um amigo que acreditou em seu potencial, fundou uma empresa voltada para licitações públicas. Com trabalho, disciplina e visão de gestão, a empresa cresceu rapidamente, tornou-se referência no setor e passou a atender clientes como a Petrobras. Ao longo da carreira, já empregou mais de mil pessoas e mantém cerca de 270 colaboradores diretos.

Cristão desde 1998, pastor por formação e vocação, seus valores de lealdade, caráter e compromisso com o próximo guiam cada decisão. Além dos negócios, sempre apoiou igrejas, ONGs e projetos sociais com patrocínios, doações e suporte a famílias vulneráveis.

Candidato por propósito, não por carreira, Osvaldo quer levar para Brasília a mentalidade do empreendedor: eficiência, responsabilidade com o dinheiro público e foco em resultado. Suas bandeiras são fomento ao empreendedorismo, educação de qualidade, políticas sociais que gerem autonomia, modernização das relações de trabalho e redução da burocracia.`;

  const osvaldoReferralCode = generateReferralCode("Osvaldo Quadro", "osvaldo-quadro");
  const osvaldoPotencial = 50000;
  const osvaldoCusto = 0;
  const osvaldoCustoPorVoto = calculateCostPerVote(osvaldoCusto, null, osvaldoPotencial);
  const osvaldoVoteBase = resolveLeadershipVoteBase(null, osvaldoPotencial);
  const osvaldoScore = calculateLeadershipScore({
    voteBase: osvaldoVoteBase,
    quantidadeIndicacoes: 0,
    custoPorVoto: osvaldoCustoPorVoto,
    totalCidadesResponsaveis: 1,
    status: LeadershipStatus.ACTIVE
  });

  const osvaldo = await prisma.leadership.create({
    data: {
      nome: "Osvaldo Quadro",
      telefone: "5519900000000",
      whatsapp: buildWhatsAppNumber("5519900000000"),
      fotoCapaUrl: "/osvaldo-quadro-capa.jpg",
      biografia: osvaldoBiografia,
      observacoes: "Nome que irá concorrer como deputado, com base principal em Campinas.",
      cidade: campinas.nome,
      estado: campinas.estado,
      cidadeId: campinas.id,
      latitude: campinas.latitude,
      longitude: campinas.longitude,
      locationStatus:
        campinas.latitude != null && campinas.longitude != null
          ? LocationStatus.FOUND
          : LocationStatus.PENDING,
      potencialVotosEstimado: osvaldoPotencial,
      custoTotal: osvaldoCusto,
      custoPorVoto: osvaldoCustoPorVoto,
      faixaPotencial: classifyPotentialLevel(osvaldoPotencial),
      scoreLideranca: osvaldoScore,
      status: LeadershipStatus.ACTIVE,
      quantidadeIndicacoes: 0,
      referralCode: osvaldoReferralCode,
      cadastradoPorId: globalAdmin.id
    }
  });

  await prisma.leadershipCity.create({
    data: {
      leadershipId: osvaldo.id,
      cityId: campinas.id
    }
  });

  console.log("Seed concluído:");
  console.log("- Usuários: 3");
  console.log(`- Cidades de SP: ${cityCount}`);
  console.log("- Lideranças: 1 (Osvaldo Quadro)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

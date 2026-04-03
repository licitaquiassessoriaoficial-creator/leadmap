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
  buildWhatsAppNumber,
  calculateCostPerVote,
  generateReferralCode,
  resolveLeadershipVoteBase
} from "../lib/domain/leadership";
import { calculateLeadershipScore } from "../lib/domain/score";

const prisma = new PrismaClient();
const allCityNames = SP_CITIES.map((city) => city.nome);
const cityNameSet = new Set(allCityNames);

type SeedLeadership = {
  key: string;
  nome: string;
  telefone: string;
  email?: string;
  fotoPerfilUrl?: string;
  cidade: string;
  bairro?: string;
  endereco?: string;
  potencialVotosEstimado: number;
  votosReais?: number;
  custoTotal: number;
  metaVotosIndividual?: number;
  observacoes?: string;
  status: LeadershipStatus;
  userKey: "globalAdmin" | "admin" | "operator";
  indicadoPorKey?: string;
  cidadesResponsaveis: string[];
};

type SeedReferralSignup = {
  leadershipKey: string;
  nome: string;
  telefone: string;
  email?: string;
  cidade: string;
  observacoes?: string;
};

function buildCoverage(baseCity: string, preferredCities: string[], target = 5) {
  const unique = Array.from(
    new Set([
      baseCity,
      ...preferredCities.filter((city) => cityNameSet.has(city)),
      ...allCityNames
    ])
  );

  return unique.slice(0, target);
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

  const userMap = {
    globalAdmin,
    admin,
    operator
  } as const;

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
    await prisma.city.updateMany({
      where: {
        nome: city.nome,
        estado: "SP"
      },
      data: {
        codigoIbge: city.codigoIbge,
        metaVotosCidade: city.metaVotosCidade
      }
    });
  }

  const cityRecords = await prisma.city.findMany();
  const cityMap = new Map(cityRecords.map((city) => [city.nome, city]));

  const leadershipSeeds: SeedLeadership[] = [
    {
      key: "ana",
      nome: "Ana Paula Martins",
      telefone: "5511988881001",
      email: "ana.paula@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-1.svg",
      cidade: "Sao Paulo",
      bairro: "Mooca",
      endereco: "Rua das Flores, 100",
      potencialVotosEstimado: 820,
      votosReais: 610,
      custoTotal: 4920,
      metaVotosIndividual: 700,
      observacoes: "Coordena frentes comunitárias e lidera a expansão da capital.",
      status: LeadershipStatus.ACTIVE,
      userKey: "globalAdmin",
      cidadesResponsaveis: buildCoverage(
        "Sao Paulo",
        [
          "Guarulhos",
          "Osasco",
          "Carapicuiba",
          "Barueri",
          "Itapevi",
          "Cotia",
          "Taboao da Serra",
          "Embu das Artes",
          "Diadema",
          "Santo Andre",
          "Sao Bernardo do Campo",
          "Sao Caetano do Sul",
          "Maua",
          "Mogi das Cruzes",
          "Suzano",
          "Ferraz de Vasconcelos",
          "Itaquaquecetuba",
          "Aruja",
          "Caieiras",
          "Franco da Rocha",
          "Cajamar",
          "Jundiai",
          "Atibaia",
          "Braganca Paulista"
        ],
        25
      )
    },
    {
      key: "joao",
      nome: "Joao Henrique Costa",
      telefone: "5519988882002",
      email: "joao.henrique@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-2.svg",
      cidade: "Campinas",
      bairro: "Taquaral",
      endereco: "Avenida Norte, 255",
      potencialVotosEstimado: 480,
      votosReais: 350,
      custoTotal: 1920,
      metaVotosIndividual: 420,
      observacoes: "Comanda a malha de Campinas e entorno com foco em produtividade.",
      status: LeadershipStatus.ACTIVE,
      userKey: "admin",
      indicadoPorKey: "ana",
      cidadesResponsaveis: buildCoverage(
        "Campinas",
        [
          "Hortolandia",
          "Sumare",
          "Valinhos",
          "Vinhedo",
          "Paulinia",
          "Americana",
          "Nova Odessa",
          "Limeira",
          "Piracicaba",
          "Indaiatuba",
          "Itu",
          "Sorocaba",
          "Jundiai",
          "Atibaia",
          "Braganca Paulista",
          "Rio Claro",
          "Araras",
          "Mogi Guacu",
          "Mogi Mirim",
          "Sao Joao da Boa Vista",
          "Jaguariuna",
          "Louveira",
          "Monte Mor",
          "Cosmopolis"
        ],
        25
      )
    },
    {
      key: "helena",
      nome: "Helena Castro",
      telefone: "5511988881111",
      email: "helena.castro@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-3.svg",
      cidade: "Sao Bernardo do Campo",
      bairro: "Centro",
      endereco: "Avenida Kennedy, 500",
      potencialVotosEstimado: 430,
      votosReais: 300,
      custoTotal: 2050,
      metaVotosIndividual: 360,
      observacoes: "Atua no ABC com forte controle de execução e custo.",
      status: LeadershipStatus.ACTIVE,
      userKey: "globalAdmin",
      indicadoPorKey: "ana",
      cidadesResponsaveis: buildCoverage(
        "Sao Bernardo do Campo",
        ["Santo Andre", "Sao Caetano do Sul"],
        3
      )
    },
    {
      key: "fernanda",
      nome: "Fernanda Ribeiro",
      telefone: "5513977773003",
      email: "fernanda.ribeiro@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-3.svg",
      cidade: "Santos",
      bairro: "Gonzaga",
      endereco: "Avenida da Praia, 88",
      potencialVotosEstimado: 640,
      votosReais: 510,
      custoTotal: 3200,
      metaVotosIndividual: 540,
      observacoes: "Rede ativa no litoral, com forte presença comunitária.",
      status: LeadershipStatus.ACTIVE,
      userKey: "admin",
      indicadoPorKey: "ana",
      cidadesResponsaveis: buildCoverage(
        "Santos",
        ["Sao Vicente", "Guaruja", "Praia Grande", "Cubatao", "Bertioga"],
        6
      )
    },
    {
      key: "patricia",
      nome: "Patricia Souza",
      telefone: "5512999994004",
      email: "patricia.souza@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-4.svg",
      cidade: "Sao Jose dos Campos",
      bairro: "Jardim Aquarius",
      endereco: "Rua do Vale, 410",
      potencialVotosEstimado: 530,
      votosReais: 390,
      custoTotal: 2650,
      metaVotosIndividual: 450,
      observacoes: "Base consolidada no eixo Vale do Paraíba.",
      status: LeadershipStatus.ACTIVE,
      userKey: "operator",
      indicadoPorKey: "ana",
      cidadesResponsaveis: buildCoverage(
        "Sao Jose dos Campos",
        ["Jacarei", "Pindamonhangaba", "Taubate", "Caraguatatuba", "Ubatuba"],
        6
      )
    },
    {
      key: "elaine",
      nome: "Elaine Barros",
      telefone: "5511977775005",
      email: "elaine.barros@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-5.svg",
      cidade: "Osasco",
      bairro: "Centro",
      endereco: "Rua Autonomistas, 100",
      potencialVotosEstimado: 95,
      votosReais: 0,
      custoTotal: 380,
      metaVotosIndividual: 120,
      observacoes: "Cadastro em consolidação com time de rua e território em montagem.",
      status: LeadershipStatus.PENDING,
      userKey: "admin",
      indicadoPorKey: "ana",
      cidadesResponsaveis: buildCoverage(
        "Osasco",
        ["Barueri", "Carapicuiba", "Itapevi", "Cotia"],
        5
      )
    },
    {
      key: "diego",
      nome: "Diego Martins",
      telefone: "5511966666006",
      email: "diego.martins@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-2.svg",
      cidade: "Guarulhos",
      bairro: "Macedo",
      endereco: "Avenida Tiradentes, 610",
      potencialVotosEstimado: 150,
      votosReais: 90,
      custoTotal: 700,
      metaVotosIndividual: 140,
      observacoes: "Operação enxuta com boa relação custo-benefício.",
      status: LeadershipStatus.ACTIVE,
      userKey: "operator",
      indicadoPorKey: "ana",
      cidadesResponsaveis: buildCoverage(
        "Guarulhos",
        ["Aruja", "Itaquaquecetuba", "Ferraz de Vasconcelos"],
        4
      )
    },
    {
      key: "bruno",
      nome: "Bruno Lima",
      telefone: "5516999997007",
      email: "bruno.lima@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-1.svg",
      cidade: "Ribeirao Preto",
      bairro: "Jardim America",
      endereco: "Rua Araguaia, 29",
      potencialVotosEstimado: 360,
      votosReais: 245,
      custoTotal: 1980,
      metaVotosIndividual: 300,
      observacoes: "Boa musculatura no interior com distribuição em cidades médias.",
      status: LeadershipStatus.ACTIVE,
      userKey: "admin",
      indicadoPorKey: "joao",
      cidadesResponsaveis: buildCoverage(
        "Ribeirao Preto",
        ["Franca", "Araraquara", "Sertaozinho", "Barretos", "Jaboticabal"],
        6
      )
    },
    {
      key: "carla",
      nome: "Carla Nogueira",
      telefone: "5515977778008",
      email: "carla.nogueira@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-3.svg",
      cidade: "Sorocaba",
      bairro: "Centro",
      endereco: "Rua XV, 300",
      potencialVotosEstimado: 290,
      votosReais: 210,
      custoTotal: 1100,
      metaVotosIndividual: 260,
      observacoes: "Equipe disciplinada e capilaridade crescente na região.",
      status: LeadershipStatus.ACTIVE,
      userKey: "operator",
      indicadoPorKey: "joao",
      cidadesResponsaveis: buildCoverage(
        "Sorocaba",
        ["Itu", "Indaiatuba", "Votorantim", "Salto", "Porto Feliz"],
        6
      )
    },
    {
      key: "gabriela",
      nome: "Gabriela Pires",
      telefone: "5514999999009",
      email: "gabriela.pires@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-4.svg",
      cidade: "Bauru",
      bairro: "Altos da Cidade",
      endereco: "Avenida Nacoes, 720",
      potencialVotosEstimado: 510,
      votosReais: 380,
      custoTotal: 2550,
      metaVotosIndividual: 450,
      observacoes: "Coordena expansão regional com bom equilíbrio entre voto e custo.",
      status: LeadershipStatus.ACTIVE,
      userKey: "admin",
      indicadoPorKey: "joao",
      cidadesResponsaveis: buildCoverage(
        "Bauru",
        ["Botucatu", "Marilia", "Lins", "Jau"],
        5
      )
    },
    {
      key: "igor",
      nome: "Igor Almeida",
      telefone: "5511944441010",
      email: "igor.almeida@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-5.svg",
      cidade: "Jundiai",
      bairro: "Anhangabau",
      endereco: "Rua do Retiro, 55",
      potencialVotosEstimado: 105,
      votosReais: 70,
      custoTotal: 480,
      metaVotosIndividual: 90,
      observacoes: "Execução tática com boa taxa de conversão no entorno metropolitano.",
      status: LeadershipStatus.ACTIVE,
      userKey: "operator",
      indicadoPorKey: "joao",
      cidadesResponsaveis: buildCoverage(
        "Jundiai",
        ["Atibaia", "Braganca Paulista", "Louveira"],
        4
      )
    },
    {
      key: "fabio",
      nome: "Fabio Rocha",
      telefone: "5511999991212",
      email: "fabio.rocha@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-2.svg",
      cidade: "Mogi das Cruzes",
      bairro: "Vila Oliveira",
      endereco: "Rua das Palmeiras, 62",
      potencialVotosEstimado: 220,
      votosReais: 150,
      custoTotal: 1200,
      metaVotosIndividual: 190,
      observacoes: "Crescimento consistente no Alto Tietê.",
      status: LeadershipStatus.ACTIVE,
      userKey: "operator",
      indicadoPorKey: "patricia",
      cidadesResponsaveis: buildCoverage(
        "Mogi das Cruzes",
        ["Suzano", "Ferraz de Vasconcelos", "Poa"],
        4
      )
    },
    {
      key: "juliana",
      nome: "Juliana Araujo",
      telefone: "5519977771313",
      email: "juliana.araujo@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-4.svg",
      cidade: "Piracicaba",
      bairro: "Cidade Alta",
      endereco: "Rua do Porto, 48",
      potencialVotosEstimado: 180,
      votosReais: 125,
      custoTotal: 900,
      metaVotosIndividual: 160,
      observacoes: "Boa densidade de base, ainda buscando eficiência maior.",
      status: LeadershipStatus.ACTIVE,
      userKey: "admin",
      indicadoPorKey: "bruno",
      cidadesResponsaveis: buildCoverage(
        "Piracicaba",
        ["Limeira", "Americana", "Rio Claro", "Araras"],
        5
      )
    },
    {
      key: "kelly",
      nome: "Kelly Batista",
      telefone: "5511966661414",
      email: "kelly.batista@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-5.svg",
      cidade: "Cotia",
      bairro: "Granja Viana",
      endereco: "Estrada da Capuava, 81",
      potencialVotosEstimado: 75,
      votosReais: 40,
      custoTotal: 240,
      metaVotosIndividual: 80,
      observacoes: "Território em pausa temporária e precisando de reativação.",
      status: LeadershipStatus.INACTIVE,
      userKey: "operator",
      indicadoPorKey: "elaine",
      cidadesResponsaveis: buildCoverage(
        "Cotia",
        ["Embu das Artes", "Taboao da Serra", "Itapevi"],
        4
      )
    },
    {
      key: "lucas",
      nome: "Lucas Prado",
      telefone: "5518999991515",
      email: "lucas.prado@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-1.svg",
      cidade: "Presidente Prudente",
      bairro: "Centro",
      endereco: "Avenida Washington Luiz, 900",
      potencialVotosEstimado: 560,
      votosReais: 420,
      custoTotal: 2240,
      metaVotosIndividual: 500,
      observacoes: "Operação forte no extremo oeste, com espaço para ampliar captação.",
      status: LeadershipStatus.ACTIVE,
      userKey: "admin",
      indicadoPorKey: "gabriela",
      cidadesResponsaveis: buildCoverage(
        "Presidente Prudente",
        ["Assis", "Ourinhos", "Tupa"],
        4
      )
    },
    {
      key: "marina",
      nome: "Marina Duarte",
      telefone: "5517999991616",
      email: "marina.duarte@leadmap.local",
      fotoPerfilUrl: "/avatars/leader-3.svg",
      cidade: "Sao Jose do Rio Preto",
      bairro: "Boa Vista",
      endereco: "Rua Voluntarios, 73",
      potencialVotosEstimado: 610,
      votosReais: 470,
      custoTotal: 3050,
      metaVotosIndividual: 520,
      observacoes: "Equipe madura com alta capacidade de expansão regional.",
      status: LeadershipStatus.ACTIVE,
      userKey: "operator",
      indicadoPorKey: "gabriela",
      cidadesResponsaveis: buildCoverage(
        "Sao Jose do Rio Preto",
        ["Catanduva", "Votuporanga", "Fernandopolis", "Mirassol"],
        5
      )
    }
  ];

  const referralSignupSeeds: SeedReferralSignup[] = [
    {
      leadershipKey: "ana",
      nome: "Marcela Dias",
      telefone: "5511981110001",
      email: "marcela.dias@leadmap.local",
      cidade: "Guarulhos",
      observacoes: "Contato público vindo do link da capital."
    },
    {
      leadershipKey: "ana",
      nome: "Renato Borges",
      telefone: "5511981110002",
      email: "renato.borges@leadmap.local",
      cidade: "Osasco",
      observacoes: "Interesse em atuar no cinturão metropolitano."
    },
    {
      leadershipKey: "joao",
      nome: "Bruna Melo",
      telefone: "5519981110003",
      email: "bruna.melo@leadmap.local",
      cidade: "Campinas",
      observacoes: "Chegou pelo link do polo Campinas."
    },
    {
      leadershipKey: "helena",
      nome: "Rafael Serra",
      telefone: "5511981110004",
      cidade: "Sao Bernardo do Campo",
      observacoes: "Base comunitária no ABC."
    }
  ];

  const indicationCounts = new Map<string, number>();

  for (const leadership of leadershipSeeds) {
    if (leadership.indicadoPorKey) {
      indicationCounts.set(
        leadership.indicadoPorKey,
        (indicationCounts.get(leadership.indicadoPorKey) ?? 0) + 1
      );
    }
  }

  for (const signup of referralSignupSeeds) {
    indicationCounts.set(
      signup.leadershipKey,
      (indicationCounts.get(signup.leadershipKey) ?? 0) + 1
    );
  }

  const leadershipIds = new Map<string, string>();

  for (const item of leadershipSeeds) {
    const city = cityMap.get(item.cidade);

    if (!city) {
      throw new Error(`Cidade não encontrada na seed: ${item.cidade}`);
    }

    const indicadoPorId = item.indicadoPorKey
      ? leadershipIds.get(item.indicadoPorKey)
      : undefined;
    const cidadesResponsaveis = buildCoverage(
      item.cidade,
      item.cidadesResponsaveis,
      item.cidadesResponsaveis.length
    );
    const quantidadeIndicacoes = indicationCounts.get(item.key) ?? 0;
    const custoPorVoto = calculateCostPerVote(
      item.custoTotal,
      item.votosReais,
      item.potencialVotosEstimado
    );
    const voteBase = resolveLeadershipVoteBase(
      item.votosReais,
      item.potencialVotosEstimado
    );
    const scoreLideranca = calculateLeadershipScore({
      voteBase,
      quantidadeIndicacoes,
      custoPorVoto,
      totalCidadesResponsaveis: cidadesResponsaveis.length,
      status: item.status
    });

    const leadership = await prisma.leadership.create({
      data: {
        nome: item.nome,
        telefone: item.telefone,
        whatsapp: buildWhatsAppNumber(item.telefone),
        email: item.email,
        fotoPerfilUrl: item.fotoPerfilUrl,
        cidade: city.nome,
        estado: city.estado,
        cidadeId: city.id,
        bairro: item.bairro,
        endereco: item.endereco,
        latitude: city.latitude,
        longitude: city.longitude,
        locationStatus:
          city.latitude != null && city.longitude != null
            ? LocationStatus.FOUND
            : LocationStatus.PENDING,
        potencialVotosEstimado: item.potencialVotosEstimado,
        votosReais: item.votosReais ?? null,
        custoTotal: item.custoTotal,
        custoPorVoto,
        metaVotosIndividual: item.metaVotosIndividual ?? null,
        faixaPotencial: classifyPotentialLevel(item.potencialVotosEstimado),
        scoreLideranca,
        status: item.status,
        observacoes: item.observacoes,
        quantidadeIndicacoes,
        referralCode: generateReferralCode(item.nome, item.key),
        indicadoPorId,
        cadastradoPorId: userMap[item.userKey].id
      }
    });

    leadershipIds.set(item.key, leadership.id);

    await prisma.leadershipCity.createMany({
      data: cidadesResponsaveis.map((cityName) => {
        const relatedCity = cityMap.get(cityName);

        if (!relatedCity) {
          throw new Error(`Cidade de responsabilidade não encontrada: ${cityName}`);
        }

        return {
          leadershipId: leadership.id,
          cityId: relatedCity.id
        };
      }),
      skipDuplicates: true
    });

    await prisma.performanceHistory.createMany({
      data: [
        {
          leadershipId: leadership.id,
          dataReferencia: new Date("2026-03-01T09:00:00.000Z"),
          votosEstimados: Math.max(
            Math.round(item.potencialVotosEstimado * 0.9),
            0
          ),
          votosReais:
            item.votosReais != null ? Math.max(Math.round(item.votosReais * 0.85), 0) : null,
          quantidadeIndicacoes: Math.max(quantidadeIndicacoes - 1, 0),
          custoTotal: Math.max(item.custoTotal * 0.9, 0),
          score: Math.max(scoreLideranca - 6, 0)
        },
        {
          leadershipId: leadership.id,
          dataReferencia: new Date("2026-04-01T09:00:00.000Z"),
          votosEstimados: item.potencialVotosEstimado,
          votosReais: item.votosReais ?? null,
          quantidadeIndicacoes,
          custoTotal: item.custoTotal,
          score: scoreLideranca
        }
      ]
    });
  }

  await prisma.referralSignup.createMany({
    data: referralSignupSeeds.map((signup) => {
      const leadershipId = leadershipIds.get(signup.leadershipKey);
      const linkedLeadership = leadershipSeeds.find(
        (leadership) => leadership.key === signup.leadershipKey
      );

      if (!leadershipId || !linkedLeadership) {
        throw new Error(`Liderança de referral não encontrada: ${signup.leadershipKey}`);
      }

      return {
        nome: signup.nome,
        telefone: signup.telefone,
        email: signup.email,
        cidade: signup.cidade,
        estado: "SP",
        observacoes: signup.observacoes,
        origemRef: generateReferralCode(
          linkedLeadership.nome,
          linkedLeadership.key
        ),
        leadershipId
      };
    })
  });

  const createdLeaderships = await prisma.leadership.findMany({
    select: {
      id: true,
      nome: true,
      cadastradoPorId: true
    }
  });

  await prisma.auditLog.createMany({
    data: [
      ...createdLeaderships.map((leadership) => ({
        entidade: "Leadership",
        entidadeId: leadership.id,
        acao: "CREATE",
        usuarioId: leadership.cadastradoPorId,
        descricao: `Liderança ${leadership.nome} criada via seed`
      })),
      ...referralSignupSeeds.map((signup) => {
        const leadershipId = leadershipIds.get(signup.leadershipKey);

        if (!leadershipId) {
          throw new Error(`Liderança de auditoria não encontrada: ${signup.leadershipKey}`);
        }

        return {
          entidade: "ReferralSignup",
          entidadeId: leadershipId,
          acao: "PUBLIC_SIGNUP",
          usuarioId: admin.id,
          descricao: `Cadastro público ${signup.nome} vinculado à liderança ${signup.leadershipKey}`
        };
      })
    ]
  });

  console.log("Seed concluído:");
  console.log("- Usuários: 3");
  console.log(`- Cidades de SP: ${cityRecords.length}`);
  console.log(`- Lideranças: ${createdLeaderships.length}`);
  console.log(`- Cadastros públicos: ${referralSignupSeeds.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

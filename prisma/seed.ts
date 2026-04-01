import bcrypt from "bcryptjs";
import {
  LeadershipStatus,
  LocationStatus,
  PrismaClient,
  Role
} from "@prisma/client";

import { classifyPotentialLevel } from "../lib/constants/potential";
import { SP_CITIES } from "../lib/data/sp-cities";

const prisma = new PrismaClient();

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
  custoTotal: number;
  observacoes?: string;
  status: LeadershipStatus;
  userId: string;
  indicadoPorKey?: string;
  cidadesResponsaveis: string[];
};

async function main() {
  const globalAdminPasswordHash = await bcrypt.hash("Global123!", 10);
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const operatorPasswordHash = await bcrypt.hash("Operador123!", 10);

  await prisma.auditLog.deleteMany();
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

  await prisma.campaignSettings.create({
    data: {
      id: "default",
      nomeCampanha: "Operacao estadual SP",
      estadoPadrao: "SP",
      restringirAoEstadoPadrao: true
    }
  });

  await prisma.city.createMany({
    data: SP_CITIES,
    skipDuplicates: true
  });

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
      custoTotal: 4920,
      observacoes: "Atuacao forte em associacoes de bairro e redes locais.",
      status: LeadershipStatus.ACTIVE,
      userId: globalAdmin.id,
      cidadesResponsaveis: ["Sao Paulo", "Guarulhos", "Osasco", "Carapicuiba"]
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
      custoTotal: 1920,
      observacoes: "Mobilizacao forte na regiao metropolitana de Campinas.",
      status: LeadershipStatus.ACTIVE,
      userId: admin.id,
      indicadoPorKey: "ana",
      cidadesResponsaveis: ["Campinas", "Hortolandia", "Sumare", "Valinhos"]
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
      custoTotal: 3200,
      observacoes: "Rede ativa em litoral e liderancas comunitarias.",
      status: LeadershipStatus.ACTIVE,
      userId: admin.id,
      indicadoPorKey: "ana",
      cidadesResponsaveis: ["Santos", "Sao Vicente", "Guaruja", "Praia Grande"]
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
      custoTotal: 2650,
      observacoes: "Base consolidada no eixo Vale do Paraiba.",
      status: LeadershipStatus.ACTIVE,
      userId: operator.id,
      indicadoPorKey: "ana",
      cidadesResponsaveis: ["Sao Jose dos Campos", "Jacarei", "Pindamonhangaba", "Taubate"]
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
      custoTotal: 380,
      observacoes: "Cadastro em consolidacao com equipe de rua.",
      status: LeadershipStatus.PENDING,
      userId: admin.id,
      indicadoPorKey: "ana",
      cidadesResponsaveis: ["Osasco", "Barueri", "Carapicuiba", "Itapevi"]
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
      custoTotal: 700,
      status: LeadershipStatus.ACTIVE,
      userId: operator.id,
      indicadoPorKey: "ana",
      cidadesResponsaveis: ["Guarulhos", "Aruja", "Itaquaquecetuba"]
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
      custoTotal: 1980,
      status: LeadershipStatus.ACTIVE,
      userId: admin.id,
      indicadoPorKey: "joao",
      cidadesResponsaveis: ["Ribeirao Preto", "Franca", "Araraquara"]
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
      custoTotal: 1100,
      status: LeadershipStatus.ACTIVE,
      userId: operator.id,
      indicadoPorKey: "joao",
      cidadesResponsaveis: ["Sorocaba", "Itu", "Indaiatuba"]
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
      custoTotal: 2550,
      status: LeadershipStatus.ACTIVE,
      userId: admin.id,
      indicadoPorKey: "joao",
      cidadesResponsaveis: ["Bauru", "Botucatu", "Marilia"]
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
      custoTotal: 480,
      status: LeadershipStatus.ACTIVE,
      userId: operator.id,
      indicadoPorKey: "joao",
      cidadesResponsaveis: ["Jundiai", "Atibaia", "Braganca Paulista"]
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
      custoTotal: 2050,
      status: LeadershipStatus.ACTIVE,
      userId: globalAdmin.id,
      indicadoPorKey: "fernanda",
      cidadesResponsaveis: ["Sao Bernardo do Campo", "Santo Andre", "Sao Caetano do Sul", "Diadema", "Maua"]
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
      custoTotal: 1200,
      status: LeadershipStatus.ACTIVE,
      userId: operator.id,
      indicadoPorKey: "patricia",
      cidadesResponsaveis: ["Mogi das Cruzes", "Suzano", "Ferraz de Vasconcelos"]
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
      custoTotal: 900,
      status: LeadershipStatus.ACTIVE,
      userId: admin.id,
      indicadoPorKey: "bruno",
      cidadesResponsaveis: ["Piracicaba", "Limeira", "Americana"]
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
      custoTotal: 240,
      status: LeadershipStatus.INACTIVE,
      userId: operator.id,
      indicadoPorKey: "elaine",
      cidadesResponsaveis: ["Cotia", "Embu das Artes", "Taboao da Serra"]
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
      custoTotal: 2240,
      status: LeadershipStatus.ACTIVE,
      userId: admin.id,
      indicadoPorKey: "gabriela",
      cidadesResponsaveis: ["Presidente Prudente"]
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
      custoTotal: 3050,
      status: LeadershipStatus.ACTIVE,
      userId: operator.id,
      indicadoPorKey: "gabriela",
      cidadesResponsaveis: ["Sao Jose do Rio Preto"]
    }
  ];

  const leadershipIds = new Map<string, string>();

  for (const item of leadershipSeeds) {
    const city = cityMap.get(item.cidade);

    if (!city) {
      throw new Error(`Cidade nao encontrada na seed: ${item.cidade}`);
    }

    const indicadoPorId = item.indicadoPorKey
      ? leadershipIds.get(item.indicadoPorKey)
      : undefined;

    const leadership = await prisma.leadership.create({
      data: {
        nome: item.nome,
        telefone: item.telefone,
        email: item.email,
        fotoPerfilUrl: item.fotoPerfilUrl,
        cidade: city.nome,
        estado: city.estado,
        cidadeId: city.id,
        bairro: item.bairro,
        endereco: item.endereco,
        latitude: city.latitude,
        longitude: city.longitude,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: item.potencialVotosEstimado,
        custoTotal: item.custoTotal,
        faixaPotencial: classifyPotentialLevel(item.potencialVotosEstimado),
        status: item.status,
        observacoes: item.observacoes,
        quantidadeIndicacoes: 0,
        indicadoPorId,
        cadastradoPorId: item.userId
      }
    });

    leadershipIds.set(item.key, leadership.id);

    await prisma.leadershipCity.createMany({
      data: Array.from(new Set([item.cidade, ...item.cidadesResponsaveis])).map(
        (cityName) => {
          const relatedCity = cityMap.get(cityName);

          if (!relatedCity) {
            throw new Error(`Cidade de responsabilidade nao encontrada: ${cityName}`);
          }

          return {
            leadershipId: leadership.id,
            cityId: relatedCity.id
          };
        }
      ),
      skipDuplicates: true
    });
  }

  const indicationCounts = new Map<string, number>();

  for (const item of leadershipSeeds) {
    if (!item.indicadoPorKey) {
      continue;
    }

    indicationCounts.set(
      item.indicadoPorKey,
      (indicationCounts.get(item.indicadoPorKey) ?? 0) + 1
    );
  }

  for (const item of leadershipSeeds) {
    const leadershipId = leadershipIds.get(item.key);

    if (!leadershipId) {
      continue;
    }

    await prisma.leadership.update({
      where: { id: leadershipId },
      data: {
        quantidadeIndicacoes: indicationCounts.get(item.key) ?? 0
      }
    });
  }

  const createdLeaderships = await prisma.leadership.findMany({
    select: {
      id: true,
      nome: true,
      cadastradoPorId: true
    }
  });

  await prisma.auditLog.createMany({
    data: createdLeaderships.flatMap((leadership) => [
      {
        entidade: "Leadership",
        entidadeId: leadership.id,
        acao: "CREATE",
        usuarioId: leadership.cadastradoPorId,
        descricao: `Lideranca ${leadership.nome} criada via seed`
      }
    ])
  });

  console.log("Seed concluido:");
  console.log("- Usuarios: 3");
  console.log(`- Cidades de SP: ${cityRecords.length}`);
  console.log(`- Liderancas: ${createdLeaderships.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

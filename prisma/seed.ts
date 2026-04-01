import bcrypt from "bcryptjs";
import {
  LeadershipStatus,
  LocationStatus,
  PotentialLevel,
  PrismaClient,
  Role
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const globalAdminPasswordHash = await bcrypt.hash("Global123!", 10);
  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const operatorPasswordHash = await bcrypt.hash("Operador123!", 10);

  await prisma.auditLog.deleteMany();
  await prisma.leadership.deleteMany();
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
      role: Role.ADMIN
    }
  });

  const operator = await prisma.user.create({
    data: {
      name: "Carlos Lima",
      email: "operador@leadmap.local",
      passwordHash: operatorPasswordHash,
      role: Role.OPERATOR
    }
  });

  await prisma.campaignSettings.create({
    data: {
      id: "default",
      nomeCampanha: "Operação estadual SP",
      estadoPadrao: "SP",
      restringirAoEstadoPadrao: false
    }
  });

  const leaderships = await Promise.all([
    prisma.leadership.create({
      data: {
        nome: "Ana Paula Martins",
        telefone: "(11) 98888-1001",
        email: "ana.paula@example.com",
        cidade: "Sao Paulo",
        estado: "SP",
        bairro: "Mooca",
        endereco: "Rua das Flores, 100",
        latitude: -23.55052,
        longitude: -46.63331,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 820,
        faixaPotencial: PotentialLevel.HIGH,
        status: LeadershipStatus.ACTIVE,
        observacoes: "Atua em associações de bairro e eventos comunitários.",
        quantidadeIndicacoes: 54,
        cadastradoPorId: globalAdmin.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Joao Henrique Costa",
        telefone: "(19) 98888-2002",
        email: "joao.henrique@example.com",
        cidade: "Campinas",
        estado: "SP",
        bairro: "Taquaral",
        endereco: "Avenida Norte, 255",
        latitude: -22.90556,
        longitude: -47.06083,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 460,
        faixaPotencial: PotentialLevel.MEDIUM,
        status: LeadershipStatus.ACTIVE,
        observacoes: "Base forte em mobilização de juventude.",
        quantidadeIndicacoes: 28,
        cadastradoPorId: operator.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Fernanda Ribeiro",
        telefone: "(21) 97777-3003",
        email: "fernanda.ribeiro@example.com",
        cidade: "Rio de Janeiro",
        estado: "RJ",
        bairro: "Tijuca",
        endereco: "Rua Haddock Lobo, 88",
        latitude: -22.90685,
        longitude: -43.1729,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 610,
        faixaPotencial: PotentialLevel.HIGH,
        status: LeadershipStatus.ACTIVE,
        observacoes: "Bom relacionamento com lideranças religiosas.",
        quantidadeIndicacoes: 41,
        cadastradoPorId: admin.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Patricia Nascimento",
        telefone: "(71) 96666-4004",
        cidade: "Salvador",
        estado: "BA",
        bairro: "Brotas",
        latitude: -12.9714,
        longitude: -38.5014,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 340,
        faixaPotencial: PotentialLevel.MEDIUM,
        status: LeadershipStatus.INACTIVE,
        observacoes: "Em pausa temporária por reestruturação local.",
        quantidadeIndicacoes: 15,
        cadastradoPorId: operator.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Ricardo Gomes",
        telefone: "(81) 95555-5005",
        cidade: "Recife",
        estado: "PE",
        bairro: "Boa Viagem",
        latitude: -8.04756,
        longitude: -34.877,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 95,
        faixaPotencial: PotentialLevel.LOW,
        status: LeadershipStatus.ACTIVE,
        quantidadeIndicacoes: 9,
        cadastradoPorId: admin.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Juliana Araujo",
        telefone: "(41) 94444-6006",
        email: "juliana.araujo@example.com",
        cidade: "Curitiba",
        estado: "PR",
        bairro: "Centro Civico",
        latitude: -25.4284,
        longitude: -49.2733,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 120,
        faixaPotencial: PotentialLevel.MEDIUM,
        status: LeadershipStatus.PENDING,
        observacoes: "Cadastro em validação final de equipe territorial.",
        quantidadeIndicacoes: 11,
        cadastradoPorId: operator.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Anderson Rocha",
        telefone: "(85) 93333-7007",
        cidade: "Fortaleza",
        estado: "CE",
        latitude: -3.7319,
        longitude: -38.5267,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 540,
        faixaPotencial: PotentialLevel.HIGH,
        status: LeadershipStatus.ACTIVE,
        quantidadeIndicacoes: 36,
        cadastradoPorId: admin.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Luciana Barros",
        telefone: "(91) 92222-8008",
        cidade: "Belem",
        estado: "PA",
        bairro: "Nazare",
        latitude: -1.4558,
        longitude: -48.4902,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 265,
        faixaPotencial: PotentialLevel.MEDIUM,
        status: LeadershipStatus.ACTIVE,
        quantidadeIndicacoes: 24,
        cadastradoPorId: operator.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Marcos Vieira",
        telefone: "(31) 91111-9009",
        cidade: "Belo Horizonte",
        estado: "MG",
        bairro: "Pampulha",
        latitude: -19.9167,
        longitude: -43.9345,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 88,
        faixaPotencial: PotentialLevel.LOW,
        status: LeadershipStatus.ACTIVE,
        quantidadeIndicacoes: 7,
        cadastradoPorId: admin.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Celia Andrade",
        telefone: "(62) 90000-1010",
        cidade: "Goiania",
        estado: "GO",
        latitude: -16.6869,
        longitude: -49.2648,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 510,
        faixaPotencial: PotentialLevel.HIGH,
        status: LeadershipStatus.ACTIVE,
        quantidadeIndicacoes: 31,
        cadastradoPorId: operator.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Tatiane Lopes",
        telefone: "(27) 98877-1112",
        cidade: "Vitoria",
        estado: "ES",
        bairro: "Jardim Camburi",
        latitude: -20.3155,
        longitude: -40.3128,
        locationStatus: LocationStatus.FOUND,
        potencialVotosEstimado: 180,
        faixaPotencial: PotentialLevel.MEDIUM,
        status: LeadershipStatus.ACTIVE,
        quantidadeIndicacoes: 18,
        cadastradoPorId: admin.id
      }
    }),
    prisma.leadership.create({
      data: {
        nome: "Paulo Henrique Freitas",
        telefone: "(98) 97766-1212",
        cidade: "Sao Luis",
        estado: "MA",
        bairro: "Cohama",
        latitude: null,
        longitude: null,
        locationStatus: LocationStatus.PENDING,
        potencialVotosEstimado: 72,
        faixaPotencial: PotentialLevel.LOW,
        status: LeadershipStatus.ACTIVE,
        observacoes: "Aguardando coordenadas confirmadas da equipe de campo.",
        quantidadeIndicacoes: 6,
        cadastradoPorId: operator.id
      }
    })
  ]);

  await prisma.auditLog.createMany({
    data: leaderships.flatMap((leadership, index) => [
      {
        entidade: "Leadership",
        entidadeId: leadership.id,
        acao: "CREATE",
        usuarioId: leadership.cadastradoPorId,
        descricao: `Liderança ${leadership.nome} criada via seed`
      },
      ...(index % 3 === 0
        ? [
            {
              entidade: "Leadership",
              entidadeId: leadership.id,
              acao: "UPDATE",
              usuarioId: leadership.cadastradoPorId,
              descricao: `Liderança ${leadership.nome} revisada na carga inicial`
            }
          ]
        : [])
    ])
  });

  console.log("Seed concluído:");
  console.log(`- Usuários: 3`);
  console.log(`- Lideranças: ${leaderships.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

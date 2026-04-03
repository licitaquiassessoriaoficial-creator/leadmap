"use client";

import dynamic from "next/dynamic";

import { Card } from "@/components/ui/card";
import type { LeadershipWithRelations } from "@/types/app";

type CityPoint = {
  id: string;
  nome: string;
  estado: string;
  codigoIbge?: string | null;
  totalEleitores: number;
  metaVotosCidade?: number | null;
  targetVotes: number;
  latitude: number | null;
  longitude: number | null;
  totalResponsaveis: number;
  votosCaptados: number;
  votosRestantes: number;
  progresso: number;
  indicacoes: number;
  custoPorVotoMedio?: number | null;
  priorityReason: string;
  liderancas: LeadershipWithRelations[];
};

type CoverageRow = {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  fotoPerfilUrl: string | null;
  totalCidades: number;
  scoreLideranca: number;
};

const LeadershipMap = dynamic(
  () => import("@/components/mapa/leadership-map").then((mod) => mod.LeadershipMap),
  {
    ssr: false,
    loading: () => <Card>Carregando mapa...</Card>
  }
);

export function MapPanel({
  points,
  cityPoints,
  leadershipCoverage
}: {
  points: LeadershipWithRelations[];
  cityPoints: CityPoint[];
  leadershipCoverage: CoverageRow[];
}) {
  return (
    <LeadershipMap
      points={points}
      cityPoints={cityPoints}
      leadershipCoverage={leadershipCoverage}
    />
  );
}

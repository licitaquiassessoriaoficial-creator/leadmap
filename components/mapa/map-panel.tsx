"use client";

import dynamic from "next/dynamic";

import { Card } from "@/components/ui/card";
import type { LeadershipWithRelations } from "@/types/app";

const LeadershipMap = dynamic(
  () => import("@/components/mapa/leadership-map").then((mod) => mod.LeadershipMap),
  {
    ssr: false,
    loading: () => <Card>Carregando mapa...</Card>
  }
);

export function MapPanel({ points }: { points: LeadershipWithRelations[] }) {
  return <LeadershipMap points={points} />;
}

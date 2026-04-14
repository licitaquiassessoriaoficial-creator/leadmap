"use client";

import { PotentialLevel } from "@prisma/client";
import L from "leaflet";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer
} from "react-leaflet";

import { CostEfficiencyBadge } from "@/components/shared/cost-efficiency-badge";
import { PotentialBadge } from "@/components/shared/potential-badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { LeadershipStatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { POTENTIAL_METADATA } from "@/lib/constants/potential";
import { buildWhatsAppLink } from "@/lib/domain/leadership";
import { formatCurrency, formatInteger, formatPercent } from "@/lib/utils";
import type { LeadershipWithRelations } from "@/types/app";

const SP_CENTER: [number, number] = [-22.55, -48.64];
const SP_BOUNDS: [[number, number], [number, number]] = [
  [-25.5, -53.5],
  [-19.5, -43.5]
];

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

const markerIcons = Object.values(PotentialLevel).reduce(
  (accumulator, level) => {
    accumulator[level] = L.divIcon({
      html: `<div class="custom-map-marker ${POTENTIAL_METADATA[level].markerClassName}"></div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    return accumulator;
  },
  {} as Record<PotentialLevel, L.DivIcon>
);

export function LeadershipMap({
  points,
  cityPoints,
  leadershipCoverage
}: {
  points: LeadershipWithRelations[];
  cityPoints: CityPoint[];
  leadershipCoverage: CoverageRow[];
}) {
  const [selectedCityId, setSelectedCityId] = useState<string | null>(
    cityPoints.find((city) => city.totalResponsaveis > 0)?.id ?? cityPoints[0]?.id ?? null
  );
  const selectedCity = cityPoints.find((city) => city.id === selectedCityId) ?? null;
  const plantedCities = cityPoints.filter((city) => city.totalResponsaveis > 0).length;
  const missingCities = cityPoints.length - plantedCities;
  const totalEleitoresMonitorados = cityPoints.reduce(
    (total, city) => total + city.totalEleitores,
    0
  );

  const visibleCityPoints = useMemo(
    () => cityPoints.filter((city) => city.latitude != null && city.longitude != null),
    [cityPoints]
  );

  if (!points.length && !visibleCityPoints.length) {
    return (
      <Card className="text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Nenhum ponto disponível
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Ajuste os filtros ou conclua a geocodificação das lideranças.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,360px]">
      <div className="h-[680px] overflow-hidden rounded-2xl bg-white shadow-panel">
        <MapContainer
          center={SP_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={14}
          maxBounds={SP_BOUNDS}
          maxBoundsViscosity={1}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {visibleCityPoints.map((city) => (
            <CircleMarker
              key={`city-${city.id}`}
              center={[city.latitude as number, city.longitude as number]}
              radius={9}
              pathOptions={{
                color: city.totalResponsaveis > 0 ? "#1d4ed8" : "#f97316",
                fillColor: city.totalResponsaveis > 0 ? "#60a5fa" : "#fdba74",
                fillOpacity: 0.75,
                weight: 2
              }}
              eventHandlers={{
                click: () => setSelectedCityId(city.id)
              }}
            >
              <Popup>
                <div className="min-w-[240px] space-y-2">
                  <strong>{city.nome}</strong>
                  <p className="text-sm text-slate-600">
                    {city.totalResponsaveis} lideranças responsáveis
                  </p>
                  <p className="text-sm text-slate-600">
                    Captado: {formatInteger(city.votosCaptados)} /{" "}
                    {formatInteger(city.targetVotes)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Restante: {formatInteger(city.votosRestantes)}
                  </p>
                  <p className="text-sm text-slate-600">
                    Prioridade: {city.priorityReason}
                  </p>
                  <Link
                    href={`/cidades/${city.id}`}
                    className="text-sm font-semibold text-brand-700"
                  >
                    Abrir detalhe da cidade
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {points.map((point) => {
            const pointLatitude = point.latitude ?? point.city?.latitude ?? null;
            const pointLongitude = point.longitude ?? point.city?.longitude ?? null;

            if (pointLatitude == null || pointLongitude == null) {
              return null;
            }

            const whatsAppLink = buildWhatsAppLink(
              point.whatsapp ?? point.telefone,
              `Olá, ${point.nome}! Vamos falar sobre a operação em ${point.cidade}?`
            );

            return (
              <Marker
                key={point.id}
                position={[pointLatitude, pointLongitude]}
                icon={markerIcons[point.faixaPotencial as PotentialLevel]}
              >
                <Popup>
                  <div className="min-w-[260px] space-y-3">
                    <div className="flex items-center gap-3">
                      <ProfileAvatar
                        name={point.nome}
                        imageUrl={point.fotoPerfilUrl}
                        className="h-12 w-12"
                      />
                      <div>
                        <strong>{point.nome}</strong>
                        <div className="text-sm text-slate-500">
                          {point.cidade} / {point.estado}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <PotentialBadge level={point.faixaPotencial} />
                      <LeadershipStatusBadge status={point.status} />
                      <CostEfficiencyBadge value={point.custoPorVoto} />
                    </div>

                    <div className="space-y-1 text-sm text-slate-600">
                      <div>
                        Potencial: {formatInteger(point.potencialVotosEstimado)}
                      </div>
                      <div>Votos reais: {formatInteger(point.votosReais ?? 0)}</div>
                      <div>
                        Indicações: {formatInteger(point.quantidadeIndicacoes)}
                      </div>
                      <div>
                        Custo por voto:{" "}
                        {point.custoPorVoto == null
                          ? "Aguardando votos"
                          : formatCurrency(point.custoPorVoto)}
                      </div>
                      <div>Score: {point.scoreLideranca.toFixed(2)}</div>
                    </div>

                    <div className="flex gap-3 text-sm">
                      <Link
                        href={`/liderancas/${point.id}`}
                        className="font-semibold text-brand-700"
                      >
                        Detalhe
                      </Link>
                      <a
                        href={whatsAppLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-700"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="space-y-6">
        <Card className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Cobertura de SP</h3>
            <p className="text-sm text-slate-500">
              {points.length} pins visíveis, {formatInteger(cityPoints.length)} cidades
              monitoradas e {formatInteger(totalEleitoresMonitorados)} eleitores no
              recorte atual.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Plantadas
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatInteger(plantedCities)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Faltantes
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {formatInteger(missingCities)}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">
              Lideranças com mais cidades sob responsabilidade
            </p>
            {leadershipCoverage.slice(0, 8).map((item) => (
              <Link
                key={item.id}
                href={`/liderancas/${item.id}`}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 transition hover:bg-brand-50"
              >
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    name={item.nome}
                    imageUrl={item.fotoPerfilUrl}
                    className="h-10 w-10"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.nome}</p>
                    <p className="text-xs text-slate-500">
                      {item.cidade} / {item.estado}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {formatInteger(item.totalCidades)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Score {item.scoreLideranca.toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedCity?.nome ?? "Selecione uma cidade"}
              </h3>
              <p className="text-sm text-slate-500">
                Clique em um círculo no mapa para ver o detalhe da cidade.
              </p>
            </div>
            {selectedCity ? (
              <Link
                href={`/cidades/${selectedCity.id}`}
                className="text-sm font-semibold text-brand-700"
              >
                Abrir página
              </Link>
            ) : null}
          </div>

          {selectedCity ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Total captado
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {formatInteger(selectedCity.votosCaptados)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Meta da cidade
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {formatInteger(selectedCity.targetVotes)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Faltante
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {formatInteger(selectedCity.votosRestantes)}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    Custo/voto médio
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {selectedCity.custoPorVotoMedio == null
                      ? "Aguardando votos"
                      : formatCurrency(selectedCity.custoPorVotoMedio)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                  Progresso da meta
                </p>
                <p className="mt-2 text-xl font-semibold text-slate-900">
                  {formatPercent(selectedCity.progresso)}
                </p>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${Math.min(selectedCity.progresso, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  {selectedCity.priorityReason}
                </p>
              </div>

              <div className="space-y-3">
                {selectedCity.liderancas.length ? (
                  selectedCity.liderancas.map((leadership) => (
                    <Link
                      key={leadership.id}
                      href={`/liderancas/${leadership.id}`}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50"
                    >
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          name={leadership.nome}
                          imageUrl={leadership.fotoPerfilUrl}
                          className="h-10 w-10"
                        />
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {leadership.nome}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatInteger(
                              leadership.votosReais ??
                                leadership.potencialVotosEstimado
                            )}{" "}
                            votos • {formatInteger(leadership.quantidadeIndicacoes)}{" "}
                            indicações
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>Score {leadership.scoreLideranca.toFixed(2)}</p>
                        <p>
                          {formatInteger(leadership.cidadesResponsaveis.length)}{" "}
                          cidades
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Nenhuma liderança responsável por esta cidade.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Selecione uma cidade para ver lideranças, votos captados, indicações
              e faltante.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

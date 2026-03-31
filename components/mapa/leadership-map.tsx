"use client";

import { PotentialLevel } from "@prisma/client";
import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";

import { POTENTIAL_METADATA } from "@/lib/constants/potential";
import { Card } from "@/components/ui/card";
import type { LeadershipWithRelations } from "@/types/app";

function escapeHtml(text?: string | null) {
  if (!text) {
    return "";
  }

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ClusterLayer({ points }: { points: LeadershipWithRelations[] }) {
  const map = useMap();

  useEffect(() => {
    let layerGroup:
      | (L.LayerGroup & {
          getBounds: () => L.LatLngBounds;
          addLayer: (layer: L.Layer) => void;
          clearLayers: () => void;
        })
      | null = null;

    async function initialize() {
      await import("leaflet.markercluster");

      const clusterFactory = (
        L as unknown as {
          markerClusterGroup: (
            options?: Record<string, unknown>
          ) => typeof layerGroup;
        }
      ).markerClusterGroup;

      layerGroup = clusterFactory({
        iconCreateFunction(cluster: { getChildCount: () => number }) {
          return L.divIcon({
            html: `<div class="cluster-icon">${cluster.getChildCount()}</div>`,
            className: "",
            iconSize: [44, 44]
          });
        }
      });

      points.forEach((point) => {
        if (point.latitude == null || point.longitude == null) {
          return;
        }

        const level = point.faixaPotencial as PotentialLevel;
        const marker = L.marker([point.latitude, point.longitude], {
          icon: L.divIcon({
            html: `<div class="custom-map-marker ${POTENTIAL_METADATA[level].markerClassName}"></div>`,
            className: "",
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          })
        });

        marker.bindPopup(`
          <div style="min-width: 220px; font-family: sans-serif;">
            <strong>${escapeHtml(point.nome)}</strong>
            <div style="margin-top: 8px; color: #475569;">
              <div>${escapeHtml(point.cidade)} / ${escapeHtml(point.estado)}</div>
              <div>Potencial: ${point.potencialVotosEstimado}</div>
              <div>Indicacoes: ${point.quantidadeIndicacoes}</div>
              <div>Status: ${escapeHtml(point.status)}</div>
            </div>
          </div>
        `);

        layerGroup?.addLayer(marker);
      });

      if (!layerGroup) {
        return;
      }

      map.addLayer(layerGroup);

      if (points.length) {
        map.fitBounds(layerGroup.getBounds(), {
          padding: [40, 40]
        });
      }
    }

    initialize();

    return () => {
      if (layerGroup) {
        layerGroup.clearLayers();
        map.removeLayer(layerGroup);
      }
    };
  }, [map, points]);

  return null;
}

export function LeadershipMap({
  points
}: {
  points: LeadershipWithRelations[];
}) {
  if (!points.length) {
    return (
      <Card className="text-center">
        <h3 className="text-lg font-semibold text-slate-900">
          Nenhum pin disponivel
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Ajuste os filtros ou conclua a geocodificacao das liderancas sem
          coordenadas.
        </p>
      </Card>
    );
  }

  return (
    <div className="h-[560px] overflow-hidden rounded-2xl bg-white shadow-panel">
      <MapContainer center={[-14.235, -51.9253]} zoom={4} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClusterLayer points={points} />
      </MapContainer>
    </div>
  );
}

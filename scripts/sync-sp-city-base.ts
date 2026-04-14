import fs from "node:fs";
import path from "node:path";

import { SP_CITIES } from "@/lib/data/sp-cities";
import { normalizeCityLookupValue } from "@/lib/domain/cities";

type ExternalMunicipality = {
  codigo_ibge: number;
  nome: string;
  latitude: number;
  longitude: number;
  codigo_uf: number;
};

const EXTERNAL_SP_UF_CODE = 35;
const NAME_ALIASES = new Map<string, string>([
  ["florinea", "florinia"],
  ["sao luis do paraitinga", "sao luiz do paraitinga"]
]);

function resolveProjectPath(...segments: string[]) {
  return path.join(process.cwd(), ...segments);
}

function normalizeCityName(value: string) {
  return normalizeCityLookupValue(value);
}

function resolveLookupKey(value: string) {
  const normalized = normalizeCityName(value);

  return NAME_ALIASES.get(normalized) ?? normalized;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toString();
}

function main() {
  const externalRaw = fs
    .readFileSync(resolveProjectPath("tmp_municipios.json"), "utf8")
    .replace(/^\uFEFF/, "");
  const externalCities = (JSON.parse(externalRaw) as ExternalMunicipality[]).filter(
    (city) => city.codigo_uf === EXTERNAL_SP_UF_CODE
  );
  const externalByName = new Map(
    externalCities.map((city) => [resolveLookupKey(city.nome), city])
  );

  const mergedCities = SP_CITIES.map((city) => {
    const externalMatch = externalByName.get(resolveLookupKey(city.nome));

    if (!externalMatch) {
      throw new Error(`Cidade sem correspondencia externa: ${city.nome}`);
    }

    return {
      nome: city.nome,
      estado: city.estado,
      totalEleitores: city.totalEleitores,
      codigoIbge: String(externalMatch.codigo_ibge),
      latitude: externalMatch.latitude,
      longitude: externalMatch.longitude
    };
  });

  const output = [
    "export type SeedCity = {",
    "  nome: string;",
    '  estado: "SP";',
    "  totalEleitores: number;",
    "  codigoIbge: string;",
    "  latitude: number;",
    "  longitude: number;",
    "};",
    "",
    "export const SP_CITIES: SeedCity[] = [",
    ...mergedCities.flatMap((city) => [
      "  {",
      `    "nome": ${JSON.stringify(city.nome)},`,
      '    "estado": "SP",',
      `    "totalEleitores": ${city.totalEleitores},`,
      `    "codigoIbge": ${JSON.stringify(city.codigoIbge)},`,
      `    "latitude": ${formatNumber(city.latitude)},`,
      `    "longitude": ${formatNumber(city.longitude)}`,
      "  },"
    ]),
    "];",
    ""
  ].join("\n");

  fs.writeFileSync(resolveProjectPath("lib/data/sp-cities.ts"), output, "utf8");

  console.log(
    `Base de SP atualizada com ${mergedCities.length} cidades e coordenadas reais.`
  );
}

main();

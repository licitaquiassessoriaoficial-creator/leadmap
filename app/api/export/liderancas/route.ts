import { auth } from "@/lib/auth";
import { getQueryObject, jsonError } from "@/lib/api";
import { exportLeadershipsCsv } from "@/services/export-service";

export async function GET(request: Request) {
  const session = await auth();

  if (!session) {
    return jsonError("Não autenticado", 401);
  }

  const url = new URL(request.url);
  const csv = await exportLeadershipsCsv(
    getQueryObject(url.searchParams),
    session.user.role,
    session.user.id
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="liderancas.csv"'
    }
  });
}

import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { jsonError } from "@/lib/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getExtension(type: string) {
  if (type === "image/png") {
    return "png";
  }

  if (type === "image/webp") {
    return "webp";
  }

  return "jpg";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return jsonError("Nenhum arquivo enviado", 400);
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return jsonError("Envie uma imagem JPG, PNG ou WEBP", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("A imagem deve ter no maximo 5 MB", 400);
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = getExtension(file.type);
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
  const destination = path.join(uploadDir, fileName);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(destination, bytes);

  return Response.json({
    data: {
      url: `/uploads/profiles/${fileName}`
    }
  });
}

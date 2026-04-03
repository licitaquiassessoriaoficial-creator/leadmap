ALTER TABLE "Leadership"
ADD COLUMN "custoPorVoto" DOUBLE PRECISION;

UPDATE "Leadership"
SET "custoPorVoto" = CASE
  WHEN "custoTotal" IS NULL OR "potencialVotosEstimado" <= 0 THEN NULL
  ELSE ROUND((("custoTotal" / "potencialVotosEstimado")::numeric), 2)::DOUBLE PRECISION
END;

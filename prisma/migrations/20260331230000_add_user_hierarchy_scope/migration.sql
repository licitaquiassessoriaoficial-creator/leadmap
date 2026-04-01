ALTER TABLE "User"
ADD COLUMN "createdById" TEXT;

CREATE INDEX "User_createdById_idx" ON "User"("createdById");

ALTER TABLE "User"
ADD CONSTRAINT "User_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

WITH first_global AS (
  SELECT id
  FROM "User"
  WHERE role = 'GLOBAL_ADMIN'
  ORDER BY "createdAt" ASC
  LIMIT 1
)
UPDATE "User"
SET "createdById" = (SELECT id FROM first_global)
WHERE role = 'ADMIN'
  AND "createdById" IS NULL
  AND EXISTS (SELECT 1 FROM first_global);

WITH first_admin AS (
  SELECT id
  FROM "User"
  WHERE role = 'ADMIN'
  ORDER BY "createdAt" ASC
  LIMIT 1
)
UPDATE "User"
SET "createdById" = (SELECT id FROM first_admin)
WHERE role = 'OPERATOR'
  AND "createdById" IS NULL
  AND EXISTS (SELECT 1 FROM first_admin);

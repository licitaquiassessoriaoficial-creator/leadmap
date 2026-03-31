import { PotentialLevel } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { POTENTIAL_METADATA } from "@/lib/constants/potential";

export function PotentialBadge({ level }: { level: PotentialLevel }) {
  const metadata = POTENTIAL_METADATA[level];

  return <Badge className={metadata.badgeClassName}>{metadata.label}</Badge>;
}

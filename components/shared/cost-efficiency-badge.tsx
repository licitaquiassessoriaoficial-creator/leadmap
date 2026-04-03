import {
  classifyCostEfficiency,
  COST_EFFICIENCY_METADATA
} from "@/lib/constants/efficiency";
import { Badge } from "@/components/ui/badge";

export function CostEfficiencyBadge({
  value
}: {
  value?: number | null;
}) {
  const level = classifyCostEfficiency(value);

  if (!level) {
    return (
      <Badge className="bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200">
        Aguardando votos
      </Badge>
    );
  }

  const metadata = COST_EFFICIENCY_METADATA[level];

  return <Badge className={metadata.badgeClassName}>{metadata.label}</Badge>;
}

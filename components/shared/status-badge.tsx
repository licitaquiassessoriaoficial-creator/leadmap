import { LeadershipStatus, Role } from "@prisma/client";

import { Badge } from "@/components/ui/badge";

const leadershipStyles: Record<LeadershipStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  INACTIVE: "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200",
  PENDING: "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200"
};

const roleStyles: Record<Role, string> = {
  ADMIN: "bg-brand-100 text-brand-700 ring-1 ring-inset ring-brand-200",
  OPERATOR: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200"
};

export function LeadershipStatusBadge({ status }: { status: LeadershipStatus }) {
  const label =
    status === LeadershipStatus.ACTIVE
      ? "Ativa"
      : status === LeadershipStatus.INACTIVE
        ? "Inativa"
        : "Pendente";

  return <Badge className={leadershipStyles[status]}>{label}</Badge>;
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge className={roleStyles[role]}>{role === Role.ADMIN ? "Admin" : "Operador"}</Badge>;
}

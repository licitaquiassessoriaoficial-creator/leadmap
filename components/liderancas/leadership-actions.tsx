"use client";

import { LeadershipStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function LeadershipActions({
  id,
  status,
  canDelete
}: {
  id: string;
  status: LeadershipStatus;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  async function changeStatus(
    nextStatus: "ACTIVE" | "INACTIVE"
  ) {
    const actionLabel =
      nextStatus === LeadershipStatus.ACTIVE ? "reativar" : "inativar";

    if (!window.confirm(`Deseja ${actionLabel} esta liderança?`)) {
      return;
    }

    setLoadingAction(actionLabel);

    const response = await fetch(`/api/liderancas/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: nextStatus })
    });

    setLoadingAction(null);

    if (!response.ok) {
      window.alert("Não foi possível alterar o status.");
      return;
    }

    router.refresh();
  }

  async function removeLeadership() {
    if (!window.confirm("Deseja excluir definitivamente esta liderança?")) {
      return;
    }

    setLoadingAction("excluir");

    const response = await fetch(`/api/liderancas/${id}`, {
      method: "DELETE"
    });

    setLoadingAction(null);

    if (!response.ok) {
      window.alert("Não foi possível excluir a liderança.");
      return;
    }

    router.push("/liderancas?feedback=Lideran%C3%A7a%20exclu%C3%ADda%20com%20sucesso.");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Link href={`/liderancas/${id}/editar`}>
        <Button variant="secondary">Editar</Button>
      </Link>
      {status === LeadershipStatus.ACTIVE ? (
        <Button
          variant="secondary"
          onClick={() => changeStatus(LeadershipStatus.INACTIVE)}
          disabled={loadingAction !== null}
        >
          {loadingAction === "inativar" ? "Processando..." : "Inativar"}
        </Button>
      ) : (
        <Button
          variant="secondary"
          onClick={() => changeStatus(LeadershipStatus.ACTIVE)}
          disabled={loadingAction !== null}
        >
          {loadingAction === "reativar" ? "Processando..." : "Reativar"}
        </Button>
      )}
      {canDelete ? (
        <Button
          variant="danger"
          onClick={removeLeadership}
          disabled={loadingAction !== null}
        >
          {loadingAction === "excluir" ? "Excluindo..." : "Excluir"}
        </Button>
      ) : null}
    </div>
  );
}

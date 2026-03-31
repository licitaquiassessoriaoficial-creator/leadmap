import { User } from "@prisma/client";

import { RoleBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export function UsersTable({ users }: { users: User[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Perfil
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Criado em
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-4 text-sm font-medium text-slate-900">
                  {user.name}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">{user.email}</td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {formatDate(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

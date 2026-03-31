"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginInput } from "@/validations/auth";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function handleSubmit(values: LoginInput) {
    setServerError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false
    });

    if (!result || result.error) {
      setServerError("Credenciais inválidas. Tente novamente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-brand-600">
          Acesso seguro
        </p>
        <h2 className="text-3xl font-semibold text-slate-900">Entrar no sistema</h2>
        <p className="text-sm text-slate-500">
          Use uma conta com perfil administrador ou operador.
        </p>
      </div>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <Input
            type="email"
            placeholder="voce@leadmap.local"
            {...form.register("email")}
          />
        </Field>
        <Field label="Senha" error={form.formState.errors.password?.message}>
          <Input type="password" placeholder="Sua senha" {...form.register("password")} />
        </Field>
        {serverError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        ) : null}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
        <p className="font-medium text-slate-700">Credenciais de seed</p>
        <p className="mt-1">admin@leadmap.local / Admin123!</p>
        <p>operador@leadmap.local / Operador123!</p>
      </div>
    </div>
  );
}

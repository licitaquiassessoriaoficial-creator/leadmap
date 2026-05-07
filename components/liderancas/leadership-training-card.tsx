export function LeadershipTrainingCard() {
  return (
    <div className="space-y-3 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
      <p className="text-sm font-semibold text-brand-800">Treinamento rapido</p>
      <p className="text-sm text-brand-900">
        Para treinar os coordenadores, siga este roteiro de 3 passos ao cadastrar
        novas liderancas.
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-brand-900">
        <li>Preencha contato e cidade base da lideranca.</li>
        <li>Adicione foto de perfil, foto de capa e biografia curta.</li>
        <li>Defina potencial, votos e cidades sob responsabilidade.</li>
      </ol>
      <p className="text-xs text-brand-700">
        Dica: deixe a biografia pronta em um texto padrao para acelerar os novos
        cadastros.
      </p>
    </div>
  );
}

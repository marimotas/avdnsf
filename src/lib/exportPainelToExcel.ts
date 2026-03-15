import * as XLSX from 'xlsx';
import type { ColaboradorResultado } from '@/lib/ninebox-calc';

type DeclaracaoRow = {
  user_name: string;
  user_email: string;
  declaracao: string | null;
  metas: string | null;
  updated_at: string;
};

export function exportPainelToExcel(
  ciclo: string,
  declaracoes: DeclaracaoRow[],
  resultados: ColaboradorResultado[]
) {
  const wb = XLSX.utils.book_new();

  // ── Aba 1: Declarações ──────────────────────────────────────────────────────
  const declRows: (string | number)[][] = [];
  declRows.push([`DECLARAÇÕES DE EXPECTATIVAS — Ciclo ${ciclo}`, '', '', '']);
  declRows.push([]);
  declRows.push(['Nome', 'E-mail', 'Declaração', 'Última atualização']);

  for (const d of declaracoes) {
    const fmt = new Date(d.updated_at).toLocaleDateString('pt-BR');
    declRows.push([d.user_name, d.user_email, d.declaracao || '—', fmt]);
  }

  const wsDecl = XLSX.utils.aoa_to_sheet(declRows);
  wsDecl['!cols'] = [{ wch: 30 }, { wch: 36 }, { wch: 80 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsDecl, 'Declarações');

  // ── Aba 2: Metas ────────────────────────────────────────────────────────────
  const metasRows: (string | number)[][] = [];
  metasRows.push([`METAS — Ciclo ${ciclo}`, '', '', '']);
  metasRows.push([]);
  metasRows.push(['Nome', 'E-mail', 'Metas', 'Última atualização']);

  for (const d of declaracoes) {
    const fmt = new Date(d.updated_at).toLocaleDateString('pt-BR');
    metasRows.push([d.user_name, d.user_email, d.metas || '—', fmt]);
  }

  const wsMetas = XLSX.utils.aoa_to_sheet(metasRows);
  wsMetas['!cols'] = [{ wch: 30 }, { wch: 36 }, { wch: 80 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, wsMetas, 'Metas');

  // ── Aba 3: Avaliações ───────────────────────────────────────────────────────
  const avalRows: (string | number)[][] = [];
  avalRows.push([`AVALIAÇÕES DE DESEMPENHO — Ciclo ${ciclo}`, '', '', '', '', '', '', '']);
  avalRows.push([]);
  avalRows.push([
    'Nome',
    'Cluster',
    'Classificação Cluster',
    'Score Desempenho',
    'Nível Desempenho',
    'Score Potencial',
    'Nível Potencial',
    'Quadrante',
    'Ação Recomendada',
  ]);

  const sorted = [...resultados].sort((a, b) => b.quadrante.cluster - a.quadrante.cluster);
  for (const r of sorted) {
    avalRows.push([
      r.nome,
      `C${r.quadrante.cluster}`,
      r.quadrante.clusterNome,
      +r.desempenhoScore.toFixed(2),
      r.desempenhoNivel,
      r.potencialScore > 0 ? +r.potencialScore.toFixed(2) : '—',
      r.potencialScore > 0 ? r.potencialNivel : '—',
      r.quadrante.nome,
      r.quadrante.clusterAcao,
    ]);
  }

  const wsAval = XLSX.utils.aoa_to_sheet(avalRows);
  wsAval['!cols'] = [
    { wch: 30 },
    { wch: 8 },
    { wch: 22 },
    { wch: 18 },
    { wch: 18 },
    { wch: 16 },
    { wch: 16 },
    { wch: 26 },
    { wch: 72 },
  ];
  XLSX.utils.book_append_sheet(wb, wsAval, 'Avaliações');

  // ── Export ──────────────────────────────────────────────────────────────────
  const fileName = `painel_nsf_ciclo_${ciclo.replace('.', '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

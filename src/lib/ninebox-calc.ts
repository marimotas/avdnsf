// ─── Types ───────────────────────────────────────────────────────────────────

export type NivelDimensao = 'Baixo' | 'Médio' | 'Alto';

export interface QuadranteInfo {
  nome: string;
  cluster: number;
  clusterNome: string;
  clusterAcao: string;
}

export interface ColaboradorResultado {
  nome: string;
  desempenhoScore: number;       // 5–25
  potencialScore: number;        // 5–25
  desempenhoNivel: NivelDimensao;
  potencialNivel: NivelDimensao;
  quadrante: QuadranteInfo;
  comentarios: string[];
  temLider: boolean;
  temInteracao: boolean;
}

// ─── Score helpers ────────────────────────────────────────────────────────────

const avg = (values: (number | null)[]): number => {
  const valid = values.filter((v): v is number => v !== null && !isNaN(v));
  if (!valid.length) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
};

const classifyNivel = (score: number): NivelDimensao => {
  if (score <= 11.6) return 'Baixo';
  if (score <= 18.3) return 'Médio';
  return 'Alto';
};

// ─── Quadrant map ─────────────────────────────────────────────────────────────

export const QUADRANTES: Record<string, QuadranteInfo> = {
  'Baixo-Baixo': {
    nome: 'Ponto crítico',
    cluster: 1,
    clusterNome: 'Abaixo do esperado',
    clusterAcao: 'Iniciar plano de melhoria de performance (PIP) com metas claras e prazo definido.',
  },
  'Médio-Baixo': {
    nome: 'Entregador estável',
    cluster: 2,
    clusterNome: 'Precisa melhorar',
    clusterAcao: 'Atenção próxima, feedbacks frequentes, metas de curto prazo e investigação de barreiras.',
  },
  'Alto-Baixo': {
    nome: 'Referência técnica',
    cluster: 3,
    clusterNome: 'Mandou bem',
    clusterAcao: 'Reconhecimento, desafios laterais, especialização e estímulo ao crescimento.',
  },
  'Baixo-Médio': {
    nome: 'Em desenvolvimento',
    cluster: 2,
    clusterNome: 'Precisa melhorar',
    clusterAcao: 'Atenção próxima, feedbacks frequentes, metas de curto prazo e investigação de barreiras.',
  },
  'Médio-Médio': {
    nome: 'Profissional consistente',
    cluster: 3,
    clusterNome: 'Mandou bem',
    clusterAcao: 'Reconhecimento, desafios laterais, especialização e estímulo ao crescimento.',
  },
  'Alto-Médio': {
    nome: 'Gerador de valor',
    cluster: 4,
    clusterNome: 'Além do esperado',
    clusterAcao: 'Reter ativamente, incluir no plano de sucessão, garantir desafios estratégicos contínuos.',
  },
  'Baixo-Alto': {
    nome: 'Potencial represado',
    cluster: 2,
    clusterNome: 'Precisa melhorar',
    clusterAcao: 'Atenção próxima, feedbacks frequentes, metas de curto prazo e investigação de barreiras.',
  },
  'Médio-Alto': {
    nome: 'Promessa em desenvolvimento',
    cluster: 3,
    clusterNome: 'Mandou bem',
    clusterAcao: 'Reconhecimento, desafios laterais, especialização e estímulo ao crescimento.',
  },
  'Alto-Alto': {
    nome: 'Top performer',
    cluster: 4,
    clusterNome: 'Além do esperado',
    clusterAcao: 'Reter ativamente, incluir no plano de sucessão, garantir desafios estratégicos contínuos.',
  },
};

// ─── Cluster colors ───────────────────────────────────────────────────────────

export const CLUSTER_COLORS: Record<number, { bg: string; border: string; text: string; badge: string }> = {
  1: { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.3)',   text: '#f87171', badge: '#ef4444' },
  2: { bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.3)',  text: '#fbbf24', badge: '#f59e0b' },
  3: { bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.3)',  text: '#60a5fa', badge: '#3b82f6' },
  4: { bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.3)',   text: '#4ade80', badge: '#22c55e' },
};

// ─── Main calculation ─────────────────────────────────────────────────────────

export type AvaliacaoRow = {
  colaborador_nome: string;
  tipo_avaliador: string;
  d1: number | null; d2: number | null; d3: number | null; d4: number | null; d5: number | null;
  p1: number | null; p2: number | null; p3: number | null; p4: number | null; p5: number | null;
  i1: number | null; i2: number | null; i3: number | null; i4: number | null; i5: number | null;
  comentario: string | null;
};

export function calcularResultados(rows: AvaliacaoRow[]): ColaboradorResultado[] {
  const byColab: Record<string, AvaliacaoRow[]> = {};
  for (const row of rows) {
    if (!byColab[row.colaborador_nome]) byColab[row.colaborador_nome] = [];
    byColab[row.colaborador_nome].push(row);
  }

  const resultados: ColaboradorResultado[] = [];

  for (const nome of Object.keys(byColab).sort()) {
    const avaliacoes = byColab[nome];
    const lideres = avaliacoes.filter((a) => a.tipo_avaliador === 'Líder');
    const interacoes = avaliacoes.filter((a) => a.tipo_avaliador === 'Interação');

    // Desempenho líder: avg(d1..d5) per row → avg of row sums
    const liderDScores = lideres.map((r) => avg([r.d1, r.d2, r.d3, r.d4, r.d5]) * 5);
    const liderDScore = avg(liderDScores); // 5–25

    // Potencial: avg(p1..p5) per row → avg of row sums
    const liderPScores = lideres.map((r) => avg([r.p1, r.p2, r.p3, r.p4, r.p5]) * 5);
    const potencialScore = avg(liderPScores); // 5–25

    // Desempenho interação: avg(i1..i5) per row → avg of row sums
    const interacaoDScores = interacoes.map((r) => avg([r.i1, r.i2, r.i3, r.i4, r.i5]) * 5);
    const interacaoDScore = avg(interacaoDScores); // 5–25

    // Weighted desempenho
    let desempenhoScore: number;
    if (lideres.length > 0 && interacoes.length > 0) {
      desempenhoScore = liderDScore * 0.6 + interacaoDScore * 0.4;
    } else if (lideres.length > 0) {
      desempenhoScore = liderDScore;
    } else {
      desempenhoScore = interacaoDScore;
    }

    const desempenhoNivel = classifyNivel(desempenhoScore);
    const potencialNivel = classifyNivel(potencialScore);

    const quadranteKey = `${desempenhoNivel}-${potencialNivel}`;
    const quadrante = QUADRANTES[quadranteKey] ?? QUADRANTES['Médio-Médio'];

    const comentarios = avaliacoes
      .map((a) => a.comentario)
      .filter((c): c is string => !!c && c.trim() !== '');

    resultados.push({
      nome,
      desempenhoScore,
      potencialScore,
      desempenhoNivel,
      potencialNivel,
      quadrante,
      comentarios,
      temLider: lideres.length > 0,
      temInteracao: interacoes.length > 0,
    });
  }

  return resultados;
}

// Grid position for the 9-box visual (col 0-2, row 0-2 bottom-to-top)
export function getGridPos(r: ColaboradorResultado): { col: number; row: number } {
  const colMap: Record<NivelDimensao, number> = { Baixo: 0, Médio: 1, Alto: 2 };
  const rowMap: Record<NivelDimensao, number> = { Baixo: 0, Médio: 1, Alto: 2 };
  return { col: colMap[r.desempenhoNivel], row: rowMap[r.potencialNivel] };
}

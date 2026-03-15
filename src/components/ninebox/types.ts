// Shared types for the 9-Box evaluation flow
export type EvaluationType = 'Líder' | 'Interação';

export interface EvaluationState {
  colaboradorNome: string;
  avaliadorNome: string;
  tipoAvaliador: EvaluationType | null;
  // Líder – desempenho
  d1: number | null; d2: number | null; d3: number | null; d4: number | null; d5: number | null;
  // Líder – potencial
  p1: number | null; p2: number | null; p3: number | null; p4: number | null; p5: number | null;
  // Interação – desempenho
  i1: number | null; i2: number | null; i3: number | null; i4: number | null; i5: number | null;
  comentario: string;
}

export const COLLABORATORS = [
  'Ana Lima',
  'Bruno Carvalho',
  'Carla Mendes',
  'Diego Santos',
  'Elisa Rocha',
];

export const LIDER_QUESTIONS = {
  desempenho: [
    { key: 'd1', text: 'As metas e objetivos estabelecidos foram atingidos ou superados no período avaliado.' },
    { key: 'd2', text: 'A qualidade das entregas é consistentemente alta, com baixo índice de retrabalho.' },
    { key: 'd3', text: 'Prazos e compromissos assumidos são cumpridos de forma confiável e consistente.' },
    { key: 'd4', text: 'O colaborador demonstra os valores da empresa no dia a dia: age com integridade inabalável, coloca o cliente no comando das suas decisões e busca ativamente o progresso contínuo.' },
    { key: 'd5', text: 'O impacto do trabalho é percebido positivamente pela equipe e por outras áreas da empresa.' },
  ],
  potencial: [
    { key: 'p1', text: 'Aprende rapidamente novas habilidades ou conceitos quando a situação exige.' },
    { key: 'p2', text: 'Demonstra interesse genuíno em crescer profissionalmente e busca ativamente novos desafios.' },
    { key: 'p3', text: 'Quando assume responsabilidades maiores, performa bem mesmo em cenários de incerteza.' },
    { key: 'p4', text: 'Influencia positivamente o ambiente ao redor, motivando colegas e gerando engajamento.' },
    { key: 'p5', text: 'Consigo imaginar este colaborador atuando com excelência em cargos de maior complexidade em até 2 anos.' },
  ],
};

export const INTERACAO_QUESTIONS = [
  { key: 'i1', text: 'A qualidade das entregas desta pessoa e sua colaboração com o time são satisfatórias.' },
  { key: 'i2', text: 'A atitude, postura e comunicação desta pessoa contribuem positivamente para o ambiente de trabalho.' },
  { key: 'i3', text: 'Esta pessoa cumpre prazos e compromissos, e seu trabalho gera impacto positivo na equipe.' },
  { key: 'i4', text: 'Esta pessoa age com integridade inabalável e coloca o cliente no centro das suas decisões.' },
  { key: 'i5', text: 'Esta pessoa busca o progresso contínuo, propondo melhorias e evoluindo na forma como trabalha.' },
];

export const SCALE_LABELS: Record<number, string> = {
  1: 'Raramente',
  2: 'Às vezes',
  3: 'Frequentemente',
  4: 'Quase sempre',
  5: 'Sempre',
};

export const COMMENT_PLACEHOLDER =
  'Compartilhe sua percepção com cuidado e honestidade. Um bom feedback descreve comportamentos concretos que você observou — não características da pessoa. Exemplos: "Percebi que em situações de pressão ele manteve a calma e trouxe soluções rápidas." Seu comentário faz diferença no desenvolvimento desta pessoa.';

export function emptyState(): EvaluationState {
  return {
    colaboradorNome: '',
    avaliadorNome: '',
    tipoAvaliador: null,
    d1: null, d2: null, d3: null, d4: null, d5: null,
    p1: null, p2: null, p3: null, p4: null, p5: null,
    i1: null, i2: null, i3: null, i4: null, i5: null,
    comentario: '',
  };
}

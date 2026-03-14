import * as XLSX from "xlsx";
import type { CategoryData } from "@/components/EvaluationCategory";
import { ratingLabels } from "@/components/RatingSelector";

interface EvaluatorInfo {
  evaluatorName: string;
  employeeName: string;
  department: string;
  role: string;
  period: string;
}

export function exportEvaluationToExcel(
  evaluatorInfo: EvaluatorInfo,
  categories: CategoryData[],
  generalComment: string
) {
  const wb = XLSX.utils.book_new();

  // ---- Sheet 1: Detalhado ----
  const detailedRows: (string | number)[][] = [];

  detailedRows.push(["AVALIAÇÃO DE DESEMPENHO", "", "", "", ""]);
  detailedRows.push([]);
  detailedRows.push(["Avaliador:", evaluatorInfo.evaluatorName, "", "Avaliado:", evaluatorInfo.employeeName]);
  detailedRows.push(["Departamento:", evaluatorInfo.department, "", "Cargo:", evaluatorInfo.role]);
  detailedRows.push(["Período:", evaluatorInfo.period, "", "Data:", new Date().toLocaleDateString("pt-BR")]);
  detailedRows.push([]);
  detailedRows.push(["CATEGORIA", "COMPETÊNCIA / CRITÉRIO", "NOTA (1-5)", "CONCEITO", "COMENTÁRIOS DA CATEGORIA"]);

  for (const category of categories) {
    for (let i = 0; i < category.questions.length; i++) {
      const q = category.questions[i];
      const ratingLabel = q.rating ? ratingLabels[q.rating].label : "Não avaliado";
      detailedRows.push([
        i === 0 ? category.title : "",
        q.text,
        q.rating ?? "",
        ratingLabel,
        i === 0 ? category.comment || "" : "",
      ]);
    }
    detailedRows.push([]);
  }

  detailedRows.push(["COMENTÁRIO GERAL", "", "", "", ""]);
  detailedRows.push([generalComment || "—", "", "", "", ""]);

  const wsDetailed = XLSX.utils.aoa_to_sheet(detailedRows);

  // Column widths
  wsDetailed["!cols"] = [
    { wch: 28 },
    { wch: 48 },
    { wch: 12 },
    { wch: 24 },
    { wch: 52 },
  ];

  XLSX.utils.book_append_sheet(wb, wsDetailed, "Avaliação Detalhada");

  // ---- Sheet 2: Resumo por Categoria ----
  const summaryRows: (string | number)[][] = [];
  summaryRows.push(["RESUMO POR CATEGORIA", "", "", ""]);
  summaryRows.push([]);
  summaryRows.push(["Categoria", "Qtd. Questões", "Média", "Conceito Geral"]);

  const allRatings: number[] = [];

  for (const category of categories) {
    const catRatings = category.questions.map((q) => q.rating).filter(Boolean) as number[];
    const avg = catRatings.length > 0 ? catRatings.reduce((a, b) => a + b, 0) / catRatings.length : 0;
    const avgLabel = avg > 0 ? getRatingConcept(avg) : "—";
    allRatings.push(...catRatings);
    summaryRows.push([category.title, category.questions.length, avg > 0 ? +avg.toFixed(2) : "—", avgLabel]);
  }

  summaryRows.push([]);
  const globalAvg = allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
  summaryRows.push(["MÉDIA GERAL", "", globalAvg > 0 ? +globalAvg.toFixed(2) : "—", globalAvg > 0 ? getRatingConcept(globalAvg) : "—"]);

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary["!cols"] = [{ wch: 32 }, { wch: 16 }, { wch: 12 }, { wch: 26 }];

  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");

  // ---- Export ----
  const fileName = `avaliacao_${(evaluatorInfo.employeeName || "colaborador").replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

function getRatingConcept(avg: number): string {
  if (avg < 2) return ratingLabels[1].label;
  if (avg < 3) return ratingLabels[2].label;
  if (avg < 4) return ratingLabels[3].label;
  if (avg < 4.5) return ratingLabels[4].label;
  return ratingLabels[5].label;
}

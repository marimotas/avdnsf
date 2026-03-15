import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Avaliacao from "./pages/Avaliacao.tsx";
import Declaracoes from "./pages/Declaracoes.tsx";
import Resultados from "./pages/Resultados.tsx";
import PainelNSF from "./pages/PainelNSF.tsx";
import MeuResultado from "./pages/MeuResultado.tsx";
import Feedback from "./pages/Feedback.tsx";
import Configuracoes from "./pages/Configuracoes.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/avaliacao" element={<Avaliacao />} />
          <Route path="/declaracoes" element={<Declaracoes />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/painel" element={<PainelNSF />} />
          <Route path="/meu-resultado" element={<MeuResultado />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

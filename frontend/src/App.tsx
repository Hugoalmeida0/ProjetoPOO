import { Toaster } from "@/componentes/ui/toaster";
import { Toaster as Sonner } from "@/componentes/ui/sonner";
import { TooltipProvider } from "@/componentes/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAutenticacao";
import Index from "./telas/Inicio";
import Auth from "./telas/Autenticacao";
import GraduationDetails from "./telas/DetalhesGraduacao";
import MentorDetails from "./telas/DetalhesMentor";
import BookingMentorship from "./telas/AgendarMentoria";
import MyBookings from "./telas/MeusAgendamentos";
import BecomeMentor from "./telas/TornarSeMentor";
import Students from "./telas/Estudantes";
import Mentors from "./telas/Mentores";
import NotFound from "./telas/NaoEncontrado";
import Account from "./telas/Conta";
import MentorDashboard from "./telas/PainelMentor";
import SaibaMais from "./telas/SaibaMais";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/graduacao/:slug" element={<GraduationDetails />} />
            <Route path="/mentor/:id" element={<MentorDetails />} />
            <Route path="/agendar/:id" element={<BookingMentorship />} />
            <Route path="/mentors" element={<Mentors />} />
            <Route path="/students" element={<Students />} />
            <Route path="/saiba-mais" element={<SaibaMais />} />
            <Route path="/meus-agendamentos" element={<MyBookings />} />
            <Route path="/tornar-se-mentor" element={<BecomeMentor />} />
            <Route path="/mentor/dashboard" element={<MentorDashboard />} />
            <Route path="/account" element={<Account />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

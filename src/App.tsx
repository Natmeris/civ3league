import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
const BASE_NAME = "/CivPlayers-Civ3-League";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Rules from "./pages/Rules";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Modes from "./pages/Modes";
import HallOfFame from "./pages/HallOfFame";
import Guides from "./pages/Guides";
import Stream from "./pages/Stream";
import Admin from "./pages/Admin";
import OldLeaderboards from "./pages/OldLeaderboards";
import PlayerProfile from "./pages/PlayerProfile";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
  <BrowserRouter basename={BASE_NAME}>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/modes" element={<Modes />} />
          <Route path="/hall-of-fame" element={<HallOfFame />} />
          <Route path="/guides" element={<Guides />} />
          <Route path="/stream" element={<Stream />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/old-leaderboards" element={<OldLeaderboards />} />
          <Route path="/player/:name" element={<PlayerProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

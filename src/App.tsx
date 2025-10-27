import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
// Determine the router basename from Vite env so the app works both when
// served from the repo subpath (e.g. /CivPlayers-Civ3-League/) and from a
// custom domain root (/). Use VITE_BASE if provided (build-time override),
// otherwise fall back to Vite's BASE_URL. Normalize to remove a trailing
// slash and use undefined for root so BrowserRouter behaves correctly.
const rawBase = (import.meta.env.VITE_BASE as string) || (import.meta.env.BASE_URL as string) || "/";
let BASE_NAME = rawBase;
if (BASE_NAME && BASE_NAME !== "/") {
  // remove trailing slash if present
  if (BASE_NAME.endsWith("/")) BASE_NAME = BASE_NAME.slice(0, -1);
} else {
  // If no build-time base is set, attempt a runtime detection so local
  // development using the repo-subpath (e.g. visiting
  // http://localhost:8080/CivPlayers-Civ3-League) still works without the
  // developer needing to set env variables. This checks the current
  // location and uses the known repo subpath if present.
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/CivPlayers-Civ3-League")) {
    BASE_NAME = "/CivPlayers-Civ3-League";
  } else {
    BASE_NAME = undefined as unknown as string;
  }
}
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
      {/* Show a proper 404 page for unknown routes instead of silently
        falling back to Home. */}
      <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

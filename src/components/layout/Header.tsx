import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Trophy, Users, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Rules", href: "/rules" },
    { name: "Modes", href: "/modes" },
    { name: "Events", href: "/events" },
    { name: "Hall of Fame", href: "/hall-of-fame" },
    { name: "Guides", href: "/guides" },
    { name: "Stream", href: "/stream" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
  <header className="bg-card border-b border-[var(--civ3-border)] sticky top-0 z-50">
  <div className="container mx-auto px-4">
  <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Trophy className="h-8 w-8" style={{ color: 'var(--civ3-gold)' }} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--civ3-gold)', fontFamily: 'Cormorant Garamond, serif' }}>CivPlayers</h1>
              <p className="text-xs" style={{ color: 'var(--civ3-gold)', opacity: 0.7, fontFamily: 'Cormorant Garamond, serif' }}>Civ3 League</p>
            </div>
          </Link>

          {/* Desktop Navigation - horizontally scrollable on overflow */}
          <nav className="hidden md:flex flex-wrap items-center gap-x-2 gap-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link whitespace-nowrap px-2 ${isActive(item.href) ? "text-primary" : ""}`}
                style={{ fontFamily: 'Adelle Sans, adelle-sans, sans-serif', color: '#fff' }}
              >
                {item.name === "Hall of Fame" ? (
                  <>
                    <span className="lg:inline">Hall of Fame</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">{item.name}</span>
                    <span className="inline sm:hidden text-xs">{item.name[0]}</span>
                  </>
                )}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons - responsive, collapse text on small screens */}
          <div className="hidden md:flex items-center space-x-2 min-w-0">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="border-primary/30 hover:bg-primary/10 min-w-0 px-2 md:px-3"
              aria-label="Join Steam Group"
            >
              <a href="https://steamcommunity.com/groups/CivPlayersCiv3" target="_blank" rel="noopener noreferrer" className="flex items-center min-w-0">
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Join Steam</span>
                <span className="inline lg:hidden">Steam</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
            <Button size="sm" className="btn-hero min-w-0 px-2 md:px-3" aria-label="Join Discord Server">
              <a href="https://discord.gg/teVt5pt" target="_blank" rel="noopener noreferrer" className="flex items-center min-w-0">
                <span className="hidden lg:inline">Discord</span>
                <span className="inline lg:hidden">Discord</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg py-2 px-3 rounded-md transition-colors ${
                        isActive(item.href) 
                          ? "bg-primary/20 text-primary" 
                          : "hover:bg-muted"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  
                  <div className="pt-4 border-t border-border space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-primary/30 hover:bg-primary/10"
                      asChild
                    >
                      <a href="https://steamcommunity.com/groups/civplayers" target="_blank" rel="noopener noreferrer">
                        <Users className="w-4 h-4 mr-2" />
                        Join Steam Community
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                    <Button className="w-full btn-hero" asChild>
                      <a href="https://discord.gg/civplayers" target="_blank" rel="noopener noreferrer">
                        Join Discord
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Anchor, 
  Menu, 
  Moon, 
  Sun, 
  Globe, 
  User, 
  LogOut,
  CalendarDays,
  LayoutDashboard
} from "lucide-react";

const Navbar = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout, isAdmin, isOwner, isStaff } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const showAdminLink = isAdmin || isOwner || isStaff;

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/yachts", label: t("nav.yachts") },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Anchor className="h-8 w-8 text-primary transition-transform group-hover:rotate-12" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SeaScape
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-foreground/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="hidden sm:flex"
            >
              <Globe className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="font-medium">
                    {profile?.name || user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bookings" className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {t("nav.bookings")}
                    </Link>
                  </DropdownMenuItem>
                  {showAdminLink && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate("/"); }} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth?mode=login">{t("nav.login")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth?mode=signup">{t("nav.signup")}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium ${
                        isActive(link.href) ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="h-px bg-border" />

                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      {language === "en" ? "العربية" : "English"}
                    </Button>
                    <Button variant="outline" size="icon" onClick={toggleTheme}>
                      {theme === "light" ? (
                        <Moon className="h-4 w-4" />
                      ) : (
                        <Sun className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="h-px bg-border" />

                  {user ? (
                    <>
                      <p className="font-medium">{profile?.name || user.email}</p>
                      <Link
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="text-muted-foreground"
                      >
                        {t("nav.profile")}
                      </Link>
                      <Link
                        to="/bookings"
                        onClick={() => setMobileOpen(false)}
                        className="text-muted-foreground"
                      >
                        {t("nav.bookings")}
                      </Link>
                      {showAdminLink && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="text-muted-foreground flex items-center gap-2"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>
                      )}
                      <Button
                        variant="destructive"
                        onClick={() => {
                          logout();
                          setMobileOpen(false);
                          navigate("/");
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("nav.logout")}
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button asChild>
                        <Link to="/auth?mode=login" onClick={() => setMobileOpen(false)}>
                          {t("nav.login")}
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/auth?mode=signup" onClick={() => setMobileOpen(false)}>
                          {t("nav.signup")}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

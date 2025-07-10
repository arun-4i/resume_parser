"use client";
import React, { useState } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LogOut, Moon, Sun } from "lucide-react";

// Helper for mobile detection (can use useIsMobile if available)
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const isMobile = useIsMobile();

  // Center logo on mobile, left on desktop
  return (
    <nav className="w-full flex items-center justify-between px-4 h-16 border-b bg-background sticky top-0 z-30">
      {/* Hamburger (mobile only) */}
      <div className="flex items-center min-w-[2.5rem]">
        {isMobile && <SidebarTrigger className="mr-2" />}
      </div>
      {/* Logo */}
      <div
        className={cn(
          "flex-1 flex items-center",
          isMobile ? "justify-center" : "justify-start"
        )}
      >
        <span className="font-bold text-xl tracking-tight select-none">4i</span>
      </div>
      {/* Avatar + Dropdown */}
      <div className="flex items-center min-w-[2.5rem] justify-end">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="/avatar.png" alt="User" />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-2">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="w-full flex items-center gap-2 justify-start"
              >
                <LogOut className="w-4 h-4" /> Log out
              </Button>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="flex items-center gap-2 text-sm">
                  {theme === "dark" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                  Dark mode
                </span>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                  aria-label="Toggle dark mode"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
};

export default Navbar;

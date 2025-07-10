"use client";
import React from "react";
import Navbar from "@/components/navbar";
import {
  SidebarProvider,
  Sidebar,
  useSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Settings,
  Calendar,
  List,
  Users,
  Database,
  BarChart2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

function SidebarMenuWithToggle() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  // Only show toggle on desktop
  return (
    <div className="flex flex-col h-full relative">
      {/* Sidebar header: centered with padding */}
      <SidebarHeader className="pl-6">
        {state === "expanded" && !isMobile && (
          <span className="font-bold text-lg tracking-tight w-full">
            Sync Application
          </span>
        )}
      </SidebarHeader>
      {/* Sidebar content: top-aligned menu groups */}
      <SidebarContent className="flex-1 flex flex-col gap-2 px-2 pt-2">
        <SidebarGroup>
          {isMobile && (
            <SidebarGroupLabel>
              <span className={state === "collapsed" ? "hidden" : "inline"}>
                Sync Application
              </span>
            </SidebarGroupLabel>
          )}

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="w-4 h-4" />
                <span className={state === "collapsed" ? "hidden" : "inline"}>
                  Setup Details
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Calendar className="w-4 h-4" />
                <span className={state === "collapsed" ? "hidden" : "inline"}>
                  Schedule Details
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <List className="w-4 h-4" />
                <span className={state === "collapsed" ? "hidden" : "inline"}>
                  Schedule Logs
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Users className="w-4 h-4" />
                <span className={state === "collapsed" ? "hidden" : "inline"}>
                  Users
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className={state === "collapsed" ? "hidden" : "inline"}>
              Data Extraction
            </span>
          </SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Database className="w-4 h-4" />
                <span className={state === "collapsed" ? "hidden" : "inline"}>
                  Sync Configurations
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BarChart2 className="w-4 h-4" />
                <span className={state === "collapsed" ? "hidden" : "inline"}>
                  Extract Status
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Briefcase className="w-4 h-4" />
                <span className={state === "collapsed" ? "hidden" : "inline"}>
                  Job Management
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      {/* Chevron toggle (desktop only) */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="absolute right-2 bottom-4 z-50 bg-background border rounded-full p-1 shadow transition-transform duration-300 hover:bg-muted"
          aria-label="Toggle sidebar"
        >
          {state === "collapsed" ? (
            <ChevronRight className="w-5 h-5 transition-transform duration-300 rotate-180" />
          ) : (
            <ChevronLeft className="w-5 h-5 transition-transform duration-300" />
          )}
        </button>
      )}
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar
          collapsible="icon"
          className="z-40 transition-all duration-300"
        >
          <SidebarMenuWithToggle />
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 min-w-0 p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

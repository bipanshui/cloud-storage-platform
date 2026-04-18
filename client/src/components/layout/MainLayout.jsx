import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

function MainLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="flex min-h-screen">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          isMobileOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
        />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-0">
          <Navbar
            onMenuClick={() => setIsMobileOpen(true)}
            onToggleSidebar={() => setIsSidebarCollapsed((current) => !current)}
            isSidebarCollapsed={isSidebarCollapsed}
          />

          <main className="flex-1 px-4 py-6 sm:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default MainLayout;


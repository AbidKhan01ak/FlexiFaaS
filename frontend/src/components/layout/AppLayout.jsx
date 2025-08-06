import { SidebarProvider } from "../ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";

export function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopHeader />
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

import {
  Home,
  Upload,
  History,
  User as UserIcon,
  LogOut,
  Users,
  FileStack,
  ListChecks,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "../ui/sidebar";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../context/AuthContext";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Upload Function", url: "/upload", icon: Upload },
  { title: "Function History", url: "/history", icon: History },
  { title: "Profile", url: "/profile", icon: UserIcon },
];

const adminNavigationItems = [
  { title: "All Users", url: "/admin/users", icon: Users },
  { title: "All Functions", url: "/admin/functions", icon: FileStack },
  { title: "Execution Logs", url: "/admin/logs", icon: ListChecks },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, isAdmin: ctxIsAdmin } = useAuth();

  const collapsed = state === "collapsed";

  // Prefer context helper if available; otherwise fallback to robust role check.
  const fallbackIsAdmin = (roles) =>
    (roles || []).some((r) => String(r).toUpperCase().includes("ADMIN"));
  const isAdmin =
    typeof ctxIsAdmin === "function"
      ? ctxIsAdmin()
      : fallbackIsAdmin(user?.roles);

  const getNavCls = ({ isActive }) =>
    isActive
      ? "bg-primary text-black font-medium shadow-md"
      : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors";

  const handleLogout = () => {
    logout(); // clear token & user
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/login");
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"}>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold">
            F
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg text-foreground">FlexiFaaS</h2>
              <p className="text-xs text-muted-foreground">
                Effortless Serverless
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin-only nav */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="mt-auto p-4">
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "default"}
            onClick={handleLogout}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

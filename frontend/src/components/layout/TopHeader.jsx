import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function TopHeader() {
  const { user } = useAuth();

  // Compute initials: Use username if available, else fallback to 'JD'
  const initials = user?.username
    ? user.username
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
    : "JD";
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-6 gap-4">
      <SidebarTrigger className="text-foreground" />

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full"></span>
        </Button>

        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary text-primary-foreground font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}

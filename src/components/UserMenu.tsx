import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Sun, Heart, BookOpen, BookHeart } from "lucide-react";
import { toast } from "sonner";

interface UserMenuProps {
  onShowDevotional?: () => void;
}

export function UserMenu({ onShowDevotional }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={() => navigate("/auth")}
        className="gap-2"
      >
        <User className="w-4 h-4" />
        Sign In
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <User className="w-4 h-4" />
          <span className="max-w-[150px] truncate">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onShowDevotional} className="gap-2 cursor-pointer">
          <Sun className="w-4 h-4" />
          Daily Devotional
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/favorites")} className="gap-2 cursor-pointer">
          <Heart className="w-4 h-4" />
          Favorites
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/history")} className="gap-2 cursor-pointer">
          <BookOpen className="w-4 h-4" />
          History
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/prayer-journal")} className="gap-2 cursor-pointer">
          <BookHeart className="w-4 h-4" />
          Prayer Journal
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive">
          <LogOut className="w-4 h-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

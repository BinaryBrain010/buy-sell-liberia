import { Button } from "@/components/ui/button";

export default function AuthButtons({
  onAuthClick,
}: {
  onAuthClick: (mode: "login" | "signup") => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onAuthClick("login")}
        className="btn-shadow"
      >
        Login
      </Button>
      <Button
        size="sm"
        onClick={() => onAuthClick("signup")}
        className="btn-shadow"
      >
        Sign Up
      </Button>
    </div>
  );
}

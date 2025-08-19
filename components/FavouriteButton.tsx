import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getLocalAuthStatus } from "@/lib/jwt";
import { toast } from "@/hooks/use-toast";
import { ProductService } from "@/app/services/Product.Service";

interface FavouriteButtonProps {
  productId: string;
  isFavourited?: boolean;
  onToggle?: (favourited: boolean) => void;
}

export function FavouriteButton({ productId, isFavourited = false, onToggle }: FavouriteButtonProps) {
  const [favourited, setFavourited] = useState(isFavourited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const auth = getLocalAuthStatus();
    if (!auth.isLoggedIn) {
      toast({
        title: "Login required",
        description: "You need to login to use this function.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await ProductService.toggleFavourite(productId, !favourited);
      setFavourited((prev) => !prev);
      onToggle?.(!favourited);
    } catch (err: any) {
      let message = "Failed to update favourite status.";
      if (err?.response?.data?.error) {
        message = err.response.data.error;
      } else if (typeof err?.message === "string") {
        message = err.message;
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      aria-label={favourited ? "Unfavourite product" : "Favourite product"}
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
      className={favourited ? "text-red-500" : "text-gray-400 hover:text-red-500"}
    >
      <Heart className="h-5 w-5" fill={favourited ? "currentColor" : "none"} />
    </Button>
  );
}

import { MessageCircle } from "lucide-react";
import BuySellLoader from "@/components/loader/BuySellLoader";

export const LoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="h-8 w-8 text-blue-500" />
      </div>
      <div className="mt-4">
        <BuySellLoader label="Loading messages..." size={64} />
      </div>
    </div>
  );
};

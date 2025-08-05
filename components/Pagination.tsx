import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  getPaginationNumbers: () => (number | string)[];
  productsLoading: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  getPaginationNumbers,
  productsLoading,
}: PaginationProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || productsLoading}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <div className="flex items-center space-x-1">
          {getPaginationNumbers().map((page, index) => (
            <Button
              key={index}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() =>
                typeof page === "number" ? onPageChange(page) : null
              }
              disabled={page === "..." || productsLoading}
              className="min-w-[40px]"
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || productsLoading}
          className="flex items-center space-x-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {totalPages > 10 && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">Go to:</span>
          <Input
            type="number"
            min="1"
            max={totalPages}
            placeholder="Page"
            className="w-20 h-8 text-center"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const page = parseInt((e.target as HTMLInputElement).value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import BumpPlansModal from "@/components/dashboard/BumpPlansModal";

interface ListingShort {
  _id: string;
  title: string;
}

interface BumpModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bumpCount: number;
  listings: ListingShort[];
  onConfirm: (listingId: string) => void;
}

export function BumpModal({
  open,
  onOpenChange,
  bumpCount,
  listings,
  onConfirm,
}: BumpModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [isPlansOpen, setIsPlansOpen] = useState(false);

  useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Use a Bump</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            You have <strong className="text-foreground">{bumpCount}</strong>{" "}
            bump{bumpCount === 1 ? "" : "s"} available.
          </div>

          {bumpCount <= 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                You don't have any bumps. Purchase a plan to get more bumps.
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={() => setIsPlansOpen(true)}>Buy Bumps</Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm font-medium mb-2">
                Select a listing to bump
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {listings.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No listings available
                  </div>
                ) : (
                  listings.map((l) => (
                    <label
                      key={l._id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted/50 ${
                        selected === l._id ? "bg-muted/50" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="bump-listing"
                        checked={selected === l._id}
                        onChange={() => setSelected(l._id)}
                        className="h-4 w-4"
                      />
                      <div className="text-sm truncate">{l.title}</div>
                    </label>
                  ))
                )}
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Want more bumps?
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPlansOpen(true)}
                  >
                    Buy more bumps
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {bumpCount > 0 && (
          <DialogFooter>
            <div className="flex w-full justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selected) {
                    onConfirm(selected);
                    onOpenChange(false);
                  }
                }}
                disabled={!selected || bumpCount <= 0}
              >
                Confirm Bump
              </Button>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
      <BumpPlansModal open={isPlansOpen} onOpenChange={setIsPlansOpen} />
    </Dialog>
  );
}

export default BumpModal;

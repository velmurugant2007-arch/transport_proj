"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  onDelete: () => Promise<void>;
  itemName?: string;
}

export function DeleteButton({ onDelete, itemName = "this item" }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (typeof window !== "undefined") {
      if (!window.confirm(`Are you sure you want to delete ${itemName}? This action cannot be undone.`)) {
        return;
      }
    }
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Failed to delete:", error);
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

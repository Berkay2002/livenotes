"use client";

import Image from "next/image";
import { useState } from "react";
import { deleteDocument } from "@/lib/actions/room.actions";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

interface DeleteModalProps {
  roomId: string;
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

export const DeleteModal = ({ roomId, buttonRef }: DeleteModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteDocumentHandler = async () => {
    setLoading(true);

    try {
      await deleteDocument(roomId);
      setOpen(false);
      
      // Reload page after deletion
      window.location.reload();
    } catch (error) {
      console.log("Error deleting document:", error);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          ref={buttonRef}
          className="rounded p-1.5 text-gray-400 hover:bg-dark-400 hover:text-white" 
          data-room-id={roomId}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-dark-200 border border-dark-400 md:max-w-md max-w-[calc(100%-32px)] p-6 rounded-lg">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="bg-red-500/10 rounded-full p-3 mb-2">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-medium text-white">Delete document</DialogTitle>
          <DialogDescription className="text-gray-400 mt-2 max-w-[280px] mx-auto">
            Are you sure you want to delete this document? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 sm:space-x-2 flex flex-col sm:flex-row gap-3 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-dark-400 text-gray-300 w-full sm:flex-1 h-11"
          >
            Cancel
          </Button>

          <Button
            variant="destructive"
            onClick={deleteDocumentHandler}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:flex-1 h-11"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
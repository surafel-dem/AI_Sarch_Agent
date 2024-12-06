'use client';

import { Dialog, DialogContent } from "../ui/dialog";
import { SignUpForm } from "./signup-form";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#0a0a0a] border-[#333] p-0">
        <SignUpForm onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
}

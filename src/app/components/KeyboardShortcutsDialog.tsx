"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate the IT Support Assistant more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <ShortcutItem
            keys={["/"]}
            description="Focus the message input"
          />
          
          <ShortcutItem
            keys={["Shift", "T"]} 
            description="View trace for the last message"
          />
          
          <ShortcutItem
            keys={["Shift", "C"]} 
            description="Clear all messages"
          />
          
          <ShortcutItem
            keys={["Shift", "H"]} 
            description="Show this help dialog"
          />
          
          <ShortcutItem
            keys={["Shift", "W"]} 
            description="Show welcome screen"
          />
          
          <ShortcutItem
            keys={["Enter"]} 
            description="Send message"
          />
          
          <ShortcutItem
            keys={["Shift", "Enter"]} 
            description="Insert new line"
          />
          
          <ShortcutItem
            keys={["Esc"]} 
            description="Close any open dialog"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ShortcutItemProps {
  keys: string[];
  description: string;
}

function ShortcutItem({ keys, description }: ShortcutItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <Kbd 
            key={index}
            className="transition-all hover:bg-primary/10 active:animate-kbd-press"
          >
            {key}
          </Kbd>
        ))}
      </div>
    </div>
  );
}
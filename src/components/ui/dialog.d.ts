import * as React from "react";

export const Dialog: React.ComponentType<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}>;
export const DialogContent: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export const DialogOverlay: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export const DialogTitle: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;
export const DialogDescription: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLParagraphElement>,
  HTMLParagraphElement
>;

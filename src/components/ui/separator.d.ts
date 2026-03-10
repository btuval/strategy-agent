import * as React from "react";

export const Separator: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical"; decorative?: boolean },
  HTMLDivElement
>;

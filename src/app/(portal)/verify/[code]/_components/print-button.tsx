"use client";

import { Printer } from "lucide-react";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border bg-muted/50 hover:bg-muted text-foreground text-xs font-semibold transition-colors"
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  );
}

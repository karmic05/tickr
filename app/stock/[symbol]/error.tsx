"use client";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-16 text-center">
      <AlertTriangle className="w-10 h-10 text-down mx-auto" />
      <h1 className="text-2xl font-bold mt-3">Couldn't load that ticker</h1>
      <p className="text-sm text-muted mt-1 max-w-md mx-auto">
        The upstream data source may be rate-limiting us. Try again in a moment or search for a different symbol.
      </p>
      <div className="flex items-center justify-center gap-2 mt-5">
        <button onClick={reset} className="btn btn-primary">Retry</button>
        <Link href="/" className="btn btn-ghost border-border">Back</Link>
      </div>
    </div>
  );
}

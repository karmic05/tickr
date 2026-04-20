import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-3xl font-bold">Ticker not found</h1>
      <p className="text-muted mt-2">Try searching for a different symbol or browse the markets.</p>
      <Link href="/" className="btn btn-primary mt-6 inline-flex">Back to markets</Link>
    </div>
  );
}

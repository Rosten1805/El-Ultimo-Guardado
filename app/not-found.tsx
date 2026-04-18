import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0d0d0d] text-white px-6">
      <p className="text-white/20 text-8xl font-bold mb-4 select-none">404</p>
      <h1 className="text-2xl font-semibold mb-2">Game not found</h1>
      <p className="text-white/50 text-sm mb-8 text-center max-w-xs">
        This game doesn&apos;t exist in our library or the URL may have changed.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-white text-black rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Back to Home
      </Link>
    </main>
  );
}

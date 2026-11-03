import { Button } from "@/components/site/ui";

export default function NotFound() {
  return (
    <main className="grid min-h-[80svh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="text-display text-[28vw] text-violet md:text-[16vw]">404</p>
        <p className="mt-2 text-xl font-semibold">Questa MiniMe si è persa.</p>
        <div className="mt-8">
          <Button href="/">Torna alla home</Button>
        </div>
      </div>
    </main>
  );
}

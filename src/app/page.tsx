import { SteamLookupExperience } from "@/components/steam-lookup-experience";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-8 sm:px-10 lg:px-12">
      <header className="reveal mb-8 border-b border-white/10 pb-8 text-center [animation-delay:80ms]">
        <h1 className="text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
          All Steam Time
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-[var(--color-muted)] sm:text-xl">
          Suma las horas de juego totales de toda tu biblioteca de Steam.
        </p>
      </header>

      <section className="reveal mt-6">
        <SteamLookupExperience />
      </section>

      <footer className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>RodrigoRmrz &copy; 2026 - Proyecto sin animo de lucro.</p>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-accent)]/75">
          perfiles publicos • demos • betas
        </p>
      </footer>
    </main>
  );
}

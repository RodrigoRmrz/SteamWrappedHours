import { SteamLookupExperience } from "@/components/steam-lookup-experience";

const closingPoints = [
  "Cuenta demos, betas y otros productos con playtime cuando Steam los expone.",
  "No pide login y funciona con perfiles y bibliotecas publicas.",
  "Convierte toda la cuenta en una cifra clara y un top facil de compartir.",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 pb-16 pt-8 sm:px-10 lg:px-12">
      <header className="reveal mb-8 border-b border-white/10 pb-8 [animation-delay:80ms]">
        <div className="flex items-center gap-4">
          <div className="float-gentle flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 font-mono text-sm text-[var(--color-accent)] shadow-[0_0_40px_rgba(4,177,216,0.18)]">
            SWH
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-[var(--color-accent)]/80">
              Steam Wrapped Hours
            </p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Una lectura mas completa de tu historial en Steam.
            </p>
          </div>
        </div>
      </header>

      <section className="reveal relative overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.03] px-6 py-10 shadow-[0_30px_120px_rgba(0,0,0,0.4)] sm:px-8 sm:py-12 lg:px-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(4,177,216,0.6)] to-transparent" />
        <div className="absolute -left-20 top-12 h-52 w-52 rounded-full bg-[rgba(7,86,242,0.14)] blur-3xl" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[rgba(4,177,216,0.1)] blur-3xl" />

        <div className="relative">
          <div className="soft-pulse inline-flex items-center gap-2 rounded-full border border-[rgba(4,177,216,0.25)] bg-[rgba(4,177,216,0.12)] px-3 py-1 font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
            steam hours, done right
          </div>

          <h1 className="reveal mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white [animation-delay:120ms] sm:text-6xl lg:text-7xl">
            Tu Steam no es solo una lista de juegos.
            <span className="mt-2 block bg-gradient-to-r from-white via-[rgba(4,177,216,0.95)] to-[rgba(7,86,242,1)] bg-clip-text text-transparent">
              Es una suma real de todo lo que has jugado.
            </span>
          </h1>

          <p className="reveal mt-6 max-w-3xl text-lg leading-8 text-[var(--color-muted)] [animation-delay:180ms] sm:text-xl">
            Pega tu perfil, SteamID64 o vanity URL y calcula el total acumulado de
            horas en tu biblioteca visible. Si Steam expone demos, betas o productos
            extra con playtime, esta app tambien los mete en la ecuacion.
          </p>

          <div className="reveal mt-8 max-w-3xl rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-6 [animation-delay:240ms]">
            <div className="space-y-3 text-sm leading-7 text-white/88 sm:text-base">
              {closingPoints.map((point) => (
                <p key={point} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                  <span>{point}</span>
                </p>
              ))}
            </div>
          </div>

          <div className="reveal mt-8 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.015))] p-5 [animation-delay:320ms] sm:p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-accent)]/80">
                  preview del resultado
                </p>
                <p className="mt-3 text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
                  2,957.6h
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted)] sm:text-base">
                  123 dias seguidos frente a Steam, con ranking, insignias y contexto visual.
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-xl">
                <div className="float-gentle rounded-2xl border border-white/10 bg-white/[0.04] p-4 [animation-delay:0ms]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]/80">
                    productos
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">169</p>
                </div>
                <div className="float-gentle rounded-2xl border border-white/10 bg-white/[0.04] p-4 [animation-delay:900ms]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]/80">
                    top title
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">776.2h</p>
                </div>
                <div className="float-gentle rounded-2xl border border-white/10 bg-white/[0.04] p-4 [animation-delay:1800ms]">
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]/80">
                    insignias
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">en vivo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal mt-8">
        <SteamLookupExperience />
      </section>

      <footer className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>Una forma mas limpia de ver el tiempo real que has dejado en Steam.</p>
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-accent)]/75">
          perfiles publicos • demos • betas
        </p>
      </footer>
    </main>
  );
}

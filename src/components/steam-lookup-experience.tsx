"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  formatDays,
  formatHours,
  formatMinutesAsHours,
  formatNumber,
} from "@/lib/format";
import type { SteamLookupResponse, SteamLookupSuccess } from "@/types/steam";

const sampleInputs = [
  "https://steamcommunity.com/id/tuusuario",
  "76561198000000000",
  "gaben",
];

type RequestState = {
  loading: boolean;
  response: SteamLookupResponse | null;
};

function MetricCard({
  eyebrow,
  value,
  detail,
}: {
  eyebrow: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="panel rounded-3xl p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]/75">
        {eyebrow}
      </p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-[var(--color-muted)]">{detail}</p>
    </div>
  );
}

function ErrorPanel({
  response,
}: {
  response: Exclude<SteamLookupResponse, SteamLookupSuccess>;
}) {
  return (
    <div className="rounded-3xl border border-rose-300/20 bg-rose-300/10 p-5 text-sm text-rose-50">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-rose-100/80">
        {response.code}
      </p>
      <p className="mt-3 text-base font-medium">{response.message}</p>
      {response.hint ? (
        <p className="mt-2 text-rose-100/80">{response.hint}</p>
      ) : null}
    </div>
  );
}

function TopGames({ games }: { games: SteamLookupSuccess["topGames"] }) {
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (games.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-5 text-sm text-[var(--color-muted)]">
        Steam no ha devuelto juegos para este perfil. Puede ser una biblioteca
        vacia o un caso de privacidad parcial.
      </div>
    );
  }

  const visibleGames = games.slice(0, visibleCount);
  const hasMoreGames = visibleCount < games.length;

  return (
    <div className="space-y-3">
      {visibleGames.map((game, index) => (
        <div
          key={game.appId}
          className="flex items-center gap-3 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-xs text-[var(--color-accent)]">
            {String(index + 1).padStart(2, "0")}
          </div>

          {game.headerImageUrl || game.logoUrl ? (
            <Image
              src={game.headerImageUrl ?? game.logoUrl!}
              alt={game.name}
              width={184}
              height={69}
              className="h-10 w-24 shrink-0 rounded-xl border border-white/10 object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-10 w-24 shrink-0 items-center rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[11px] text-[var(--color-muted)]">
              Sin portada
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-white">
                {game.name}
              </p>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--color-accent)]/80">
                {game.appType}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-[var(--color-muted)]">
              {formatNumber(game.playtimeForeverMinutes)} minutos acumulados
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-base font-semibold text-[var(--color-accent)]">
              {formatMinutesAsHours(game.playtimeForeverMinutes)}h
            </p>
            <p className="text-[11px] text-[var(--color-muted)]">
              playtime forever
            </p>
          </div>
        </div>
      ))}

      <div className="flex justify-center gap-3 pt-2">
        {hasMoreGames ? (
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white transition hover:border-[rgba(4,177,216,0.35)] hover:bg-white/[0.06]"
          >
            Ver mas
          </button>
        ) : null}

        {visibleCount > PAGE_SIZE ? (
          <button
            type="button"
            onClick={() => setVisibleCount(PAGE_SIZE)}
            className="rounded-full border border-white/10 bg-transparent px-5 py-2.5 text-sm font-medium text-[var(--color-muted)] transition hover:border-[rgba(4,177,216,0.35)] hover:text-white"
          >
            Ver menos
          </button>
        ) : null}
      </div>
    </div>
  );
}

function BadgeGrid({
  title,
  icon,
  badges,
}: {
  title: string;
  icon: string;
  badges: SteamLookupSuccess["badges"]["rarest"];
}) {
  if (badges.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="text-xl text-white/90">{icon}</span>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.02] p-5">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {badges.map((badge) => (
            <article
              key={`${title}-${badge.title}-${badge.unlockedAt}`}
              className="group rounded-[1.6rem] border border-white/6 bg-white/[0.015] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(4,177,216,0.22)] hover:bg-white/[0.03] hover:shadow-[0_16px_40px_rgba(1,12,30,0.24)]"
            >
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 group-hover:border-[rgba(4,177,216,0.24)] group-hover:bg-white/[0.05]">
                <Image
                  src={badge.imageUrl}
                  alt={badge.title}
                  fill
                  className="object-contain p-2 transition duration-300 group-hover:scale-[1.04]"
                  unoptimized
                />
              </div>

              <div className="mt-4 space-y-1 text-sm leading-7">
                <p className="text-2xl font-semibold leading-tight text-[var(--color-accent)] transition duration-300 group-hover:text-white">
                  {badge.title}
                </p>
                <p className="text-[var(--color-muted)]">
                  {badge.level ? `Level ${badge.level}, ` : ""}
                  {badge.xp ? `${formatNumber(badge.xp)} XP` : "Steam badge"}
                </p>
                {badge.unlockedAt ? <p className="text-[var(--color-muted)]">{badge.unlockedAt}</p> : null}
                {badge.metaLabel ? <p className="text-[var(--color-muted)]">{badge.metaLabel}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SteamLookupExperience() {
  const [steamInput, setSteamInput] = useState("");
  const [requestState, setRequestState] = useState<RequestState>({
    loading: false,
    response: null,
  });

  const successResponse = useMemo(() => {
    if (requestState.response?.ok) {
      return requestState.response;
    }

    return null;
  }, [requestState.response]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setRequestState({ loading: true, response: null });

    try {
      const response = await fetch("/api/steam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ steamInput }),
      });

      const payload = (await response.json()) as SteamLookupResponse;
      setRequestState({ loading: false, response: payload });
    } catch {
      setRequestState({
        loading: false,
        response: {
          ok: false,
          code: "UNKNOWN_ERROR",
          message: "No pude conectar con la API interna del proyecto.",
          hint: "Asegurate de que el servidor de Next.js sigue levantado.",
        },
      });
    }
  }

  return (
    <section className="panel-strong rounded-[2rem] p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-accent)]/80">
            calcula tu total
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
            Pega tu Steam y mira el total real.
          </h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">
        La peticion se procesa en servidor, resuelve vanity URLs cuando hace
        falta y suma el campo{" "}
        <span className="font-mono text-[var(--color-accent)]">
          playtime_forever
        </span>{" "}
        de todos los productos devueltos por Steam. Si aparece una demo, beta u
        otro extra con horas, tambien entra en el calculo.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-3 block font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]/80">
            perfil de steam
          </span>
          <input
            value={steamInput}
            onChange={(event) => setSteamInput(event.target.value)}
            className="w-full rounded-[1.4rem] border border-white/10 bg-black/25 px-5 py-4 text-base text-white outline-none transition placeholder:text-slate-400/60 focus:border-[rgba(4,177,216,0.4)] focus:bg-black/35"
            placeholder="Pega aqui tu URL de perfil, vanity URL o SteamID64"
            autoComplete="off"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {sampleInputs.map((sample) => (
            <button
              key={sample}
              type="button"
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-[var(--color-muted)] transition hover:border-[rgba(4,177,216,0.35)] hover:text-white"
              onClick={() => setSteamInput(sample)}
            >
              {sample}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={requestState.loading}
          className="inline-flex w-full items-center justify-center rounded-[1.4rem] bg-gradient-to-r from-[#032CA6] via-[#0756F2] to-[#04B2D9] px-5 py-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {requestState.loading
            ? "Consultando Steam..."
            : "Calcular total"}
        </button>
      </form>

      <div className="mt-6 rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
        {requestState.response && !requestState.response.ok ? (
          <div className="mt-5">
            <ErrorPanel response={requestState.response} />
          </div>
        ) : null}

        {successResponse ? (
          <div className="mt-5 space-y-5">
            <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/8 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={successResponse.profile.avatarUrl}
                  alt={successResponse.profile.personaName}
                  width={72}
                  height={72}
                  className="h-18 w-18 rounded-2xl border border-white/10 object-cover"
                />
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]/75">
                    perfil resuelto
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {successResponse.profile.personaName}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {successResponse.profile.steamId}
                  </p>
                </div>
              </div>

              <a
                href={successResponse.profile.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:border-[rgba(4,177,216,0.35)]"
              >
                Ver perfil
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                eyebrow="horas totales"
                value={`${formatHours(successResponse.totals.totalHours)}h`}
                detail="La suma completa de toda la biblioteca visible."
              />
              <MetricCard
                eyebrow="dias equivalentes"
                value={`${formatDays(successResponse.totals.totalDays)}d`}
                detail="Horas convertidas a dias seguidos de uso."
              />
              <MetricCard
                eyebrow="productos contados"
                value={formatNumber(successResponse.totals.productCount)}
                detail="Todo lo que Steam devuelve para ese perfil visible."
              />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-[var(--color-accent)]/75">
                    top playtime
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Los productos que mas empujan el total.
                  </p>
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Input resuelto como {successResponse.resolvedInput.kind}
                </p>
              </div>
              <TopGames
                key={successResponse.profile.steamId}
                games={successResponse.topGames}
              />
            </div>

            <div className="space-y-6">
              <BadgeGrid
                title="Insignias mas raras"
                icon="☆"
                badges={successResponse.badges.rarest}
              />
              <BadgeGrid
                title="Insignias completadas recientemente"
                icon="◔"
                badges={successResponse.badges.recent}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.02] p-6 text-sm text-[var(--color-muted)]">
            Aqui aparecera tu total de horas, su equivalencia en dias y el top
            de productos cuando envies una consulta valida.
          </div>
        )}
      </div>
    </section>
  );
}

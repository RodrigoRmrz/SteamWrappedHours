import { load } from "cheerio";
import { z } from "zod";

import type {
  ResolvedInputKind,
  SteamBadge,
  SteamBadgeGroups,
  SteamGamePlaytime,
  SteamLookupError,
  SteamLookupResponse,
  SteamLookupSuccess,
} from "@/types/steam";

const steamLookupRequestSchema = z.object({
  steamInput: z
    .string()
    .trim()
    .min(2, "Introduce un SteamID64, vanity URL o enlace de perfil valido."),
});

type ParsedSteamInput = {
  kind: ResolvedInputKind;
  value: string;
};

type SteamPlayerSummaryResponse = {
  response: {
    players: Array<{
      steamid: string;
      personaname: string;
      profileurl: string;
      avatarfull: string;
      communityvisibilitystate: number;
    }>;
  };
};

type ResolveVanityResponse = {
  response: {
    success: number;
    steamid?: string;
    message?: string;
  };
};

type OwnedGamesResponse = {
  response: {
    game_count?: number;
    games?: Array<{
      appid: number;
      name: string;
      playtime_forever: number;
      img_icon_url?: string;
      img_logo_url?: string;
    }>;
  };
};

type StoreAppDetailsResponse = Record<
  string,
  {
    success: boolean;
    data?: {
      type?: string;
      header_image?: string;
      capsule_image?: string;
    };
  }
>;

type SteamProductType = SteamGamePlaytime["appType"];
type BadgeSortMode = "completed" | "rarity";

type StoreAppMetadata = {
  type: SteamProductType;
  headerImageUrl: string | null;
};

const STORE_APPDETAILS_CONCURRENCY = 12;
const BADGE_SECTION_SIZE = 4;

function buildSteamError(
  code: SteamLookupError["code"],
  message: string,
  hint?: string,
): SteamLookupError {
  return { ok: false, code, message, hint };
}

// Steam acepta varios formatos de identificador; este parser reduce todo a un
// SteamID64 o a una vanity URL que luego podamos resolver en servidor.
export function parseSteamInput(rawInput: string): ParsedSteamInput | null {
  const input = rawInput.trim();

  if (/^\d{17}$/.test(input)) {
    return { kind: "steamId", value: input };
  }

  if (/^https?:\/\//i.test(input)) {
    try {
      const url = new URL(input);
      const host = url.hostname.toLowerCase();

      if (!host.endsWith("steamcommunity.com")) {
        return null;
      }

      const parts = url.pathname.split("/").filter(Boolean);

      if (parts[0] === "profiles" && /^\d{17}$/.test(parts[1] ?? "")) {
        return { kind: "profileUrl", value: parts[1] };
      }

      if (parts[0] === "id" && /^[a-zA-Z0-9_-]{2,64}$/.test(parts[1] ?? "")) {
        return { kind: "profileUrl", value: parts[1] };
      }
    } catch {
      return null;
    }
  }

  if (/^[a-zA-Z0-9_-]{2,64}$/.test(input)) {
    return { kind: "vanity", value: input };
  }

  return null;
}

async function fetchSteamJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Steam upstream error: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchSteamText(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Steam upstream error: ${response.status}`);
  }

  return response.text();
}

function getSteamApiKey() {
  return process.env.STEAM_API_KEY;
}

async function resolveSteamId(parsed: ParsedSteamInput, apiKey: string) {
  if (parsed.kind === "steamId" || (parsed.kind === "profileUrl" && /^\d{17}$/.test(parsed.value))) {
    return parsed.value;
  }

  const vanityUrl = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${apiKey}&vanityurl=${encodeURIComponent(parsed.value)}`;
  const vanityResponse = await fetchSteamJson<ResolveVanityResponse>(vanityUrl);

  if (vanityResponse.response.success !== 1 || !vanityResponse.response.steamid) {
    throw buildSteamError(
      "PROFILE_NOT_FOUND",
      "No se encontro ningun perfil de Steam con ese identificador.",
      "Comprueba si la URL esta bien escrita o pega el SteamID64 directamente.",
    );
  }

  return vanityResponse.response.steamid;
}

function buildGameImageUrl(appId: number, hash?: string) {
  if (!hash) {
    return null;
  }

  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
}

function normalizeSteamProductType(type?: string): SteamProductType {
  if (type === "software") {
    return "software";
  }

  // GetOwnedGames esta centrado en productos jugables. Si Store no devuelve un
  // tipo util, tratamos la app como game para evitar dejar toda la biblioteca a 0.
  return "game";
}

function buildFallbackHeaderImageUrl(appId: number) {
  return `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;
}

async function fetchStoreAppMetadata(appId: number): Promise<StoreAppMetadata> {
  const appDetailsUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=basic`;
  const response = await fetch(appDetailsUrl, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    return {
      type: "game",
      headerImageUrl: buildFallbackHeaderImageUrl(appId),
    };
  }

  const data = (await response.json()) as StoreAppDetailsResponse | null;
  const details = data?.[String(appId)];

  return {
    // Si Store no puede clasificar la app, la dejamos como unknown para no mentir,
    // pero en la UI seguimos mostrando el conteo total de productos visibles.
    type: normalizeSteamProductType(details?.data?.type),
    headerImageUrl:
      details?.data?.header_image ??
      details?.data?.capsule_image ??
      buildFallbackHeaderImageUrl(appId),
  };
}

async function getProductMetadata(appIds: number[]) {
  const metadataMap = new Map<number, StoreAppMetadata>();

  for (let index = 0; index < appIds.length; index += STORE_APPDETAILS_CONCURRENCY) {
    const batch = appIds.slice(index, index + STORE_APPDETAILS_CONCURRENCY);
    const metadataEntries = await Promise.all(
      batch.map(async (appId) => [appId, await fetchStoreAppMetadata(appId)] as const),
    );

    for (const [appId, metadata] of metadataEntries) {
      metadataMap.set(appId, metadata);
    }
  }

  return metadataMap;
}

async function getPlayerSummary(steamId: string, apiKey: string) {
  const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${steamId}`;
  const summaryResponse = await fetchSteamJson<SteamPlayerSummaryResponse>(summaryUrl);
  const player = summaryResponse.response.players[0];

  if (!player) {
    throw buildSteamError(
      "PROFILE_NOT_FOUND",
      "Steam no devolvio ningun perfil para ese identificador.",
      "Prueba con la URL completa del perfil o con un SteamID64 valido.",
    );
  }

  return player;
}

async function getOwnedGames(steamId: string, apiKey: string) {
  const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true`;
  return fetchSteamJson<OwnedGamesResponse>(ownedGamesUrl);
}

function parseBadgeLevelAndXp(detailsText: string) {
  const levelMatch = detailsText.match(/Level\s+(\d+)/i);
  const xpMatch = detailsText.match(/([\d,]+)\s*XP/i);

  return {
    level: levelMatch ? Number(levelMatch[1]) : null,
    xp: xpMatch ? Number(xpMatch[1].replaceAll(",", "")) : null,
  };
}

function cleanBadgeTitleText(rawText: string) {
  return rawText.replace(/View details/gi, "").replace(/\s+/g, " ").trim();
}

function parseBadgesFromHtml(html: string, sortMode: BadgeSortMode): SteamBadge[] {
  const $ = load(html);

  return $(".badge_row")
    .slice(0, BADGE_SECTION_SIZE)
    .toArray()
    .map((row, index) => {
      const badgeRow = $(row);
      const image = badgeRow.find(".badge_info_image img");
      const detailsText = badgeRow.find(".badge_info_description > div").eq(1).text().trim();
      const unlockedText = badgeRow.find(".badge_info_unlocked").text().replace(/\s+/g, " ").trim();
      const sourceTitle = cleanBadgeTitleText(badgeRow.find(".badge_title").text());
      const title = badgeRow.find(".badge_info_title").text().replace(/\s+/g, " ").trim();
      const { level, xp } = parseBadgeLevelAndXp(detailsText);

      return {
        title,
        sourceTitle: sourceTitle && sourceTitle !== title ? sourceTitle : null,
        imageUrl:
          image.attr("data-delayed-image") ??
          image.attr("src") ??
          "https://community.fastly.steamstatic.com/public/shared/images/trans.gif",
        level,
        xp,
        unlockedAt: unlockedText.replace(/^Unlocked\s+/i, "") || null,
        metaLabel:
          sortMode === "rarity"
            ? `Rareza #${index + 1} en Steam`
            : `Completada recientemente`,
      } satisfies SteamBadge;
    });
}

async function getBadgeGroups(steamId: string): Promise<SteamBadgeGroups> {
  try {
    const baseProfileUrl = `https://steamcommunity.com/profiles/${steamId}/badges/?l=english&p=1`;
    const [recentHtml, rarestHtml] = await Promise.all([
      fetchSteamText(baseProfileUrl),
      fetchSteamText(`${baseProfileUrl}&sort=r`),
    ]);

    return {
      recent: parseBadgesFromHtml(recentHtml, "completed"),
      rarest: parseBadgesFromHtml(rarestHtml, "rarity"),
    };
  } catch {
    return {
      recent: [],
      rarest: [],
    };
  }
}

async function mapSteamGames(
  games: NonNullable<OwnedGamesResponse["response"]["games"]>,
): Promise<SteamGamePlaytime[]> {
  const productMetadata = await getProductMetadata(games.map((game) => game.appid));

  return games
    .map((game) => ({
      appId: game.appid,
      name: game.name,
      appType: productMetadata.get(game.appid)?.type ?? "unknown",
      playtimeForeverMinutes: game.playtime_forever,
      iconUrl: buildGameImageUrl(game.appid, game.img_icon_url),
      logoUrl: buildGameImageUrl(game.appid, game.img_logo_url),
      headerImageUrl:
        productMetadata.get(game.appid)?.headerImageUrl ?? buildFallbackHeaderImageUrl(game.appid),
    }))
    .sort((left, right) => right.playtimeForeverMinutes - left.playtimeForeverMinutes);
}

function buildSuccessResponse(
  resolvedInput: ParsedSteamInput,
  steamId: string,
  profile: Awaited<ReturnType<typeof getPlayerSummary>>,
  games: SteamGamePlaytime[],
  productCount: number,
  badges: SteamBadgeGroups,
): SteamLookupSuccess {
  const totalMinutes = games.reduce(
    (minutes, game) => minutes + game.playtimeForeverMinutes,
    0,
  );
  const gameCount = games.filter((game) => game.appType === "game").length;
  const softwareCount = games.filter((game) => game.appType === "software").length;
  const unknownCount = games.filter((game) => game.appType === "unknown").length;

  return {
    ok: true,
    resolvedInput: {
      kind: resolvedInput.kind,
      value: resolvedInput.value,
    },
    profile: {
      steamId,
      personaName: profile.personaname,
      avatarUrl: profile.avatarfull,
      profileUrl: profile.profileurl,
      visibilityState: profile.communityvisibilitystate,
    },
    totals: {
      totalMinutes,
      totalHours: totalMinutes / 60,
      totalDays: totalMinutes / 60 / 24,
      productCount,
      gameCount,
      softwareCount,
      unknownCount,
    },
    topGames: games.slice(0, 20),
    badges,
  };
}

export async function lookupSteamLibraryHours(
  payload: unknown,
): Promise<SteamLookupResponse> {
  try {
    const apiKey = getSteamApiKey();

    if (!apiKey) {
      return buildSteamError(
        "MISSING_API_KEY",
        "Falta configurar STEAM_API_KEY en las variables de entorno del proyecto.",
        "Crea un .env.local con tu Steam Web API key antes de usar la app.",
      );
    }

    const parsedPayload = steamLookupRequestSchema.safeParse(payload);

    if (!parsedPayload.success) {
      return buildSteamError("BAD_INPUT", parsedPayload.error.issues[0]?.message ?? "Input invalido.");
    }

    const parsedInput = parseSteamInput(parsedPayload.data.steamInput);

    if (!parsedInput) {
      return buildSteamError(
        "BAD_INPUT",
        "No pude interpretar ese valor como perfil de Steam.",
        "Usa un SteamID64, una vanity URL o un enlace como https://steamcommunity.com/id/tuusuario.",
      );
    }

    const steamId = await resolveSteamId(parsedInput, apiKey);
    const [profile, ownedGames, badges] = await Promise.all([
      getPlayerSummary(steamId, apiKey),
      getOwnedGames(steamId, apiKey),
      getBadgeGroups(steamId),
    ]);

    const rawGames = ownedGames.response.games ?? [];
    const productCount = ownedGames.response.game_count ?? rawGames.length;

    if (ownedGames.response.game_count === undefined && rawGames.length === 0) {
      if (profile.communityvisibilitystate !== 3) {
        return buildSteamError(
          "PROFILE_PRIVATE",
          "Ese perfil no es publico o Steam no permite consultar su biblioteca.",
          "Haz publico el perfil y la biblioteca de juegos para calcular el total.",
        );
      }

      return buildSteamError(
        "LIBRARY_HIDDEN",
        "El perfil existe, pero la biblioteca no esta expuesta publicamente.",
        "En Steam debes dejar visible la lista de juegos para obtener las horas totales.",
      );
    }

    const games = await mapSteamGames(rawGames);
    return buildSuccessResponse(
      parsedInput,
      steamId,
      profile,
      games,
      productCount,
      badges,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "ok" in error &&
      (error as SteamLookupError).ok === false
    ) {
      return error as SteamLookupError;
    }

    if (error instanceof Error && error.message.startsWith("Steam upstream error:")) {
      return buildSteamError(
        "STEAM_UPSTREAM_ERROR",
        "Steam no respondio correctamente en este momento.",
        "Vuelve a intentarlo en unos segundos por si el API ha fallado temporalmente.",
      );
    }

    return buildSteamError(
      "UNKNOWN_ERROR",
      "Ha ocurrido un error inesperado calculando tus horas de Steam.",
      "Revisa la consola del servidor si estas desarrollando localmente.",
    );
  }
}

export { steamLookupRequestSchema };

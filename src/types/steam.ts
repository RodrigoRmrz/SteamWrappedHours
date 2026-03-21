export type ResolvedInputKind = "steamId" | "vanity" | "profileUrl";

export type SteamProfile = {
  steamId: string;
  personaName: string;
  avatarUrl: string;
  profileUrl: string;
  visibilityState: number;
};

export type SteamGamePlaytime = {
  appId: number;
  name: string;
  appType: "game" | "software" | "unknown";
  playtimeForeverMinutes: number;
  iconUrl: string | null;
  logoUrl: string | null;
  headerImageUrl: string | null;
};

export type SteamTotals = {
  totalMinutes: number;
  totalHours: number;
  totalDays: number;
  productCount: number;
  gameCount: number;
  softwareCount: number;
  unknownCount: number;
};

export type SteamBadge = {
  title: string;
  sourceTitle: string | null;
  imageUrl: string;
  level: number | null;
  xp: number | null;
  unlockedAt: string | null;
  metaLabel: string | null;
};

export type SteamBadgeGroups = {
  rarest: SteamBadge[];
  recent: SteamBadge[];
};

export type SteamLookupSuccess = {
  ok: true;
  resolvedInput: {
    kind: ResolvedInputKind;
    value: string;
  };
  profile: SteamProfile;
  totals: SteamTotals;
  topGames: SteamGamePlaytime[];
  badges: SteamBadgeGroups;
};

export type SteamLookupErrorCode =
  | "BAD_INPUT"
  | "MISSING_API_KEY"
  | "PROFILE_NOT_FOUND"
  | "PROFILE_PRIVATE"
  | "LIBRARY_HIDDEN"
  | "STEAM_UPSTREAM_ERROR"
  | "UNKNOWN_ERROR";

export type SteamLookupError = {
  ok: false;
  code: SteamLookupErrorCode;
  message: string;
  hint?: string;
};

export type SteamLookupResponse = SteamLookupSuccess | SteamLookupError;

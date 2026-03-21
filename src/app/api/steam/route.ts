import { NextResponse } from "next/server";

import { lookupSteamLibraryHours } from "@/lib/steam";

export const runtime = "nodejs";

// La API vive en servidor para no exponer la clave de Steam en el navegador.
export async function POST(request: Request) {
  const payload = await request.json();
  const result = await lookupSteamLibraryHours(payload);

  if (!result.ok) {
    const status = result.code === "BAD_INPUT" ? 400 : result.code === "PROFILE_NOT_FOUND" ? 404 : 200;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

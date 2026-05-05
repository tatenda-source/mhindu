import { NextResponse } from "next/server";
import { ENGINE_VERSION } from "@/lib/ipm/schemas";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ ok: true, version: ENGINE_VERSION });
}

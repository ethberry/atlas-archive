import { NextResponse, type NextRequest } from "next/server";

import { LOOK_COUNT, parseChoice } from "@/lib/archive/interceptor-parts";
import { findInterceptor } from "@/lib/archive/interceptor-search";
import { createArchiveClient } from "@/lib/db/supabase.server";

const DAY = 86_400_000;
const visits = new Map<string, number>();

// Each server instance counts on its own, so this stops a run of calls, not a
// determined scraper.
function allowed(user: string) {
  const now = Date.now();
  const last = visits.get(user);
  if (last !== undefined && now - last < DAY) {
    return false;
  }
  if (visits.size > 10_000) {
    visits.clear();
  }
  visits.set(user, now);
  return true;
}

export async function GET(request: NextRequest) {
  const supabase = await createArchiveClient();
  const session = await supabase?.auth.getUser();
  const user = session?.data.user;
  if (!user) {
    return NextResponse.json({ error: "Sign in to search." }, { status: 401 });
  }
  const choice = parseChoice(request.nextUrl.searchParams.get("parts") ?? "");
  const look = Number(request.nextUrl.searchParams.get("look") ?? NaN);
  if (!choice || !Number.isInteger(look) || look < 0 || look >= LOOK_COUNT) {
    return NextResponse.json(
      { error: "Pick the parts and a colour." },
      { status: 400 },
    );
  }
  const found = findInterceptor(choice, look);
  if (!found) {
    return NextResponse.json({ error: "No such ship." }, { status: 404 });
  }
  if (!allowed(user.id)) {
    return NextResponse.json({ error: "Too many searches." }, { status: 429 });
  }
  return NextResponse.json(
    { found },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

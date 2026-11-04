import { NextResponse, type NextRequest } from "next/server";

import { isFreighterKind, parseFreighter } from "@/lib/archive/freighter-parts";
import { findFreighter } from "@/lib/archive/freighter-search";
import { createArchiveClient } from "@/lib/db/supabase.server";

const DAY = 86_400_000;
const visits = new Map<string, number>();

// Each server instance counts on its own, so this stops a run of calls, not a
// determined scraper. Each kind has its own page and its own search a day.
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
  const params = request.nextUrl.searchParams;
  const kind = params.get("kind");
  const choice = isFreighterKind(kind)
    ? parseFreighter(kind, params.get("parts") ?? "")
    : null;
  if (!isFreighterKind(kind) || !choice) {
    return NextResponse.json({ error: "Pick the parts." }, { status: 400 });
  }
  const found = findFreighter(kind, choice);
  if (!found) {
    return NextResponse.json({ error: "No such ship." }, { status: 404 });
  }
  if (!allowed(`${kind}:${user.id}`)) {
    return NextResponse.json({ error: "Too many searches." }, { status: 429 });
  }
  return NextResponse.json(
    { found },
    {
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

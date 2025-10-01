import { NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";

import { getUsersForFallowUp } from "@/lib/db/models/users";

import { sendTemplate } from "../utils";

export async function GET() {
  const users = await getUsersForFallowUp();

  if (!users.length) {
    return NextResponse.json({ success: true });
  }

  await sendTemplate({
    to: users.map((user) => user.email),
    template: 7318139,
    data: {},
  }).catch((e: unknown) => {
    console.error(e);
    captureException(e);
  });

  return NextResponse.json({ success: true });
}

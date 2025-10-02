import { NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";

import { getUsersForFallowUp } from "@/lib/db/models/users";
import { EmailType, templateMapping } from "@/app/api/paykilla/utils";

import { sendTemplate } from "../utils";

export async function GET() {
  const users = await getUsersForFallowUp();

  if (!users.length) {
    return NextResponse.json({ success: true });
  }

  await Promise.allSettled(
    users.map((user) => {
      return sendTemplate({
        to: [user.email],
        template: templateMapping[user.language][EmailType.FOLLOW_UP],
        data: {},
      }).catch((e: unknown) => {
        console.error(e);
        captureException(e);
      });
    }),
  );

  return NextResponse.json({ success: true });
}

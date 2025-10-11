import { NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";

import { getUsersForUpsale, updateUserStage } from "@/lib/db/models/users";
import {
  EmailType,
  getEmailTemplate,
  mapSeries,
} from "@/app/api/paykilla/utils";

import { sendTemplate } from "../utils";

export async function GET() {
  const users = await getUsersForUpsale("UPSALE_1", 5);

  if (!users.length) {
    return NextResponse.json({ success: true });
  }

  await mapSeries(
    users.map((user) => {
      return () =>
        sendTemplate({
          to: [user.email],
          template: getEmailTemplate(user.language, EmailType.UPSALE_2),
          data: {},
        })
          .then(() => {
            return updateUserStage(user.id, "UPSALE_2");
          })
          .catch((e: unknown) => {
            console.error(e);
            captureException(e);
          });
    }),
  );

  return NextResponse.json({ success: true });
}

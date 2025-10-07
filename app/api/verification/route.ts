import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { verificationSchema } from "@/app/saft/validation";
import {
  createVerificationCode,
  getVerificationCodeByEmail,
} from "@/lib/db/models/verification";
import { sendTemplate } from "@/app/api/email/utils";
import { EmailType, getEmailTemplate } from "@/app/api/paykilla/utils";
import { CODE_TIMEOUT_IN_MINUTES } from "@/app/saft/constants";

export async function POST(req: Request) {
  const json = await req.json();

  try {
    const body = verificationSchema.parse(json);

    let verification = await getVerificationCodeByEmail(body.email);

    if (verification) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    verification = await createVerificationCode(body.email);

    await sendTemplate({
      data: {
        support_email: process.env.MAILJET_FROM,
        otp_ttl_minutes: CODE_TIMEOUT_IN_MINUTES,
        otp_code: verification.code,
      },
      to: [verification.email],
      template: getEmailTemplate(body.language, EmailType.EMAIL_VERIFICATION),
    });

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

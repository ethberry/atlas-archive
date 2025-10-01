import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { emailSchema } from "@/app/saft/validation";
import {
  createVerificationCode,
  getVerificationCodeByEmail,
} from "@/lib/db/models/verification";
import { sendTemplate } from "@/app/api/email/utils";

export async function POST(req: Request) {
  const json = await req.json();

  try {
    const body = emailSchema.parse(json);

    let verification = await getVerificationCodeByEmail(body.email);

    if (verification) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    verification = await createVerificationCode(body.email);

    await sendTemplate({
      data: verification,
      to: [verification.email],
      template: 7358617,
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

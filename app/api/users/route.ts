import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { captureException } from "@sentry/nextjs";
import { v4 } from "uuid";

import { createInvoice } from "@/lib/db/models/invoices";
import { createUser, getUserByEmail } from "@/lib/db/models/users";
import { validationSchema } from "@/app/saft/validation";
import { createSignature } from "@/app/api/paykilla/utils";
import { getVerificationCodeByEmail } from "@/lib/db/models/verification";
import { SAFT_PACKAGES } from "@/app/saft/constants";
import { EnabledLanguages } from "@/lib/i18n";

export async function POST(req: Request) {
  const json = await req.json();

  try {
    const body = validationSchema.parse(json);

    let user = await getUserByEmail(body.email);

    if (!user) {
      user = await createUser(body);
    }

    const verification = await getVerificationCodeByEmail(user.email);

    if (!verification || verification.code !== body.verificationCode) {
      return NextResponse.json(
        { error: "Incorrect verification code" },
        { status: 400 },
      );
    }

    const invoice = await createInvoice(user.id, body.package);

    const fractions =
      Object.entries(SAFT_PACKAGES).find(([, v]) => v === body.package)?.[0] ||
      "N/A";

    const data = {
      timestamp: Date.now(),
      account: "0x7292075804bd92bebc7f9a64e6909c223dc36749",
      payload: {
        description:
          body.language === EnabledLanguages.RU
            ? `Оплата за ${fractions} фракций яйца Фаберже`
            : `Payment for ${fractions} fractions of a Fabergé egg`,
        fiatAmount: body.package,
        fiatCurrency: "USD",
        cryptoCurrencies: [
          "USDT_TRX",
          "USDT_BSC",
          "USDT_TON",
          "USDT",
          "USDC",
          "TON",
          "BNB",
          "TRX",
          "DAI",
          "ETH",
          "BTC",
        ],
        idempotencyKey: v4(),
        externalId: invoice.id,
        returnUrl: `${process.env.BASE_URL}/thank-you`,
      },
    };

    const signature = createSignature(
      JSON.stringify(data),
      process.env.PAYKILLA_API_PRIVATE,
    );

    const response = await fetch(
      "https://api.paykilla.com/api/v1/payment-widget/single-fiat/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Key: process.env.PAYKILLA_API_PUBLIC,
          Sign: signature,
        },
        body: JSON.stringify(data),
      },
    );
    const widget = await response.json();

    return NextResponse.json(widget);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error }, { status: 400 });
    }

    console.error(error);
    captureException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

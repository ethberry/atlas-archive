import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { captureException } from "@sentry/nextjs";

import { createInvoice } from "@/lib/db/models/invoices";
import { createUser, getUserByEmail } from "@/lib/db/models/users";
import { validationSchema } from "@/app/saft/validation";
import { createSignature } from "@/app/api/paykilla/utils";

export async function POST(req: Request) {
  const json = await req.json();

  try {
    const body = validationSchema.parse(json);

    let user = await getUserByEmail(body.email);

    if (!user) {
      user = await createUser(body);
    }

    const invoice = await createInvoice(user);

    const baseUrl =
      process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL
        ? "https://fractown-ten.vercel.app"
        : "http://localhost:3000";

    // TODO updated package data
    const data = {
      timestamp: Date.now(),
      account: "0x7292075804bd92bebc7f9a64e6909c223dc36749",
      payload: {
        description: "Single Fiat Payment Widget example",
        fiatAmount: 100,
        fiatCurrency: "USD",
        cryptoCurrencies: ["BTC", "ETH", "USDT", "USDC"],
        idempotencyKey: invoice.id,
        externalId: user.id,
      },
      return_url: `${baseUrl}/thank-you`,
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

import { NextResponse } from "next/server";

import { createSignature } from "@/app/api/paykilla/utils";

export enum PaykillaEventTypes {
  INVOICE_CREATE_INVOICE = "INVOICE_CREATE_INVOICE",
  INVOICE_CREATE_UNLIMITED_INVOICE = "INVOICE_CREATE_UNLIMITED_INVOICE",
  INVOICE_FUNDS_RECEIVED_FOR_INVOICE = "INVOICE_FUNDS_RECEIVED_FOR_INVOICE",
  INVOICE_TRANSLATION_TO_ACCOUNT_COMPLETED = "INVOICE_TRANSLATION_TO_ACCOUNT_COMPLETED",
  INVOICE_PENDING_INTERVENTION = "INVOICE_PENDING_INTERVENTION",
  INVOICE_EXPIRED = "INVOICE_EXPIRED",
  INVOICE_PAID = "INVOICE_PAID",
  INVOICE_MEMPOOL_FOUND = "INVOICE_MEMPOOL_FOUND",
  INVOICE_PENDING_COMPLIANCE = "INVOICE_PENDING_COMPLIANCE",
  INVOICE_COMPLIANCE_DECLINED = "INVOICE_COMPLIANCE_DECLINED",
}

export async function POST(req: Request) {
  const text = await req.text();

  const sign = req.headers.get("Sign");
  const key = req.headers.get("Key");

  const signature = createSignature(text, process.env.PAYKILLA_WEBHOOK_PRIVATE);

  if (key !== process.env.PAYKILLA_WEBHOOK_PUBLIC) {
    return NextResponse.json(
      { error: "Public key does not match" },
      { status: 400 },
    );
  }

  if (signature !== sign) {
    return NextResponse.json(
      { error: "Signature does not match" },
      { status: 400 },
    );
  }

  const json = JSON.parse(text);

  switch (json.eventType) {
    case PaykillaEventTypes.INVOICE_CREATE_INVOICE:
      return;
    default:
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 400 },
      );
  }

  return NextResponse.json({ status: "OK" });
}

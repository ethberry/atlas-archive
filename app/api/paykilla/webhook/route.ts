import { NextResponse } from "next/server";
import { captureException } from "@sentry/nextjs";

import { createSignature } from "@/app/api/paykilla/utils";
import { PaykillaEventTypes } from "@/app/api/paykilla/interfaces";
import { generatePdf } from "@/lib/actions/pdf";
import { sendTemplate } from "@/app/api/email/utils";
import { getInvoiceById, updateInvoiceStatus } from "@/lib/db/models/invoices";

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

  try {
    switch (json.eventType) {
      case PaykillaEventTypes.INVOICE_CREATE_INVOICE: {
        const { idempotencyKey } = json.data;

        await updateInvoiceStatus(idempotencyKey, "CREATED");

        break;
      }
      case PaykillaEventTypes.INVOICE_EXPIRED: {
        const { idempotencyKey } = json.data;

        await updateInvoiceStatus(idempotencyKey, "EXPIRED");

        break;
      }
      case PaykillaEventTypes.INVOICE_PAID: {
        const { idempotencyKey } = json.data;
        await updateInvoiceStatus(idempotencyKey, "PAID");

        const invoice = await getInvoiceById(idempotencyKey);

        const pdfDoc = await generatePdf({
          firstName: invoice.user.first_name,
          lastName: invoice.user.last_name,
          email: invoice.user.email,
          address: invoice.user.address,
          consent: invoice.user.consent,
        });

        await sendTemplate({
          to: [invoice.user.email],
          template: 7318139,
          data: {},
          attachments: [
            {
              ContentType: "application/pdf",
              Filename: "saft.pdf",
              Base64Content: await pdfDoc.saveAsBase64(),
            },
          ],
        });

        break;
      }
      default:
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error(error);
    captureException(error);
  }

  return NextResponse.json({ status: "OK" });
}

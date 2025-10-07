import { NextResponse } from "next/server";

import {
  createSignature,
  EmailType,
  getEmailTemplate,
} from "@/app/api/paykilla/utils";
import { PaykillaEventTypes } from "@/app/api/paykilla/interfaces";
import { generatePdf } from "@/lib/actions/pdf";
import { sendTemplate } from "@/app/api/email/utils";
import { getInvoiceById, updateInvoiceStatus } from "@/lib/db/models/invoices";
import { EnabledLanguages } from "@/lib/i18n";
import { getSaftPublicUrl, storeSaftContract } from "@/lib/db/storage/saft";

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
    const { externalId } = json.data;
    const invoice = await getInvoiceById(externalId);

    if (!invoice) {
      return NextResponse.json(
        { status: "Internal server error" },
        { status: 500 },
      );
    }

    switch (json.eventType) {
      case PaykillaEventTypes.INVOICE_CREATE_INVOICE: {
        await updateInvoiceStatus(externalId, "CREATED");

        break;
      }
      case PaykillaEventTypes.INVOICE_EXPIRED: {
        await updateInvoiceStatus(externalId, "EXPIRED");

        break;
      }
      case PaykillaEventTypes.INVOICE_PAID: {
        await updateInvoiceStatus(externalId, "PAID");

        const pdfDoc = await generatePdf({
          firstName: invoice.user.first_name,
          lastName: invoice.user.last_name,
          email: invoice.user.email,
          address: invoice.user.address,
          consent: invoice.user.consent,
          nonUsPerson: invoice.user.non_us_person,
          language: invoice.user.language as EnabledLanguages,
          package: invoice.amount,
          verificationCode: "",
        });

        const pdfBytes = await pdfDoc.save();
        const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
          type: "application/pdf",
        });

        const { path } = await storeSaftContract(invoice.id, pdfBlob);
        const { publicUrl } = getSaftPublicUrl(path);

        await sendTemplate({
          to: [invoice.user.email],
          template: getEmailTemplate(
            invoice.user.language,
            EmailType.SAFT_CONTRACT,
          ),
          data: {
            support_email: process.env.MAILJET_FROM,
            buy_more_url: `${process.env.BASE_URL}/saft`,
            contract_url: publicUrl,
          },
          // attachments: [
          //   {
          //     ContentType: "application/pdf",
          //     Filename: "saft.pdf",
          //     Base64Content: await pdfDoc.saveAsBase64(),
          //   },
          // ],
        });

        break;
      }
      default:
        // we do not care about other events
        break;
    }
  } catch (error) {
    console.error(error);
    void error; // error is already processed
    return NextResponse.json(
      { status: "Internal server error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: "OK" });
}

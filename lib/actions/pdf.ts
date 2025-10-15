import { PDFDocument } from "pdf-lib";
import { captureException } from "@sentry/nextjs";

import { IUserData } from "@/app/saft/interfaces";

export const generatePdf = async (formData: IUserData) => {
  try {
    const existingPdfBytes = await fetch("/pdf/template.pdf").then((res) =>
      res.arrayBuffer(),
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    // Example field names in the template
    form.getTextField("date").setText(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }),
    );

    if (formData.firstName) {
      form.getTextField("name").setText(formData.firstName);
    }
    if (formData.lastName) {
      form.getTextField("surname").setText(formData.lastName);
    }
    if (formData.firstName || formData.lastName) {
      form
        .getTextField("buyer")
        .setText(`${formData.firstName || ""} ${formData.lastName || ""}`);
    }
    if (formData.email) {
      form.getTextField("email").setText(formData.email);
    }
    if (formData.address) {
      form.getTextField("address").setText(formData.address);
    }
    if (formData.package) {
      form.getTextField("amount").setText(formData.package.toString());
    }

    // makes PDF read-only
    form.flatten();

    return pdfDoc;
  } catch (error) {
    console.error(error);
    captureException(error);
    throw error;
  }
};

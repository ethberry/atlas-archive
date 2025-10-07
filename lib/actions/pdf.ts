import { PDFDocument } from "pdf-lib";
import { captureException } from "@sentry/nextjs";

import { IUserData } from "@/app/saft/interfaces";

export const generatePdf = async (formData: IUserData) => {
  try {
    const existingPdfBytes = await fetch(
      `${process.env.BASE_URL}/pdf/saft1.pdf`,
    ).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const form = pdfDoc.getForm();

    // Example field names in the template
    if (formData.firstName) {
      form.getTextField("Name").setText(formData.firstName);
    }
    if (formData.lastName) {
      form.getTextField("Surname").setText(formData.lastName);
    }
    if (formData.email) {
      form.getTextField("Email").setText(formData.email);
    }
    if (formData.address) {
      form.getTextField("Address").setText(formData.address);
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

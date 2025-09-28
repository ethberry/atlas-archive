import { PDFDocument } from "pdf-lib";

import { IUserData } from "@/app/saft/interfaces";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const generatePdf = async (formData: IUserData) => {
  const existingPdfBytes = await fetch(`${baseUrl}/pdf/saft1.pdf`).then((res) =>
    res.arrayBuffer(),
  );
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
};

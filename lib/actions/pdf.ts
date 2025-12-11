import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { captureException } from "@sentry/nextjs";

import { IUserData } from "@/app/saft/interfaces";

export const generatePdf = async (formData: IUserData) => {
  try {
    const existingPdfBytes = await fetch("/pdf/template.pdf").then((res) =>
      res.arrayBuffer(),
    );
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const fontBytes = await fetch("/fonts/Roboto-Regular.ttf").then((res) =>
      res.arrayBuffer(),
    );
    const customFont = await pdfDoc.embedFont(fontBytes);

    const form = pdfDoc.getForm();

    const setTextFieldWithFont = (fieldName: string, text: string) => {
      const field = form.getTextField(fieldName);
      field.setText(text);
      field.updateAppearances(customFont);
    };

    // Example field names in the template
    setTextFieldWithFont(
      "date",
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit",
      }),
    );

    if (formData.firstName) {
      setTextFieldWithFont("name", formData.firstName);
    }
    if (formData.lastName) {
      setTextFieldWithFont("surname", formData.lastName);
    }
    if (formData.firstName || formData.lastName) {
      setTextFieldWithFont(
        "buyer",
        `${formData.firstName || ""} ${formData.lastName || ""}`,
      );
    }
    if (formData.email) {
      setTextFieldWithFont("email", formData.email);
    }
    if (formData.address) {
      setTextFieldWithFont("address", formData.address);
    }
    if (formData.package) {
      setTextFieldWithFont("amount", formData.package.toString());
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

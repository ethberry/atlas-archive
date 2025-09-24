"use client";

import { useEffect, useState, FC } from "react";
import { PDFDocument } from "pdf-lib";

import { IEmailSubscription } from "@/app/saft/interfaces";

interface IPdfPreviewProps {
  formData: IEmailSubscription;
}

export const PdfPreview: FC<IPdfPreviewProps> = (props) => {
  const { formData } = props;
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    const generatePdf = async () => {
      const existingPdfBytes = await fetch("/pdf/template.pdf").then((res) =>
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

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
    };

    void generatePdf();
  }, [formData]);

  return (
    <iframe
      src={`${pdfUrl}#toolbar=0&navpanes=0`}
      className="w-full h-[600px]"
    />
  );
};

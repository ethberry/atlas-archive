"use client";

import { useEffect, useState, FC } from "react";

import { IUserData } from "@/app/saft/interfaces";
import { generatePdf } from "@/lib/actions/pdf";

interface IPdfPreviewProps {
  formData: IUserData;
}

export const PdfPreview: FC<IPdfPreviewProps> = (props) => {
  const { formData } = props;
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const pdfDoc = await generatePdf(formData);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
    })();
  }, [formData]);

  return (
    <iframe
      src={pdfUrl ? `${pdfUrl}#toolbar=0&navpanes=0` : "javascript:void(0)"}
      className="w-full h-[600px]"
    />
  );
};

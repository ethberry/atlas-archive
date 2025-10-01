"use client";

import { FC, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { IUserData } from "@/app/saft/interfaces";
import { generatePdf } from "@/lib/actions/pdf";

const PdfRenderer = dynamic(
  () => import("./PdfRenderer").then((mod) => mod.PdfRenderer),
  { ssr: false },
);

interface IPdfPreviewProps {
  formData: IUserData;
  onScrollToEnd?: () => void;
}

export const PdfPreview: FC<IPdfPreviewProps> = (props) => {
  const { formData, onScrollToEnd } = props;
  const [pdfUrl, setPdfUrl] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const pdfDoc = await generatePdf(formData);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(blob));
    })();
  }, [formData]);

  if (!pdfUrl) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-gray-500">Loading PDF...</div>
      </div>
    );
  }

  return <PdfRenderer fileUrl={pdfUrl} onScrollToEnd={onScrollToEnd} />;
};

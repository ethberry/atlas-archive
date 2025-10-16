"use client";

import { FC, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FormattedMessage } from "react-intl";

import { IUserData } from "@/app/saft/interfaces";
import { generatePdf } from "@/lib/actions/pdf";
import { isPdfJsSupported } from "@/app/saft/utils";

import { PdfPlaceholder } from "./PdfPlaceholder";

const PdfRenderer = dynamic(
  () =>
    isPdfJsSupported().then((isSupported) =>
      isSupported
        ? import("./PdfRenderer").then((mod) => mod.PdfRenderer)
        : import("./PdfPlaceholder").then((mod) => mod.PdfPlaceholder),
    ),
  { ssr: false },
);

interface IPdfPreviewProps {
  formData: IUserData;
  onScrollToEnd?: () => void;
  onPdfNotSupported?: () => void;
}

export const PdfPreview: FC<IPdfPreviewProps> = (props) => {
  const { formData, onScrollToEnd, onPdfNotSupported } = props;
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isPdfSupported, setIsPdfSupported] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      const isSupported = await isPdfJsSupported();
      setIsPdfSupported(isSupported);
      if (!isSupported) {
        onPdfNotSupported?.();
      }
    })();
  }, [onPdfNotSupported]);

  useEffect(() => {
    void (async () => {
      const pdfDoc = await generatePdf(formData);
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([new Uint8Array(pdfBytes)], {
        type: "application/pdf",
      });
      setPdfUrl(URL.createObjectURL(pdfBlob));
    })();
  }, [formData]);

  if (!pdfUrl) {
    return (
      <div className="w-full h-[500px] md:h-[600px] flex flex-col items-center justify-center bg-[#1A1D3F] rounded-[12px] border-2 border-[#262957] gap-4">
        <div className="w-16 h-16 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
        <div
          className="text-white text-base"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <FormattedMessage id="form.pdf.preparing" />
        </div>
        <div
          className="text-gray-400 text-sm"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <FormattedMessage id="form.pdf.pleaseWait" />
        </div>
      </div>
    );
  }

  // Если PDF.js не поддерживается, показываем placeholder
  if (isPdfSupported === false) {
    return <PdfPlaceholder fileUrl={pdfUrl} onScrollToEnd={onScrollToEnd} />;
  }

  return <PdfRenderer fileUrl={pdfUrl} onScrollToEnd={onScrollToEnd} />;
};

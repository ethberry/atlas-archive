"use client";

import { FC } from "react";
import { FormattedMessage } from "react-intl";
import Link from "next/link";

interface IPdfRendererProps {
  fileUrl: string;
  onScrollToEnd?: () => void;
}

export const PdfPlaceholder: FC<IPdfRendererProps> = () => {
  return (
    <div className="w-full md:h-[600px] overflow-y-auto border-2 border-[#262957] bg-[#1A1D3F] rounded-[12px] p-4 custom-scrollbar">
      <FormattedMessage
        id="pages.saft.pdfjs"
        values={{
          a: (chunks) => (
            <Link
              href="/pdf/template.pdf"
              className="text-[#4c5fd5] hover:text-[#4c5fd5] transition-colors"
              rel="noopener noreferrer"
              target="_blank"
            >
              {chunks}
            </Link>
          ),
        }}
      />
    </div>
  );
};

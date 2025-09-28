"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface IPdfRendererProps {
  fileUrl: string;
  onScrollToEnd?: () => void;
}

// Configure pdf.js worker from npm package
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export const PdfRenderer: FC<IPdfRendererProps> = ({
  fileUrl,
  onScrollToEnd,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState<boolean>(false);
  const [isScrollDetectionEnabled, setIsScrollDetectionEnabled] =
    useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      // Reset scroll state when document loads
      setHasScrolledToEnd(false);
      // Enable scroll detection after a short delay to ensure PDF is fully rendered
      setTimeout(() => {
        setIsScrollDetectionEnabled(true);
      }, 500);
    },
    [],
  );

  const handleScroll = useCallback(() => {
    if (
      !containerRef.current ||
      hasScrolledToEnd ||
      numPages === 0 ||
      !isScrollDetectionEnabled
    )
      return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Check if user has scrolled to the bottom (with a small threshold)
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;

    if (isAtBottom) {
      setHasScrolledToEnd(true);
      onScrollToEnd?.();
    }
  }, [numPages, hasScrolledToEnd, onScrollToEnd, isScrollDetectionEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
    return undefined;
  }, [handleScroll]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] overflow-y-auto border border-gray-300 rounded-lg"
    >
      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            className="mb-4 shadow-lg"
            width={600}
          />
        ))}
      </Document>
    </div>
  );
};

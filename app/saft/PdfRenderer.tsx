"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { FormattedMessage } from "react-intl";
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

export const PdfRenderer: FC<IPdfRendererProps> = (props) => {
  const { fileUrl, onScrollToEnd } = props;
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState<boolean>(false);
  const [isScrollDetectionEnabled, setIsScrollDetectionEnabled] =
    useState<boolean>(false);
  const [pageWidth, setPageWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate page width on mount and resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setPageWidth(Math.min(containerWidth - 40, 700));
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setHasScrolledToEnd(false);
      setTimeout(() => {
        setIsScrollDetectionEnabled(true);
        // If content is not scrollable (fits into container), consider it as scrolled to end
        const container = containerRef.current;
        if (container) {
          const { scrollHeight, clientHeight } = container;
          if (scrollHeight <= clientHeight && !hasScrolledToEnd) {
            setHasScrolledToEnd(true);
            onScrollToEnd?.();
          }
        }
      }, 500);
    },
    [hasScrolledToEnd, onScrollToEnd],
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !isScrollDetectionEnabled) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Calculate current page based on scroll position
    if (numPages > 0) {
      const pageHeight = scrollHeight / numPages;
      const newPage = Math.min(
        numPages,
        Math.floor(scrollTop / pageHeight) + 1,
      );
      setCurrentPage(newPage);
    }

    // Check if scrolled to bottom
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (isAtBottom && !hasScrolledToEnd) {
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

  const scrollToDocumentEnd = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current?.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full">
      {/* Page indicator */}
      {numPages > 0 && (
        <div
          className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-sm rounded-full"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          <FormattedMessage
            id="form.pdf.pageIndicator"
            values={{ current: currentPage, total: numPages }}
          />
        </div>
      )}

      {/* Scroll to end indicator */}
      {numPages > 0 && !hasScrolledToEnd && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-[#5865F2]/90 backdrop-blur-sm text-white text-sm rounded-full flex items-center gap-2 animate-pulse"
          style={{ fontFamily: "var(--font-family-sans)" }}
          onClick={scrollToDocumentEnd}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 3V13M8 13L12 9M8 13L4 9"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <FormattedMessage id="form.pdf.scrollToEnd" />
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full h-[500px] md:h-[600px] overflow-y-auto border-2 border-[#262957] bg-[#1A1D3F] rounded-[12px] p-4 custom-scrollbar"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center min-h-[460px] gap-4">
              <div className="w-12 h-12 border-4 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
              <p
                className="text-white text-sm"
                style={{ fontFamily: "var(--font-family-sans)" }}
              >
                <FormattedMessage id="form.pdf.loading" />
              </p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center min-h-[460px] gap-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p
                className="text-red-400 text-sm"
                style={{ fontFamily: "var(--font-family-sans)" }}
              >
                <FormattedMessage id="form.pdf.error" />
              </p>
            </div>
          }
          className="flex flex-col items-center gap-4"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="relative">
              <Page
                pageNumber={index + 1}
                width={pageWidth}
                className="shadow-lg rounded-lg overflow-hidden bg-white"
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div
                    className="flex items-center justify-center bg-gray-100"
                    style={{ width: pageWidth, height: pageWidth * 1.414 }}
                  >
                    <div className="w-8 h-8 border-3 border-[#5865F2] border-t-transparent rounded-full animate-spin" />
                  </div>
                }
              />
              {/* Page number label */}
              <div
                className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/50 text-white text-xs rounded"
                style={{ fontFamily: "var(--font-family-sans)" }}
              >
                {index + 1}
              </div>
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

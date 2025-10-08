"use client";

import { useState, useCallback, memo, useRef, useEffect } from "react";

interface IFAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = memo<IFAQItemProps>(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [height, setHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      if (isOpen) {
        setHeight(contentRef.current.scrollHeight);
      } else {
        setHeight(0);
      }
    }
  }, [isOpen]);

  return (
    <div className="relative w-full">
      <button
        onClick={toggleOpen}
        className={`w-full flex justify-between items-center text-left px-[14px] py-[8px] rounded-[12px] transition-all duration-300 ${
          isOpen
            ? "bg-[#1B1B41] border-2 border-[#262957] rounded-b-none border-b-0"
            : "bg-[#1B1B41] border-2 border-transparent hover:border-[#262957]"
        }`}
      >
        <h3
          className="text-[18px] md:text-[22px] text-white font-normal flex-1 pr-4"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          {question}
        </h3>
        <span
          className="text-white text-2xl font-light flex-shrink-0 transition-transform duration-300"
          style={{
            transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          }}
        >
          +
        </span>
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{
          maxHeight: isOpen ? `${height}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          className="px-4 py-4 text-gray-300 text-[14px] md:text-[18px] leading-relaxed bg-[#21254A] rounded-b-[12px] border-2 border-t-0 border-[#262957] mt-[-2px]"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
});

export default FAQItem;

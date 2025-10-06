"use client";

import { useState, useCallback, memo } from "react";

interface IFAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = memo<IFAQItemProps>(({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <div className="relative w-full">
      <button
        onClick={toggleOpen}
        className={`w-full flex justify-between items-center text-left px-[14px] py-[16px] rounded-[12px] transition-all duration-300 ${
          isOpen
            ? "bg-[#1B1B41] border-2 border-[#262957]"
            : "bg-[#1B1B41] border-2 border-transparent hover:border-[#262957]"
        }`}
      >
        <h3
          className="text-lg md:text-xl text-white font-normal flex-1 pr-4"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          {question}
        </h3>
        <span className="text-white text-2xl font-light flex-shrink-0">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div
          className="px-4 py-2 text-gray-300 text-base leading-relaxed bg-[#21254A] rounded-b-[12px] -mt-3 pt-4 border-2 border-t-0 border-[#262957]"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          {answer}
        </div>
      )}
    </div>
  );
});

FAQItem.displayName = "FAQItem";

export default FAQItem;

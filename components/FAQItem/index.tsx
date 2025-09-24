import { useState } from "react";

const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 shadow-md hover:bg-gray-700/50 transition-colors duration-300 w-full max-w-xl mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left focus:outline-none"
      >
        <h3 className="text-lg md:text-xl text-yellow-300 font-semibold">
          {question}
        </h3>
        <span
          className={`ml-4 text-yellow-300 text-2xl transform transition-transform duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="overflow-hidden text-gray-200 text-base leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default FAQItem;

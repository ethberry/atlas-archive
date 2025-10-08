"use client";

import { FC, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FormattedMessage, useIntl } from "react-intl";

import FAQItem from "@/components/FAQItem";

export const FAQSection: FC = memo(() => {
  const intl = useIntl();
  const router = useRouter();

  const faqData = [
    {
      questionId: "pages.landing.faq.question1",
      answerId: "pages.landing.faq.answer1",
    },
    {
      questionId: "pages.landing.faq.question2",
      answerId: "pages.landing.faq.answer2",
    },
    {
      questionId: "pages.landing.faq.question3",
      answerId: "pages.landing.faq.answer3",
    },
    {
      questionId: "pages.landing.faq.question4",
      answerId: "pages.landing.faq.answer4",
    },
    {
      questionId: "pages.landing.faq.question5",
      answerId: "pages.landing.faq.answer5",
    },
  ];

  const handleLearnMore = useCallback(() => {
    router.push("/saft");
  }, [router]);

  return (
    <section className="relative w-full py-16 md:py-24 px-4 md:px-8 bg-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h2
          className="text-[50px] text-white text-center mb-12 font-[600] text-[50px] font-serif"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.landing.faq.title" />
        </h2>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqData.map((item, index) => (
            <FAQItem
              key={index}
              question={intl.formatMessage({ id: item.questionId })}
              answer={intl.formatMessage({ id: item.answerId })}
            />
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLearnMore}
            className="px-7 py-3 text-[20px] font-normal rounded-[30px] bg-linear-to-b from-[#060F79] to-[#3F479C] border-2 border-[#33399A] hover:border-[#33399A] hover:from-transparent hover:to-transparent text-white cursor-pointer transition-colors duration-300"
            style={{ fontFamily: "var(--font-family-sans)" }}
          >
            <FormattedMessage id="form.button.learnMore" />
          </button>
        </div>
      </div>
    </section>
  );
});

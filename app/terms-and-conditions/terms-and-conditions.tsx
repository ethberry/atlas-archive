"use client";

import { FC } from "react";
import { FormattedMessage } from "react-intl";

export const TermsAndConditions: FC = () => {
  return (
    <main className="min-h-screen py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Title */}
        <h1
          className="text-3xl md:text-5xl text-white text-center mb-12 font-normal"
          style={{ fontFamily: "var(--font-family-serif)" }}
        >
          <FormattedMessage id="pages.termsAndConditions.title" />
        </h1>

        {/* Content */}
        <div
          className="space-y-6 text-white"
          style={{ fontFamily: "var(--font-family-sans)" }}
        >
          {/* Intro */}
          <p className="text-lg md:text-xl leading-relaxed">
            <FormattedMessage id="pages.termsAndConditions.intro" />
          </p>

          <p className="text-lg md:text-xl leading-relaxed">
            <FormattedMessage
              id="pages.termsAndConditions.contract"
              values={{
                br: () => (
                  <>
                    <br />
                    <br />
                  </>
                ),
              }}
            />
          </p>

          {/* General Conditions */}
          <div className="mt-8">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.generalText" />
            </p>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-8">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.termsText" />
            </p>
          </div>

          {/* Payments */}
          <div className="mt-8">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.paymentsText" />
            </p>
          </div>

          {/* Definitions */}
          <div className="mt-8">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.definitionsText" />
            </p>
          </div>

          {/* Scope */}
          <div className="mt-8">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.scopeText" />
            </p>
          </div>

          {/* Use Restrictions */}
          <div className="mt-8">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.useRestrictions" />
            </p>
          </div>

          {/* Privacy */}
          <div className="mt-8">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.privacyText" />
            </p>
          </div>

          {/* Payment Policy */}
          <div className="mt-8 mb-12">
            <p className="text-lg leading-relaxed">
              <FormattedMessage id="pages.termsAndConditions.paymentPolicyText" />
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

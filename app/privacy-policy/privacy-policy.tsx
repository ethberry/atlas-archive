"use client";

import { FC } from "react";
import { FormattedMessage } from "react-intl";

export const PrivacyPolicy: FC = () => {
  return (
    <main className="flex-row justify-center text-center max-w-[800px] mx-[30px] mobile:mx-auto space-y-8">
      <h1 className="text-white text-[24px] tablet:text-[32px] mobile:text-[26px] text-center ">
        <FormattedMessage id="PRIVACY_POLICY" />
      </h1>
      <p className="font-[900] text-justify text-[16px] tablet:text-[18px] text-white space-y-5">
        1. General Provisions
        <br />
        <br /> 1.1 The controller of your personal data is CoArt UAB, Company
        code: 305222036, contact details are available at www.coart.space.
        <br /> 1.2 We prioritize the protection and privacy of your personal
        data. This Privacy Policy informs you about the processing of personal
        data, data subject rights, personal data protection measures, and other
        relevant aspects.
        <br /> 1.3 CoArt collects personal data voluntarily submitted by
        individuals through email, registered mail, fax, telephone, or the CoArt
        website.
        <br /> 1.4 All personal data received by CoArt are collected, stored,
        and processed in compliance with the personal data protection law of the
        Republic of Lithuania, the European Union’s General Data Protection
        Regulation no. 2016/679, and other applicable laws in Lithuania
        regarding personal data protection.
        <br /> 1.5 CoArt ensures that the level of personal data protection
        complies with the requirements of Lithuanian legal acts.
        <br />
        <br /> 2. Concepts
        <br />
        <br /> 2.1. Terms used in this document:
        <br /> 2.1.1. Personal data – any information about an identified or
        identifiable natural person (data subject). An identifiable natural
        person is an individual whose identity can be determined, particularly
        by identifiers such as name, personal identification number, location
        data, internet identifier, or physical, physiological, genetic, mental,
        economic, cultural, or social identity.
        <br />
        2.1.2. Data subject – a natural person from whom CoArt receives and
        processes personal data.
        <br /> 2.1.3. Data recipient – a person to whom personal data is
        provided.
        <br /> 2.1.4. Provision of data – disclosure of personal data by
        transmission or other means of making them available (excluding
        publication in public media).
        <br /> 2.1.5. Data processing – any action performed with personal data,
        including collection, storage, recording, classification, grouping,
        connection, alteration, provision, publication, use, logical and/or
        arithmetic operations, search, dissemination, destruction, or other
        actions.
        <br /> 2.1.6. Automatic processing of data – fully or partially
        automated data processing actions.
        <br /> 2.1.7. Data controller – a legal or natural person authorized by
        the data controller to process personal data.
        <br /> 2.1.8. Data controller – a legal or natural person who determines
        the purposes and means of personal data processing.
        <br /> 2.1.9. Consent – freely given, specific, and unambiguous
        expression of the data subject&#39;s will, indicating agreement to the
        processing of personal data.
        <br /> 2.1.10. Direct marketing – activities aimed at offering goods or
        services to individuals by mail, telephone, or other direct means,
        and/or seeking their opinions on offered goods or services.
        <br /> 2.1.11. Third party – a legal or natural person, excluding the
        data subject, data controller, data processor, and individuals directly
        authorized by the data controller or data processor to process data.
        <br /> 2.1.12. Other concepts used in this Policy are defined in the Law
        on Legal Protection of Personal Data of the Republic of Lithuania and
        other applicable legal acts regarding personal data processing.
        <br />
        <br /> 3. Processing Personal Data Principles
        <br />
        <br /> 3.1. When processing personal data, CoArt follows the following
        principles: 3.1.1. Personal data is processed for the legal purposes
        defined in the Policy.
        <br /> 3.1.2. Personal data is processed accurately, fairly, and
        lawfully in compliance with legal requirements.
        <br /> 3.1.3. Personal data is kept accurate and updated when changes
        occur.
        <br /> 3.1.4. Personal data is processed to the extent necessary to
        achieve the purposes of data processing.
        <br /> 3.1.5. Personal data is stored in a form allowing identification
        for no longer than necessary for the purposes for which it was collected
        and processed.
        <br /> 3.1.6. Access to personal data is restricted to CoArt
      </p>
    </main>
  );
};

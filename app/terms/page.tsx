import type { Metadata } from "next";

import {
  LegalDocument,
  LegalSection,
  LegalText,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of service — Atlas Archive",
  alternates: { canonical: "/terms" },
  description:
    "Atlas Archive is an unofficial No Man's Sky fan site whose information is provided as is.",
};

export default function TermsPage() {
  return (
    <LegalDocument title="Terms of service" updated="3 November 2026">
      <LegalText>
        By using Atlas Archive you accept these terms. If you do not accept
        them, do not use the site.
      </LegalText>

      <LegalSection title="A fan site">
        <LegalText>
          Atlas Archive is an unofficial fan site and is not affiliated with or
          endorsed by Hello Games. No Man&apos;s Sky and its names and images
          belong to Hello Games.
        </LegalText>
      </LegalSection>

      <LegalSection title="As is">
        <LegalText>
          Everything on the site is information provided as is, with no warranty
          that it is accurate, complete, or available. To the fullest extent the
          law allows, there is no liability for anything shown on the site or
          for relying on it.
        </LegalText>
      </LegalSection>

      <LegalSection title="Use of the site">
        <LegalText>
          Do not interfere with the site, overload it, or use an account that is
          not yours.
        </LegalText>
      </LegalSection>

      <LegalSection title="Changes">
        <LegalText>
          The site and these terms may change at any time; the date above is the
          date of this version.
        </LegalText>
      </LegalSection>
    </LegalDocument>
  );
}

import type { Metadata } from "next";
import Link from "@mui/material/Link";

import {
  LegalDocument,
  LegalSection,
  LegalText,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy policy — Atlas Archive",
  description:
    "What Atlas Archive stores if you sign in with Google, mark a record, or send a bug report.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument title="Privacy policy" updated="26 October 2026">
      <LegalText>
        Atlas Archive is an informational catalogue of worlds, ships, tools, and
        creatures. The catalogue can be read without an account. This policy
        describes the information the site handles and what it is used for.
      </LegalText>

      <LegalSection title="Google sign-in">
        <LegalText>
          Sign-in is optional. If you continue with Google, Google provides your
          name, email address, and profile picture. The site uses them only to
          create the account, keep you signed in, and show the email address in
          the account menu.
        </LegalText>
        <LegalText>
          Information received from Google APIs is used in line with the{" "}
          <Link
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google API Services User Data Policy
          </Link>
          , including the Limited Use requirements. It is not sold, and it is
          not used for advertising.
        </LegalText>
      </LegalSection>

      <LegalSection title="Likes">
        <LegalText>
          If you are signed in and mark a record, the site stores that mark with
          the account. The mark updates the count on the record and can be
          removed later.
        </LegalText>
      </LegalSection>

      <LegalSection title="Session">
        <LegalText>
          After sign-in, the browser keeps a session cookie so the account stays
          signed in. The site does not run advertising cookies.
        </LegalText>
      </LegalSection>

      <LegalSection title="Errors and bug reports">
        <LegalText>
          The production site sends technical error reports to Sentry. A report
          can include the page address, browser details, and, on a sample of
          visits, a recording of how the page was used. If you send a bug
          report, the message you write is included with that technical report.
          These reports are used to fix faults.
        </LegalText>
      </LegalSection>

      <LegalSection title="Service providers">
        <LegalText>
          The site is hosted on Vercel. Accounts and catalogue records are
          stored with Supabase. Sign-in is provided by Google. Error reports are
          processed by Sentry. These providers handle the information so the
          site can run. Account information is not given to anyone else for
          their own marketing.
        </LegalText>
      </LegalSection>

      <LegalSection title="How long information is kept">
        <LegalText>
          Account details and likes remain while the account exists. Error
          reports are kept while they are useful for fixing faults, and then
          removed.
        </LegalText>
      </LegalSection>

      <LegalSection title="Children">
        <LegalText>
          The catalogue is not directed at children. The site does not knowingly
          collect personal information from children.
        </LegalText>
      </LegalSection>

      <LegalSection title="Changes">
        <LegalText>
          This policy can be updated by publishing a new version on this page.
          The date above is the date of the version you are reading.
        </LegalText>
      </LegalSection>
    </LegalDocument>
  );
}

import { getTranslations } from "next-intl/server";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
        {t("common.terms")}
      </h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p className="text-sm text-gray-400">
          Last updated: February 2026
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Kosovo Real Estate (&quot;the Platform&quot;), you
            accept and agree to be bound by these Terms of Service. If you do
            not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            2. Description of Service
          </h2>
          <p>
            Kosovo Real Estate is an online platform that connects property
            buyers, sellers, and renters in Kosovo. We provide property
            listings, search tools, and communication channels between users
            and real estate agents. We act as an intermediary and do not own
            or manage any of the listed properties.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            3. User Accounts
          </h2>
          <p>
            Certain features of the Platform may require you to provide
            personal information. You agree to provide accurate and complete
            information and to keep this information updated. You are
            responsible for maintaining the confidentiality of your contact
            information.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            4. Property Listings
          </h2>
          <p>
            Property listings are provided by agents and property owners. While
            we strive to ensure accuracy, we do not guarantee the completeness
            or accuracy of any listing information, including prices, property
            descriptions, images, or availability. Users should verify all
            property details independently before making any decisions.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            5. User Conduct
          </h2>
          <p>You agree not to:</p>
          <ul className="ml-6 mt-2 list-disc space-y-1">
            <li>
              Submit false, misleading, or fraudulent property information
            </li>
            <li>
              Use the Platform for any unlawful purpose or in violation of any
              applicable laws
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Platform
            </li>
            <li>
              Interfere with or disrupt the operation of the Platform
            </li>
            <li>
              Scrape, harvest, or collect data from the Platform without
              authorization
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            6. Property Submissions
          </h2>
          <p>
            When submitting a property for listing, you represent that you have
            the legal right to list the property or are authorized by the
            property owner. All submitted properties are subject to review and
            approval by our team. We reserve the right to reject or remove any
            listing at our sole discretion.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            7. Intellectual Property
          </h2>
          <p>
            All content on the Platform, including text, graphics, logos,
            images, and software, is the property of Kosovo Real Estate or its
            licensors and is protected by applicable intellectual property laws.
            You may not reproduce, distribute, or create derivative works
            without our express written permission.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            8. Limitation of Liability
          </h2>
          <p>
            Kosovo Real Estate is provided &quot;as is&quot; without warranties of any
            kind. We are not liable for any damages arising from your use of
            the Platform, including but not limited to direct, indirect,
            incidental, or consequential damages. We do not guarantee that the
            Platform will be uninterrupted, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            9. Modifications to Terms
          </h2>
          <p>
            We reserve the right to modify these Terms of Service at any time.
            Changes will be effective immediately upon posting on the Platform.
            Your continued use of the Platform after changes are posted
            constitutes your acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            10. Governing Law
          </h2>
          <p>
            These Terms of Service are governed by the laws of the Republic of
            Kosovo. Any disputes arising from these terms or your use of the
            Platform shall be resolved in the courts of Kosovo.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            11. Contact
          </h2>
          <p>
            For any questions regarding these Terms of Service, please contact
            us at:
          </p>
          <p className="mt-2">
            Kosovo Real Estate
            <br />
            Rr. Agim Ramadani, Nr. 15
            <br />
            10000 Prishtina, Kosovo
            <br />
            Email: info@kosovorealestate.com
            <br />
            Phone: +383 44 123 456
          </p>
        </section>
      </div>
    </div>
  );
}

import { getTranslations } from "next-intl/server";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  if (locale === "al") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("common.terms")}
        </h1>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
          <p className="text-sm text-gray-400">
            Perditesuar: Shkurt 2026
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              1. Pranimi i kushteve
            </h2>
            <p>
              Duke perdorur platformen NovaBuildings, ju pranoni keto Kushte Sherbimi.
              Nese nuk pajtoheni me to, ju lutem mos e perdorni platformen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              2. Pershkrimi i sherbimit
            </h2>
            <p>
              NovaBuildings eshte platforme online qe lidh bleres, qiramarres, pronare dhe agjente ne Maqedonine e Veriut.
              Ne ofrojme listime pronash, mjete kerkimi dhe komunikim mes paleve.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              3. Te dhenat e perdoruesit
            </h2>
            <p>
              Per funksione te caktuara mund te kerkohet informacion personal.
              Ju pranoni te jepni te dhena te sakta dhe te perditesuara.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              4. Listimet e pronave
            </h2>
            <p>
              Listimet publikohen nga agjente dhe pronare. Edhe pse synojme saktesi,
              nuk garantojme qe cdo informacion (cmim, pershkrim, foto, disponueshmeri) eshte gjithmone i plote ose i perditesuar.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              5. Sjellja e perdoruesit
            </h2>
            <p>Ju nuk lejohet te:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Publikoni informacione te rreme ose mashtruese</li>
              <li>Perdorni platformen per qellime te paligjshme</li>
              <li>Provoni qasje te paautorizuar ne sistem</li>
              <li>Pengoni funksionimin normal te platformes</li>
              <li>Mblidhni te dhena nga platforma pa autorizim</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              6. Dorzimi i pronave
            </h2>
            <p>
              Kur dergoni prone per listim, deklaroni se keni te drejte ligjore per ta listuar.
              Cdo prone i nenshtrohet shqyrtimit dhe miratimit nga ekipi yne.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              7. Pronesia intelektuale
            </h2>
            <p>
              Permbajtja e platformes (tekste, logo, imazhe, softuer) eshte prone e NovaBuildings ose e paleve licencuese
              dhe mbrohet nga ligji. Riperdorimi pa leje nuk lejohet.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              8. Kufizimi i pergjegjesise
            </h2>
            <p>
              Platforma ofrohet ne gjendjen ekzistuese, pa garanci te plote.
              NovaBuildings nuk mban pergjegjesi per deme direkte ose indirekte qe mund te vijne nga perdorimi i platformes.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              9. Ndryshimet e kushteve
            </h2>
            <p>
              Ne mund t&apos;i ndryshojme keto kushte ne cdo kohe. Ndryshimet hyjne ne fuqi sapo publikohen ne platforme.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              10. Ligji ne fuqi
            </h2>
            <p>
              Keto kushte rregullohen nga ligjet e Republikes se Maqedonise se Veriut.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-gray-900">
              11. Kontakt
            </h2>
            <p>
              Per pyetje rreth kushteve, na kontaktoni ne:
            </p>
            <p className="mt-2">
              NovaBuildings
              <br />
              Rr. Agim Ramadani, Nr. 15
              <br />
              1000 Skopje, Maqedonia e Veriut
              <br />
              Email: info@novabuildings.com
              <br />
              Phone: +389 2 123 456
            </p>
          </section>
        </div>
      </div>
    );
  }

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
            By accessing and using NovaBuildings (&quot;the Platform&quot;), you
            accept and agree to be bound by these Terms of Service. If you do
            not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">
            2. Description of Service
          </h2>
          <p>
            NovaBuildings is an online platform that connects property
            buyers, sellers, and renters in North Macedonia. We provide property
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
            images, and software, is the property of NovaBuildings or its
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
            NovaBuildings is provided &quot;as is&quot; without warranties of any
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
            North Macedonia. Any disputes arising from these terms or your use of the
            Platform shall be resolved in the courts of North Macedonia.
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
            NovaBuildings
            <br />
            Rr. Agim Ramadani, Nr. 15
            <br />
            1000 Skopje, North Macedonia
            <br />
            Email: info@novabuildings.com
            <br />
            Phone: +389 2 123 456
          </p>
        </section>
      </div>
    </div>
  );
}

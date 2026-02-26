import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Building2, Users, Shield, TrendingUp } from "lucide-react";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const copy = locale === "al"
    ? {
        missionTitle: "Misioni Yne",
        missionText:
          "Misioni yne eshte te thjeshtojme procesin e pasurive te paluajtshme ne Maqedonine e Veriut. Ne lidhim bleres, shites dhe qiramarres ne nje platforme moderne dhe te lehte per perdorim. Qofte per banesen e pare, investim apo hapesire biznesi, jemi ketu per t'ju ndihmuar te gjeni pronen e duhur.",
        whyTitle: "Pse te na zgjidhni",
        teamTitle: "Ekipi Yne",
        teamText:
          "Ekipi yne perbehet nga profesioniste te pasurive te paluajtshme, eksperte te teknologjise dhe specialiste te sherbimit ndaj klientit. Me pervoje ne tregun lokal, kuptojme nevojat e klienteve tane dhe punojme vazhdimisht per te ofruar sherbim cilesor.",
      }
    : locale === "mk"
    ? {
        missionTitle: "Nasa misija",
        missionText:
          "Nasata misija e da go pojednostavime iskustvoto so nedviznosti vo Severna Makedonija. Povezuvame kupuvaci, prodavaci i zakupci preku moderna i ednostavna platforma.",
        whyTitle: "Zosto da ne izberete",
        teamTitle: "Nas tim",
        teamText:
          "Nasiot tim e sostaven od profesionalci za nedviznosti, tehnoloski eksperti i specijalisti za poddrska na klienti.",
      }
    : locale === "de"
    ? {
        missionTitle: "Unsere Mission",
        missionText:
          "Unsere Mission ist es, das Immobilienerlebnis in Nordmazedonien zu vereinfachen. Wir verbinden Kaufer, Verkaufer und Mieter uber eine moderne, benutzerfreundliche Plattform.",
        whyTitle: "Warum wir",
        teamTitle: "Unser Team",
        teamText:
          "Unser Team besteht aus Immobilienprofis, Technologieexperten und Kundenservice-Spezialisten mit starker lokaler Marktkenntnis.",
      }
    : locale === "tr"
    ? {
        missionTitle: "Misyonumuz",
        missionText:
          "Misyonumuz Kuzey Makedonya'da emlak deneyimini kolaylastirmaktir. Alici, satici ve kiracilari modern ve kullanimi kolay bir platformda bir araya getiriyoruz.",
        whyTitle: "Neden biz",
        teamTitle: "Ekibimiz",
        teamText:
          "Ekibimiz emlak profesyonelleri, teknoloji uzmanlari ve musteri destek uzmanlarindan olusur.",
      }
    : {
        missionTitle: "Our Mission",
        missionText:
          "Our mission is to simplify the real estate experience in North Macedonia. We connect property buyers, sellers, and renters through a modern, easy-to-use platform. Whether you are looking for your first home, an investment opportunity, or a commercial space, we are here to help you find the perfect property.",
        whyTitle: "Why Choose Us",
        teamTitle: "Our Team",
        teamText:
          "Our team is composed of real estate professionals, technology experts, and customer service specialists who share a common goal: to make property transactions in North Macedonia as seamless as possible. With years of experience in the local market, we understand the unique needs of our clients and work tirelessly to exceed their expectations.",
      };

  const values = locale === "al"
    ? [
        {
          icon: Building2,
          title: "Zgjedhje e gjere",
          description:
            "Shfletoni mijera prona ne Maqedonine e Veriut, nga banesa komode deri te hapesira komerciale.",
        },
        {
          icon: Users,
          title: "Agjente profesioniste",
          description:
            "Rrjeti yne i agjenteve me pervoje ofron udhezim te personalizuar gjate gjithe procesit.",
        },
        {
          icon: Shield,
          title: "Besim dhe transparence",
          description:
            "Sigurojme qe cdo listim te jete i verifikuar dhe transaksionet te jene te qarta e te sigurta.",
        },
        {
          icon: TrendingUp,
          title: "Ekspertize tregu",
          description:
            "Qendroni te informuar me trendet me te fundit te tregut dhe vleresimet e pronave.",
        },
      ]
    : [
        {
          icon: Building2,
          title: "Wide Selection",
          description:
            "Browse thousands of properties across North Macedonia, from cozy apartments to commercial spaces.",
        },
        {
          icon: Users,
          title: "Professional Agents",
          description:
            "Our network of experienced agents provides personalized guidance throughout your journey.",
        },
        {
          icon: Shield,
          title: "Trust & Transparency",
          description:
            "We ensure every listing is verified and all transactions are transparent and secure.",
        },
        {
          icon: TrendingUp,
          title: "Market Expertise",
          description:
            "Stay informed with the latest market trends and property valuations in North Macedonia.",
        },
      ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Title */}
      <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
        {t("about.title")}
      </h1>

      {/* Description */}
      <p className="mb-10 text-lg leading-relaxed text-gray-600">
        {t("about.description")}
      </p>

      {/* Mission */}
      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">{copy.missionTitle}</h2>
        <p className="leading-relaxed text-gray-600">
          {copy.missionText}
        </p>
      </section>

      {/* Values */}
      <section className="mb-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          {copy.whyTitle}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {values.map((value) => {
            const Icon = value.icon;
            return (
              <Card key={value.title}>
                <CardContent className="flex gap-4 p-6">
                  <div className="flex-shrink-0">
                    <div className="rounded-lg bg-blue-50 p-3">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">
                      {value.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Team */}
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">{copy.teamTitle}</h2>
        <p className="leading-relaxed text-gray-600">
          {copy.teamText}
        </p>
      </section>
    </div>
  );
}

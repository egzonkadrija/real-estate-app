import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Building2, Search, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Locale } from "@/i18n/routing";

type ProcessStep = {
  title: string;
  description: string;
};

type ValueCard = {
  title: string;
  description: string;
};

type AboutCopy = {
  missionTitle: string;
  missionText: string;
  aboutSectionTitle: string;
  aboutSectionText: string;
  processTitle: string;
  processText: string;
  processSteps: ProcessStep[];
  ctaButton: string;
  whyTitle: string;
  whyPoints: string[];
};

const aboutCopyByLocale: Record<Locale, AboutCopy> = {
  mk: {
    missionTitle: "Наша мисија",
    missionText:
      "Ја поедноставуваме потрагата по недвижности со јасни информации, проверени огласи и директна комуникација со локални агенти.",
    aboutSectionTitle: "За платформата",
    aboutSectionText:
      "Создадовме брза и прегледна платформа што ве води од првото пребарување до сигурна одлука.",
    processTitle: "Како работиме",
    processText: "Три јасни чекори за полесно и побрзо да ја најдете вистинската недвижност.",
    processSteps: [
      { title: "1) Пребарај", description: "Филтрирај по цена, површина, локација и тип на имот." },
      {
        title: "2) Спореди",
        description: "Прегледај клучни детали и контактирај агент директно.",
      },
      {
        title: "3) Одлучи",
        description: "Направи сигурен следен чекор со јасни информации.",
      },
    ],
    ctaButton: "Прегледај недвижности",
    whyTitle: "Зошто ние",
    whyPoints: [
      "Брзо и прецизно пребарување",
      "Директен контакт со локални агенти",
      "Транспарентни и проверени огласи",
    ],
  },
  al: {
    missionTitle: "Misioni ynë",
    missionText:
      "Ne e thjeshtojmë kërkimin e pronave me informacione të qarta, lista të verifikuara dhe lidhje direkte me agjentë lokalë.",
    aboutSectionTitle: "Rreth platformës",
    aboutSectionText:
      "Kemi ndërtuar një përvojë të shpejtë dhe të pastër që ju çon nga kërkimi i parë deri te vendimi me siguri.",
    processTitle: "Si funksionon",
    processText: "Tre hapa të qartë për ta gjetur më lehtë pronën e duhur.",
    processSteps: [
      { title: "1) Kërko", description: "Filtroni sipas çmimit, sipërfaqes, lokacionit dhe tipit." },
      {
        title: "2) Krahaso",
        description: "Shikoni detajet kryesore dhe kontaktoni agjentin direkt.",
      },
      {
        title: "3) Vendos",
        description: "Vazhdoni me hapin e radhës me informacion të qartë.",
      },
    ],
    ctaButton: "Shiko pronat",
    whyTitle: "Pse ne",
    whyPoints: [
      "Kërkim i fokusuar dhe i shpejtë",
      "Komunikim direkt me agjentët",
      "Lista të verifikuara dhe transparente",
    ],
  },
  en: {
    missionTitle: "Our Mission",
    missionText:
      "We simplify real estate in North Macedonia through clear, fast, and transparent property workflows.",
    aboutSectionTitle: "About NovaBuildings",
    aboutSectionText:
      "A cleaner, simpler journey from discovery to decision with less friction and better clarity.",
    processTitle: "How we work",
    processText: "Three steps help you move from interest to decision quickly.",
    processSteps: [
      { title: "1) Search", description: "Filter by location, type, and budget." },
      {
        title: "2) Compare",
        description: "Review key details and connect directly with an agent.",
      },
      {
        title: "3) Proceed",
        description: "Take the next step with a transparent update path.",
      },
    ],
    ctaButton: "Browse properties",
    whyTitle: "Why choose us",
    whyPoints: [
      "Focused discovery and quick filtering",
      "Direct local support",
      "Verified listings and clear details",
    ],
  },
  de: {
    missionTitle: "Unsere Mission",
    missionText:
      "Wir vereinfachen die Immobiliensuche mit klaren Informationen, verifizierten Inseraten und direktem Kontakt zu lokalen Maklern.",
    aboutSectionTitle: "Über die Plattform",
    aboutSectionText:
      "Wir bieten einen klaren und schnellen Weg von der ersten Suche bis zur sicheren Entscheidung.",
    processTitle: "So funktioniert es",
    processText: "Drei klare Schritte, um schneller die passende Immobilie zu finden.",
    processSteps: [
      { title: "1) Suchen", description: "Filtern Sie nach Preis, Fläche, Lage und Typ." },
      {
        title: "2) Vergleichen",
        description: "Prüfen Sie die wichtigsten Details und kontaktieren Sie den Makler direkt.",
      },
      {
        title: "3) Entscheiden",
        description: "Gehen Sie mit klaren Informationen sicher zum nächsten Schritt.",
      },
    ],
    ctaButton: "Immobilien ansehen",
    whyTitle: "Warum wir",
    whyPoints: [
      "Schnelle und präzise Suche",
      "Direkte Kommunikation mit lokalen Maklern",
      "Verifizierte und transparente Inserate",
    ],
  },
  tr: {
    missionTitle: "Misyonumuz",
    missionText:
      "Gayrimenkul aramayı; net bilgiler, doğrulanmış ilanlar ve yerel danışmanlarla doğrudan iletişim ile kolaylaştırıyoruz.",
    aboutSectionTitle: "Platform hakkında",
    aboutSectionText:
      "İlk aramadan güvenli karara kadar daha hızlı ve daha anlaşılır bir deneyim sunuyoruz.",
    processTitle: "Nasıl çalışır",
    processText: "Doğru mülkü daha hızlı bulmanız için üç net adım.",
    processSteps: [
      { title: "1) Ara", description: "Fiyat, metrekare, konum ve türe göre filtreleyin." },
      {
        title: "2) Karşılaştır",
        description: "Ana detayları inceleyin ve danışmanla doğrudan iletişim kurun.",
      },
      {
        title: "3) Karar ver",
        description: "Net bilgilerle bir sonraki adıma güvenle ilerleyin.",
      },
    ],
    ctaButton: "İlanları görüntüle",
    whyTitle: "Neden biz",
    whyPoints: [
      "Hızlı ve odaklı arama",
      "Yerel danışmanlarla doğrudan iletişim",
      "Doğrulanmış ve şeffaf ilanlar",
    ],
  },
};

const valueCardsByLocale: Record<Locale, ValueCard[]> = {
  mk: [
    {
      title: "Голем избор",
      description: "Пребарувајте проверени недвижности низ цела Северна Македонија.",
    },
    {
      title: "Локални агенти",
      description: "Добијте поддршка од локални агенти во секој чекор.",
    },
    {
      title: "Транспарентност",
      description: "Јасни детали за огласите и едноставен процес на купување или наем.",
    },
  ],
  al: [
    {
      title: "Zgjedhje e gjerë",
      description: "Shfletoni prona të verifikuara në gjithë Maqedoninë e Veriut.",
    },
    {
      title: "Agjentë lokalë",
      description: "Merrni mbështetje nga agjentë lokalë në çdo hap.",
    },
    {
      title: "Transparencë",
      description: "Detaje të qarta dhe proces i thjeshtë për blerje ose qira.",
    },
  ],
  en: [
    {
      title: "Wide Selection",
      description: "Browse thousands of verified properties across North Macedonia.",
    },
    {
      title: "Local Agents",
      description: "Get direction from local agents throughout your journey.",
    },
    {
      title: "Transparency",
      description: "Clear listing details and a straightforward buying/renting path.",
    },
  ],
  de: [
    {
      title: "Große Auswahl",
      description: "Durchsuchen Sie verifizierte Immobilien in ganz Nordmazedonien.",
    },
    {
      title: "Lokale Makler",
      description: "Erhalten Sie Unterstützung von lokalen Maklern auf jedem Schritt.",
    },
    {
      title: "Transparenz",
      description: "Klare Inseratsdetails und ein einfacher Kauf- oder Mietprozess.",
    },
  ],
  tr: [
    {
      title: "Geniş Seçenek",
      description: "Kuzey Makedonya genelinde doğrulanmış ilanları inceleyin.",
    },
    {
      title: "Yerel Danışmanlar",
      description: "Her adımda yerel danışmanlardan destek alın.",
    },
    {
      title: "Şeffaflık",
      description: "Net ilan detayları ve sade bir satın alma/kiralama süreci.",
    },
  ],
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const coreCopy = aboutCopyByLocale[locale] ?? aboutCopyByLocale.en;
  const values = valueCardsByLocale[locale] ?? valueCardsByLocale.en;
  const aboutHeadingClass = "font-semibold";
  const aboutParagraphClass =
    "leading-relaxed antialiased text-[14px] text-[rgba(75,85,99,0.95)] sm:text-sm";

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-sky-50 via-sky-50/40 to-transparent" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <section className="rounded-2xl border border-sky-100 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-7">
          <p className={`text-sm font-semibold uppercase tracking-[0.16em] text-sky-700 ${aboutHeadingClass}`}>
            {t("about.title")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-gray-900 sm:text-4xl">
            {coreCopy.aboutSectionTitle}
          </h1>
          <p className={`mt-3 max-w-3xl text-base text-gray-600 ${aboutParagraphClass}`}>
            {coreCopy.aboutSectionText}
          </p>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-sky-50 p-5 shadow-sm">
          <h2 className={`mb-2 text-xl font-bold text-gray-900 ${aboutHeadingClass}`}>
            {coreCopy.missionTitle}
          </h2>
          <p className={`max-w-4xl text-sm text-gray-600 ${aboutParagraphClass}`}>
            {coreCopy.missionText}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {values.map((value, index) => (
              <Card key={value.title} className="border-sky-100 bg-white/80">
                <CardContent className="flex gap-3 p-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    {index === 0 ? (
                      <Search className="h-5 w-5 text-blue-600" />
                    ) : index === 1 ? (
                      <Building2 className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Shield className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className={`mb-1 text-sm font-semibold text-gray-900 ${aboutHeadingClass}`}>
                      {value.title}
                    </h3>
                    <p className={`text-sm text-gray-600 ${aboutParagraphClass}`}>
                      {value.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-2 flex items-center gap-3">
            <Shield className="h-6 w-6 text-sky-700" />
            <h2 className={`text-xl font-bold text-gray-900 ${aboutHeadingClass}`}>
              {coreCopy.processTitle}
            </h2>
          </div>
          <p className={`mb-4 max-w-3xl text-sm text-gray-600 ${aboutParagraphClass}`}>
            {coreCopy.processText}
          </p>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {coreCopy.processSteps.map((step) => (
              <Card key={step.title} className="border-slate-100">
                <CardHeader className="pb-1">
                  <CardTitle className={`text-base ${aboutHeadingClass}`}>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-sm text-gray-600 ${aboutParagraphClass}`}>
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mb-3 border-t border-slate-200 pt-3">
            <h3 className={`mb-2 text-base font-semibold text-gray-900 ${aboutHeadingClass}`}>
              {coreCopy.whyTitle}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {coreCopy.whyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
          <Button asChild size="sm">
            <Link href={`/${locale}`} className="inline-flex items-center">
              {coreCopy.ctaButton}
              <Search className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}

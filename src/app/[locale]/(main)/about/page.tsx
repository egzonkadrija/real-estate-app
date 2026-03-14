import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Building2,
  Compass,
  Search,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
      "We make real estate in North Macedonia clear, fast, and transparent.",
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
  const valueIcons = [Search, Building2, Shield] as const;

  return (
    <div className="bg-gray-50">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 sm:py-12">
        <section className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm">
          <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
            <div className="flex flex-col gap-8">
              <div className="space-y-8">
                <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
                  <Compass className="h-3.5 w-3.5" />
                  {t("about.title")}
                </div>
                <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl">
                  {coreCopy.aboutSectionTitle}
                </h1>
                <p className={`mt-4 max-w-2xl text-base text-slate-600 sm:text-lg ${aboutParagraphClass}`}>
                  {coreCopy.aboutSectionText}
                </p>
                </div>

                <div className="max-w-2xl rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-700">
                    {coreCopy.whyTitle}
                  </p>
                  <h2 className={`mt-3 text-2xl font-semibold text-slate-950 ${aboutHeadingClass}`}>
                    {coreCopy.processTitle}
                  </h2>
                  <p className={`mt-3 text-sm text-slate-600 ${aboutParagraphClass}`}>
                    {coreCopy.processText}
                  </p>

                  <div className="mt-5 space-y-3">
                    {coreCopy.whyPoints.map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="bg-slate-950 text-white hover:bg-slate-800">
                  <Link href={`/${locale}`} className="inline-flex items-center">
                    {coreCopy.ctaButton}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-gray-200 bg-gray-900 p-6 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
                  {coreCopy.missionTitle}
                </p>
                <p className="mt-4 text-xl font-semibold leading-snug sm:text-2xl">
                  {coreCopy.missionText}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {values.map((value, index) => {
                  const Icon = valueIcons[index] ?? Shield;

                  return (
                    <div
                      key={value.title}
                      className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-200">
                          <Icon className="h-5 w-5 text-gray-700" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold text-slate-950 ${aboutHeadingClass}`}>
                            {value.title}
                          </p>
                          <p className={`mt-1 text-sm text-slate-600 ${aboutParagraphClass}`}>
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 sm:px-8 lg:px-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gray-100 p-3 text-gray-700">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className={`text-2xl font-semibold text-slate-950 ${aboutHeadingClass}`}>
                {coreCopy.missionTitle}
              </h2>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {coreCopy.processSteps.map((step, index) => (
                <div key={step.title} className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    {index + 1}
                  </p>
                  <h3 className={`text-base font-semibold text-slate-950 ${aboutHeadingClass}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm text-slate-600 ${aboutParagraphClass}`}>
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-gray-200 bg-white p-6 text-slate-950 shadow-sm sm:p-8 lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
                NovaBuildings
              </p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                {coreCopy.missionText}
              </h2>
            </div>
            <Button asChild size="lg" className="bg-slate-950 text-white hover:bg-slate-800">
              <Link href={`/${locale}`} className="inline-flex items-center">
                {coreCopy.ctaButton}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

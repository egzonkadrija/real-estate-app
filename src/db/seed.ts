import { db } from './index';
import * as schema from './schema';
import bcrypt from 'bcryptjs';

// ──────────────────────────────────────────────
// Helper: slugify
// ──────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ──────────────────────────────────────────────
// Seed data
// ──────────────────────────────────────────────

async function seed() {
  console.log('Seeding database...');

  // ── 1. Locations ──────────────────────────────

  // States (regions / municipalities) of Kosovo
  const statesData: schema.NewLocation[] = [
    { type: 'state', name_al: 'Prishtinë', name_en: 'Pristina', name_de: 'Pristina', slug: 'prishtine' },
    { type: 'state', name_al: 'Prizren', name_en: 'Prizren', name_de: 'Prizren', slug: 'prizren' },
    { type: 'state', name_al: 'Pejë', name_en: 'Peja', name_de: 'Peja', slug: 'peje' },
    { type: 'state', name_al: 'Mitrovicë', name_en: 'Mitrovica', name_de: 'Mitrovica', slug: 'mitrovice' },
    { type: 'state', name_al: 'Gjilan', name_en: 'Gjilan', name_de: 'Gjilan', slug: 'gjilan' },
    { type: 'state', name_al: 'Ferizaj', name_en: 'Ferizaj', name_de: 'Ferizaj', slug: 'ferizaj' },
    { type: 'state', name_al: 'Gjakovë', name_en: 'Gjakova', name_de: 'Gjakova', slug: 'gjakove' },
  ];

  const insertedStates = await db
    .insert(schema.locations)
    .values(statesData)
    .returning();

  console.log(`  Inserted ${insertedStates.length} states`);

  // Build a map for quick lookup: slug -> id
  const stateMap = new Map<string, number>();
  for (const s of insertedStates) {
    stateMap.set(s.slug, s.id);
  }

  // Cities under each state
  const citiesData: schema.NewLocation[] = [
    // Prishtinë cities
    { type: 'city', name_al: 'Prishtinë', name_en: 'Pristina', name_de: 'Pristina', parent_id: stateMap.get('prishtine')!, slug: 'prishtine-qytet' },
    { type: 'city', name_al: 'Fushë Kosovë', name_en: 'Fushe Kosova', name_de: 'Fushe Kosova', parent_id: stateMap.get('prishtine')!, slug: 'fushe-kosove' },
    { type: 'city', name_al: 'Obiliq', name_en: 'Obiliq', name_de: 'Obiliq', parent_id: stateMap.get('prishtine')!, slug: 'obiliq' },
    { type: 'city', name_al: 'Lipjan', name_en: 'Lipjan', name_de: 'Lipjan', parent_id: stateMap.get('prishtine')!, slug: 'lipjan' },
    { type: 'city', name_al: 'Podujevë', name_en: 'Podujeva', name_de: 'Podujeva', parent_id: stateMap.get('prishtine')!, slug: 'podujeve' },
    { type: 'city', name_al: 'Drenas', name_en: 'Drenas', name_de: 'Drenas', parent_id: stateMap.get('prishtine')!, slug: 'drenas' },

    // Prizren cities
    { type: 'city', name_al: 'Prizren', name_en: 'Prizren', name_de: 'Prizren', parent_id: stateMap.get('prizren')!, slug: 'prizren-qytet' },
    { type: 'city', name_al: 'Suharekë', name_en: 'Suhareka', name_de: 'Suhareka', parent_id: stateMap.get('prizren')!, slug: 'suhareke' },
    { type: 'city', name_al: 'Dragash', name_en: 'Dragash', name_de: 'Dragash', parent_id: stateMap.get('prizren')!, slug: 'dragash' },

    // Pejë cities
    { type: 'city', name_al: 'Pejë', name_en: 'Peja', name_de: 'Peja', parent_id: stateMap.get('peje')!, slug: 'peje-qytet' },
    { type: 'city', name_al: 'Deçan', name_en: 'Decan', name_de: 'Decan', parent_id: stateMap.get('peje')!, slug: 'decan' },
    { type: 'city', name_al: 'Istog', name_en: 'Istog', name_de: 'Istog', parent_id: stateMap.get('peje')!, slug: 'istog' },

    // Mitrovicë cities
    { type: 'city', name_al: 'Mitrovicë', name_en: 'Mitrovica', name_de: 'Mitrovica', parent_id: stateMap.get('mitrovice')!, slug: 'mitrovice-qytet' },
    { type: 'city', name_al: 'Skenderaj', name_en: 'Skenderaj', name_de: 'Skenderaj', parent_id: stateMap.get('mitrovice')!, slug: 'skenderaj' },
    { type: 'city', name_al: 'Vushtrri', name_en: 'Vushtrri', name_de: 'Vushtrri', parent_id: stateMap.get('mitrovice')!, slug: 'vushtrri' },

    // Gjilan cities
    { type: 'city', name_al: 'Gjilan', name_en: 'Gjilan', name_de: 'Gjilan', parent_id: stateMap.get('gjilan')!, slug: 'gjilan-qytet' },
    { type: 'city', name_al: 'Kamenicë', name_en: 'Kamenica', name_de: 'Kamenica', parent_id: stateMap.get('gjilan')!, slug: 'kamenice' },
    { type: 'city', name_al: 'Viti', name_en: 'Viti', name_de: 'Viti', parent_id: stateMap.get('gjilan')!, slug: 'viti' },

    // Ferizaj cities
    { type: 'city', name_al: 'Ferizaj', name_en: 'Ferizaj', name_de: 'Ferizaj', parent_id: stateMap.get('ferizaj')!, slug: 'ferizaj-qytet' },
    { type: 'city', name_al: 'Kaçanik', name_en: 'Kacanik', name_de: 'Kacanik', parent_id: stateMap.get('ferizaj')!, slug: 'kacanik' },
    { type: 'city', name_al: 'Shtërpcë', name_en: 'Shterpce', name_de: 'Shterpce', parent_id: stateMap.get('ferizaj')!, slug: 'shterpce' },

    // Gjakovë cities
    { type: 'city', name_al: 'Gjakovë', name_en: 'Gjakova', name_de: 'Gjakova', parent_id: stateMap.get('gjakove')!, slug: 'gjakove-qytet' },
    { type: 'city', name_al: 'Rahovec', name_en: 'Rahovec', name_de: 'Rahovec', parent_id: stateMap.get('gjakove')!, slug: 'rahovec' },
    { type: 'city', name_al: 'Malishevë', name_en: 'Malisheva', name_de: 'Malisheva', parent_id: stateMap.get('gjakove')!, slug: 'malisheve' },
  ];

  const insertedCities = await db
    .insert(schema.locations)
    .values(citiesData)
    .returning();

  console.log(`  Inserted ${insertedCities.length} cities`);

  // Build a city map for property seeding
  const cityMap = new Map<string, number>();
  for (const c of insertedCities) {
    cityMap.set(c.slug, c.id);
  }

  // ── 2. Agents ─────────────────────────────────

  const agentsData: schema.NewAgent[] = [
    {
      name: 'Arben Krasniqi',
      email: 'arben@realestate.com',
      phone: '+383 44 123 456',
      avatar: '/uploads/agents/arben.jpg',
      bio_al: 'Agjent me pervoje 10 vjecare ne tregun e patundshmërive në Kosovë. Specializuar në prona rezidenciale dhe komerciale në Prishtinë.',
      bio_en: 'Agent with 10 years of experience in the Kosovo real estate market. Specialized in residential and commercial properties in Pristina.',
      bio_de: 'Makler mit 10 Jahren Erfahrung auf dem kosovarischen Immobilienmarkt. Spezialisiert auf Wohn- und Gewerbeimmobilien in Pristina.',
    },
    {
      name: 'Blerta Hoxha',
      email: 'blerta@realestate.com',
      phone: '+383 44 234 567',
      avatar: '/uploads/agents/blerta.jpg',
      bio_al: 'Eksperte e patundshmërive me fokus në apartamente moderne dhe prona luksoze. Njohëse e thellë e tregut në Prizren dhe Prishtinë.',
      bio_en: 'Real estate expert focused on modern apartments and luxury properties. Deep knowledge of the Prizren and Pristina markets.',
      bio_de: 'Immobilienexpertin mit Fokus auf moderne Apartments und Luxusimmobilien. Tiefgehende Marktkenntnis in Prizren und Pristina.',
    },
    {
      name: 'Driton Berisha',
      email: 'driton@realestate.com',
      phone: '+383 44 345 678',
      avatar: '/uploads/agents/driton.jpg',
      bio_al: 'Konsulent për prona komerciale dhe tokë. Përvojë e gjerë me investitorë vendorë dhe ndërkombëtarë.',
      bio_en: 'Consultant for commercial properties and land. Extensive experience with local and international investors.',
      bio_de: 'Berater fuer Gewerbeimmobilien und Grundstuecke. Umfangreiche Erfahrung mit lokalen und internationalen Investoren.',
    },
  ];

  const insertedAgents = await db
    .insert(schema.agents)
    .values(agentsData)
    .returning();

  console.log(`  Inserted ${insertedAgents.length} agents`);

  // ── 3. Properties ─────────────────────────────

  const propertiesData: schema.NewProperty[] = [
    // 1 - Apartment for sale in Pristina
    {
      title_al: 'Banesë moderne 3-dhomëshe në qendër të Prishtinës',
      title_en: 'Modern 3-bedroom apartment in Pristina center',
      title_de: 'Moderne 3-Zimmer-Wohnung im Zentrum von Pristina',
      description_al: 'Banesë e re me 3 dhoma gjumi, 2 banjo, ballkon dhe parkim nëntokësor. Ndërtesë e re me ashensor, ndodhet pranë Sheshit Nënë Tereza.',
      description_en: 'New apartment with 3 bedrooms, 2 bathrooms, balcony and underground parking. New building with elevator, located near Mother Teresa Square.',
      description_de: 'Neue Wohnung mit 3 Schlafzimmern, 2 Badern, Balkon und Tiefgarage. Neubau mit Aufzug, in der Nahe des Mutter-Teresa-Platzes.',
      type: 'sale',
      category: 'apartment',
      price: 120000,
      currency: 'EUR',
      surface_area: 95,
      rooms: 3,
      bathrooms: 2,
      floor: 5,
      year_built: 2024,
      latitude: 42.6629,
      longitude: 21.1655,
      location_id: cityMap.get('prishtine-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: true,
      status: 'active',
      amenities: ['parking', 'elevator', 'balcony', 'central_heating'],
    },
    // 2 - House for sale in Prizren
    {
      title_al: 'Shtëpi e re me oborr në Prizren',
      title_en: 'New house with yard in Prizren',
      title_de: 'Neues Haus mit Garten in Prizren',
      description_al: 'Shtëpi 2-katëshe me 5 dhoma gjumi, garazhë për 2 vetura, oborr i madh dhe pamje nga Kalaja e Prizrenit.',
      description_en: 'Two-story house with 5 bedrooms, garage for 2 cars, large yard, and views of Prizren Fortress.',
      description_de: 'Zweistoeckiges Haus mit 5 Schlafzimmern, Garage fuer 2 Autos, grossem Garten und Blick auf die Festung von Prizren.',
      type: 'sale',
      category: 'house',
      price: 185000,
      currency: 'EUR',
      surface_area: 220,
      rooms: 5,
      bathrooms: 3,
      floor: null,
      year_built: 2023,
      latitude: 42.2139,
      longitude: 20.7414,
      location_id: cityMap.get('prizren-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: true,
      status: 'active',
      amenities: ['garage', 'garden', 'central_heating', 'air_conditioning'],
    },
    // 3 - Office for rent in Pristina
    {
      title_al: 'Zyrë moderne në lagjen Pejton, Prishtinë',
      title_en: 'Modern office in Pejton neighborhood, Pristina',
      title_de: 'Modernes Buero im Stadtteil Pejton, Pristina',
      description_al: 'Hapësirë zyrash me pamje panoramike, 2 salla mbledhjesh, kuzhinë, kushte të shkëlqyera pune.',
      description_en: 'Office space with panoramic views, 2 meeting rooms, kitchen, excellent working conditions.',
      description_de: 'Bueroflaeche mit Panoramablick, 2 Besprechungsraeume, Kueche, hervorragende Arbeitsbedingungen.',
      type: 'rent',
      category: 'office',
      price: 1500,
      currency: 'EUR',
      surface_area: 150,
      rooms: 4,
      bathrooms: 2,
      floor: 8,
      year_built: 2022,
      latitude: 42.6583,
      longitude: 21.1544,
      location_id: cityMap.get('prishtine-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: false,
      status: 'active',
      amenities: ['elevator', 'air_conditioning', 'parking', 'internet'],
    },
    // 4 - Land for sale in Lipjan
    {
      title_al: 'Tokë ndërtimore 10 ari në Lipjan',
      title_en: '10 are building land in Lipjan',
      title_de: '10 Ar Bauland in Lipjan',
      description_al: 'Tokë ndërtimore me leje ndërtimi, rrugë e asfaltuar, ujë dhe rrymë. Afër autostradës Prishtinë-Shkup.',
      description_en: 'Building land with construction permit, paved road, water, and electricity. Near the Pristina-Skopje highway.',
      description_de: 'Bauland mit Baugenehmigung, asphaltierter Strasse, Wasser und Strom. Nahe der Autobahn Pristina-Skopje.',
      type: 'sale',
      category: 'land',
      price: 45000,
      currency: 'EUR',
      surface_area: 1000,
      rooms: null,
      bathrooms: null,
      floor: null,
      year_built: null,
      latitude: 42.5308,
      longitude: 21.1231,
      location_id: cityMap.get('lipjan')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['water', 'electricity', 'paved_road'],
    },
    // 5 - Apartment for rent in Gjilan
    {
      title_al: 'Banesë me qira 2-dhomëshe në Gjilan',
      title_en: '2-bedroom apartment for rent in Gjilan',
      title_de: '2-Zimmer-Wohnung zur Miete in Gjilan',
      description_al: 'Banesë e mobiluar plotësisht me 2 dhoma gjumi, kuzhinë moderne, internet dhe ngrohje qendrore.',
      description_en: 'Fully furnished apartment with 2 bedrooms, modern kitchen, internet and central heating.',
      description_de: 'Vollmoeblierte Wohnung mit 2 Schlafzimmern, moderner Kueche, Internet und Zentralheizung.',
      type: 'rent',
      category: 'apartment',
      price: 350,
      currency: 'EUR',
      surface_area: 70,
      rooms: 2,
      bathrooms: 1,
      floor: 3,
      year_built: 2020,
      latitude: 42.4635,
      longitude: 21.4694,
      location_id: cityMap.get('gjilan-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: false,
      status: 'active',
      amenities: ['furnished', 'internet', 'central_heating', 'elevator'],
    },
    // 6 - Store for rent in Ferizaj
    {
      title_al: 'Dyqan 80m² në qendër të Ferizajt',
      title_en: '80m² store in Ferizaj center',
      title_de: '80m² Geschaeft im Zentrum von Ferizaj',
      description_al: 'Dyqan në rrugën kryesore tregtare, vitrinë e madhe, i përshtatshëm për çdo lloj biznesi.',
      description_en: 'Store on the main commercial street, large storefront, suitable for any type of business.',
      description_de: 'Geschaeft an der Haupteinkaufsstrasse, grosse Schaufensterfront, geeignet fuer jede Art von Geschaeft.',
      type: 'rent',
      category: 'store',
      price: 800,
      currency: 'EUR',
      surface_area: 80,
      rooms: 1,
      bathrooms: 1,
      floor: 0,
      year_built: 2018,
      latitude: 42.3702,
      longitude: 21.1553,
      location_id: cityMap.get('ferizaj-qytet')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['storefront', 'air_conditioning', 'security'],
    },
    // 7 - Warehouse for sale in Fushe Kosove
    {
      title_al: 'Depo industriale 500m² në Fushë Kosovë',
      title_en: '500m² industrial warehouse in Fushe Kosova',
      title_de: '500m² Industrielager in Fushe Kosova',
      description_al: 'Depo e madhe pranë stacionit të trenit, qasje e lehtë për kamionë, dysheme betoni, lartësi 6m.',
      description_en: 'Large warehouse near the train station, easy truck access, concrete floor, 6m height.',
      description_de: 'Grosses Lager in der Naehe des Bahnhofs, leichter LKW-Zugang, Betonboden, 6m Hoehe.',
      type: 'sale',
      category: 'warehouse',
      price: 95000,
      currency: 'EUR',
      surface_area: 500,
      rooms: null,
      bathrooms: 1,
      floor: 0,
      year_built: 2015,
      latitude: 42.6350,
      longitude: 21.0975,
      location_id: cityMap.get('fushe-kosove')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['truck_access', 'electricity', 'water', 'security'],
    },
    // 8 - Luxury apartment in Pristina
    {
      title_al: 'Apartament luksoz 4-dhomësh me pamje nga qyteti',
      title_en: 'Luxury 4-bedroom apartment with city views',
      title_de: 'Luxurioese 4-Zimmer-Wohnung mit Stadtblick',
      description_al: 'Apartament premium në katin e 12-të me pamje panoramike, materiale cilësore, sistem smart home.',
      description_en: 'Premium apartment on the 12th floor with panoramic views, quality materials, smart home system.',
      description_de: 'Premium-Wohnung im 12. Stock mit Panoramablick, hochwertigen Materialien und Smart-Home-System.',
      type: 'sale',
      category: 'apartment',
      price: 250000,
      currency: 'EUR',
      surface_area: 160,
      rooms: 4,
      bathrooms: 2,
      floor: 12,
      year_built: 2025,
      latitude: 42.6620,
      longitude: 21.1600,
      location_id: cityMap.get('prishtine-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: true,
      status: 'active',
      amenities: ['smart_home', 'parking', 'elevator', 'gym', 'balcony', 'air_conditioning'],
    },
    // 9 - House for sale in Peja
    {
      title_al: 'Shtëpi tradicionale e renovuar në Pejë',
      title_en: 'Renovated traditional house in Peja',
      title_de: 'Renoviertes traditionelles Haus in Peja',
      description_al: 'Shtëpi e bukur me arkitekturë tradicionale, e renovuar plotësisht, oborr i madh, afër Patrikanës.',
      description_en: 'Beautiful house with traditional architecture, fully renovated, large yard, near the Patriarchate.',
      description_de: 'Schoenes Haus mit traditioneller Architektur, komplett renoviert, grosser Garten, nahe dem Patriarchat.',
      type: 'sale',
      category: 'house',
      price: 135000,
      currency: 'EUR',
      surface_area: 180,
      rooms: 4,
      bathrooms: 2,
      floor: null,
      year_built: 1985,
      latitude: 42.6593,
      longitude: 20.2883,
      location_id: cityMap.get('peje-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: false,
      status: 'active',
      amenities: ['garden', 'renovated', 'central_heating', 'parking'],
    },
    // 10 - Apartment for rent in Mitrovica
    {
      title_al: 'Banesë e re 1-dhomëshe me qira në Mitrovicë',
      title_en: 'New 1-bedroom apartment for rent in Mitrovica',
      title_de: 'Neue 1-Zimmer-Wohnung zur Miete in Mitrovica',
      description_al: 'Banesë e re, e mobiluar, ideale për studentë ose çifte të reja. Lokacion i qetë, parkim i sigurt.',
      description_en: 'New, furnished apartment, ideal for students or young couples. Quiet location, secure parking.',
      description_de: 'Neue, moeblierte Wohnung, ideal fuer Studenten oder junge Paare. Ruhige Lage, sicherer Parkplatz.',
      type: 'rent',
      category: 'apartment',
      price: 250,
      currency: 'EUR',
      surface_area: 45,
      rooms: 1,
      bathrooms: 1,
      floor: 2,
      year_built: 2023,
      latitude: 42.8914,
      longitude: 20.8660,
      location_id: cityMap.get('mitrovice-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: false,
      status: 'active',
      amenities: ['furnished', 'parking', 'internet'],
    },
    // 11 - Office for sale in Gjakova
    {
      title_al: 'Hapësirë komerciale 200m² në Gjakovë',
      title_en: '200m² commercial space in Gjakova',
      title_de: '200m² Gewerbeflaeche in Gjakova',
      description_al: 'Hapësirë e madhe komerciale e përshtatshme për zyra ose klinikë, me parkim privat.',
      description_en: 'Large commercial space suitable for offices or a clinic, with private parking.',
      description_de: 'Grosse Gewerbeflaeche, geeignet fuer Bueros oder Praxis, mit privatem Parkplatz.',
      type: 'sale',
      category: 'office',
      price: 160000,
      currency: 'EUR',
      surface_area: 200,
      rooms: 6,
      bathrooms: 2,
      floor: 1,
      year_built: 2021,
      latitude: 42.3803,
      longitude: 20.4308,
      location_id: cityMap.get('gjakove-qytet')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['parking', 'elevator', 'air_conditioning', 'security'],
    },
    // 12 - Land for sale in Suhareka
    {
      title_al: 'Tokë bujqësore 50 ari në Suharekë',
      title_en: '50 are agricultural land in Suhareka',
      title_de: '50 Ar Ackerland in Suhareka',
      description_al: 'Tokë pjellore bujqësore me ujë dhe rrugë qasjeje, e përshtatshme për sera ose vreshta.',
      description_en: 'Fertile agricultural land with water and access road, suitable for greenhouses or vineyards.',
      description_de: 'Fruchtbares Ackerland mit Wasser und Zufahrtsstrasse, geeignet fuer Gewaechshaeuser oder Weinberge.',
      type: 'sale',
      category: 'land',
      price: 30000,
      currency: 'EUR',
      surface_area: 5000,
      rooms: null,
      bathrooms: null,
      floor: null,
      year_built: null,
      latitude: 42.3594,
      longitude: 20.8247,
      location_id: cityMap.get('suhareke')!,
      agent_id: insertedAgents[1].id,
      featured: false,
      status: 'active',
      amenities: ['water', 'access_road'],
    },
  ];

  const insertedProperties = await db
    .insert(schema.properties)
    .values(propertiesData)
    .returning();

  console.log(`  Inserted ${insertedProperties.length} properties`);

  // ── 4. Property Images ────────────────────────

  const imagesData: schema.NewPropertyImage[] = [];

  for (let i = 0; i < insertedProperties.length; i++) {
    const propId = insertedProperties[i].id;
    const propNum = i + 1;

    // Primary image
    imagesData.push({
      property_id: propId,
      url: `/uploads/property-${propNum}-1.jpg`,
      alt: `Property ${propNum} - Main image`,
      sort_order: 0,
      is_primary: true,
    });

    // Additional images (2-3 per property)
    imagesData.push({
      property_id: propId,
      url: `/uploads/property-${propNum}-2.jpg`,
      alt: `Property ${propNum} - Interior`,
      sort_order: 1,
      is_primary: false,
    });

    imagesData.push({
      property_id: propId,
      url: `/uploads/property-${propNum}-3.jpg`,
      alt: `Property ${propNum} - Additional view`,
      sort_order: 2,
      is_primary: false,
    });
  }

  const insertedImages = await db
    .insert(schema.propertyImages)
    .values(imagesData)
    .returning();

  console.log(`  Inserted ${insertedImages.length} property images`);

  // ── 5. Admin User ─────────────────────────────

  const passwordHash = await bcrypt.hash('admin123', 12);

  const insertedAdmin = await db
    .insert(schema.adminUsers)
    .values({
      email: 'admin@realestate.com',
      password_hash: passwordHash,
      name: 'Admin',
      role: 'admin',
    })
    .returning();

  console.log(`  Inserted admin user: ${insertedAdmin[0].email}`);

  console.log('\nSeeding complete!');
}

// ──────────────────────────────────────────────
// Run seed
// ──────────────────────────────────────────────

seed()
  .then(async () => {
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Seed error:', error);
    process.exit(1);
  });

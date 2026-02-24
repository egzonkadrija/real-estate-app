import { db } from './index';
import * as schema from './schema';
import { sql } from 'drizzle-orm';
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

  // ── 0. Clean all tables ─────────────────────────
  console.log('  Cleaning existing data...');
  await db.execute(sql`TRUNCATE TABLE property_images, contacts, property_requests, properties, agents, locations, admin_users RESTART IDENTITY CASCADE`);
  console.log('  All tables truncated.');

  // ── 1. Locations ──────────────────────────────

  // States (regions) of North Macedonia
  const statesData: schema.NewLocation[] = [
    { type: 'state', name_al: 'Shkup', name_en: 'Skopje', name_de: 'Skopje', slug: 'shkup' },
    { type: 'state', name_al: 'Tetovë', name_en: 'Tetovo', name_de: 'Tetovo', slug: 'tetove' },
    { type: 'state', name_al: 'Gostivar', name_en: 'Gostivar', name_de: 'Gostivar', slug: 'gostivar' },
    { type: 'state', name_al: 'Kumanovë', name_en: 'Kumanovo', name_de: 'Kumanovo', slug: 'kumanove' },
    { type: 'state', name_al: 'Manastir', name_en: 'Bitola', name_de: 'Bitola', slug: 'manastir' },
    { type: 'state', name_al: 'Ohër', name_en: 'Ohrid', name_de: 'Ohrid', slug: 'oher' },
    { type: 'state', name_al: 'Strugë', name_en: 'Struga', name_de: 'Struga', slug: 'struge' },
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
    // Shkup (Skopje) cities
    { type: 'city', name_al: 'Shkup', name_en: 'Skopje', name_de: 'Skopje', parent_id: stateMap.get('shkup')!, slug: 'shkup-qytet' },
    { type: 'city', name_al: 'Çair', name_en: 'Cair', name_de: 'Cair', parent_id: stateMap.get('shkup')!, slug: 'cair' },
    { type: 'city', name_al: 'Saraj', name_en: 'Saraj', name_de: 'Saraj', parent_id: stateMap.get('shkup')!, slug: 'saraj' },
    { type: 'city', name_al: 'Gjorçe Petrov', name_en: 'Gjorce Petrov', name_de: 'Gjorce Petrov', parent_id: stateMap.get('shkup')!, slug: 'gjorce-petrov' },
    { type: 'city', name_al: 'Gazi Babë', name_en: 'Gazi Baba', name_de: 'Gazi Baba', parent_id: stateMap.get('shkup')!, slug: 'gazi-babe' },
    { type: 'city', name_al: 'Haraçinë', name_en: 'Haracina', name_de: 'Haracina', parent_id: stateMap.get('shkup')!, slug: 'haracine' },

    // Tetovë (Tetovo) cities
    { type: 'city', name_al: 'Tetovë', name_en: 'Tetovo', name_de: 'Tetovo', parent_id: stateMap.get('tetove')!, slug: 'tetove-qytet' },
    { type: 'city', name_al: 'Bërvenicë', name_en: 'Brvenica', name_de: 'Brvenica', parent_id: stateMap.get('tetove')!, slug: 'bervenice' },
    { type: 'city', name_al: 'Jegunovcë', name_en: 'Jegunovce', name_de: 'Jegunovce', parent_id: stateMap.get('tetove')!, slug: 'jegunovce' },

    // Gostivar cities
    { type: 'city', name_al: 'Gostivar', name_en: 'Gostivar', name_de: 'Gostivar', parent_id: stateMap.get('gostivar')!, slug: 'gostivar-qytet' },
    { type: 'city', name_al: 'Vrapçisht', name_en: 'Vrapciste', name_de: 'Vrapciste', parent_id: stateMap.get('gostivar')!, slug: 'vrapcisht' },
    { type: 'city', name_al: 'Mavrovë', name_en: 'Mavrovo', name_de: 'Mavrovo', parent_id: stateMap.get('gostivar')!, slug: 'mavrove' },

    // Kumanovë (Kumanovo) cities
    { type: 'city', name_al: 'Kumanovë', name_en: 'Kumanovo', name_de: 'Kumanovo', parent_id: stateMap.get('kumanove')!, slug: 'kumanove-qytet' },
    { type: 'city', name_al: 'Likovë', name_en: 'Lipkovo', name_de: 'Lipkovo', parent_id: stateMap.get('kumanove')!, slug: 'likove' },
    { type: 'city', name_al: 'Staro Nagoriçane', name_en: 'Staro Nagoricane', name_de: 'Staro Nagoricane', parent_id: stateMap.get('kumanove')!, slug: 'staro-nagoricane' },

    // Manastir (Bitola) cities
    { type: 'city', name_al: 'Manastir', name_en: 'Bitola', name_de: 'Bitola', parent_id: stateMap.get('manastir')!, slug: 'manastir-qytet' },
    { type: 'city', name_al: 'Novaçi', name_en: 'Novaci', name_de: 'Novaci', parent_id: stateMap.get('manastir')!, slug: 'novaci' },
    { type: 'city', name_al: 'Mogillë', name_en: 'Mogila', name_de: 'Mogila', parent_id: stateMap.get('manastir')!, slug: 'mogile' },

    // Ohër (Ohrid) cities
    { type: 'city', name_al: 'Ohër', name_en: 'Ohrid', name_de: 'Ohrid', parent_id: stateMap.get('oher')!, slug: 'oher-qytet' },
    { type: 'city', name_al: 'Debërcë', name_en: 'Debarca', name_de: 'Debarca', parent_id: stateMap.get('oher')!, slug: 'deberce' },

    // Strugë (Struga) cities
    { type: 'city', name_al: 'Strugë', name_en: 'Struga', name_de: 'Struga', parent_id: stateMap.get('struge')!, slug: 'struge-qytet' },
    { type: 'city', name_al: 'Vevçan', name_en: 'Vevcani', name_de: 'Vevcani', parent_id: stateMap.get('struge')!, slug: 'vevcan' },
    { type: 'city', name_al: 'Dibër', name_en: 'Debar', name_de: 'Debar', parent_id: stateMap.get('struge')!, slug: 'diber' },
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
      name: 'Arben Demiri',
      email: 'arben@novabuildings.com',
      phone: '+389 70 123 456',
      avatar: '/uploads/agents/arben.jpg',
      bio_al: 'Agjent me përvojë 10 vjeçare në tregun e patundshmërive në Maqedoninë e Veriut. Specializuar në prona rezidenciale dhe komerciale në Shkup.',
      bio_en: 'Agent with 10 years of experience in the North Macedonia real estate market. Specialized in residential and commercial properties in Skopje.',
      bio_de: 'Makler mit 10 Jahren Erfahrung auf dem nordmazedonischen Immobilienmarkt. Spezialisiert auf Wohn- und Gewerbeimmobilien in Skopje.',
    },
    {
      name: 'Blerta Sulejmani',
      email: 'blerta@novabuildings.com',
      phone: '+389 71 234 567',
      avatar: '/uploads/agents/blerta.jpg',
      bio_al: 'Eksperte e patundshmërive me fokus në apartamente moderne dhe prona luksoze. Njohëse e thellë e tregut në Tetovë dhe Shkup.',
      bio_en: 'Real estate expert focused on modern apartments and luxury properties. Deep knowledge of the Tetovo and Skopje markets.',
      bio_de: 'Immobilienexpertin mit Fokus auf moderne Apartments und Luxusimmobilien. Tiefgehende Marktkenntnis in Tetovo und Skopje.',
    },
    {
      name: 'Driton Memeti',
      email: 'driton@novabuildings.com',
      phone: '+389 72 345 678',
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
    // 1 - Apartment for sale in Skopje
    {
      title_al: 'Banesë moderne 3-dhomëshe në qendër të Shkupit',
      title_en: 'Modern 3-bedroom apartment in Skopje center',
      title_de: 'Moderne 3-Zimmer-Wohnung im Zentrum von Skopje',
      description_al: 'Banesë e re me 3 dhoma gjumi, 2 banjo, ballkon dhe parkim nëntokësor. Ndërtesë e re me ashensor, ndodhet pranë Sheshit të Maqedonisë.',
      description_en: 'New apartment with 3 bedrooms, 2 bathrooms, balcony and underground parking. New building with elevator, located near Macedonia Square.',
      description_de: 'Neue Wohnung mit 3 Schlafzimmern, 2 Baedern, Balkon und Tiefgarage. Neubau mit Aufzug, in der Naehe des Mazedonien-Platzes.',
      type: 'sale',
      category: 'apartment',
      price: 120000,
      currency: 'EUR',
      surface_area: 95,
      rooms: 3,
      bathrooms: 2,
      floor: 5,
      year_built: 2024,
      latitude: 42.0035,
      longitude: 21.4520,
      location_id: cityMap.get('shkup-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: true,
      status: 'active',
      amenities: ['parking', 'elevator', 'balcony', 'central_heating'],
    },
    // 2 - House for sale in Tetovo
    {
      title_al: 'Shtëpi e re me oborr në Tetovë',
      title_en: 'New house with yard in Tetovo',
      title_de: 'Neues Haus mit Garten in Tetovo',
      description_al: 'Shtëpi 2-katëshe me 5 dhoma gjumi, garazhë për 2 vetura, oborr i madh dhe pamje nga Mali i Sharrit.',
      description_en: 'Two-story house with 5 bedrooms, garage for 2 cars, large yard, and views of Shar Mountain.',
      description_de: 'Zweistoeckiges Haus mit 5 Schlafzimmern, Garage fuer 2 Autos, grossem Garten und Blick auf den Shar-Berg.',
      type: 'sale',
      category: 'house',
      price: 185000,
      currency: 'EUR',
      surface_area: 220,
      rooms: 5,
      bathrooms: 3,
      floor: null,
      year_built: 2023,
      latitude: 42.0095,
      longitude: 20.9715,
      location_id: cityMap.get('tetove-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: true,
      status: 'active',
      amenities: ['garage', 'garden', 'central_heating', 'air_conditioning'],
    },
    // 3 - Office for rent in Skopje
    {
      title_al: 'Zyrë moderne në lagjen Çair, Shkup',
      title_en: 'Modern office in Cair neighborhood, Skopje',
      title_de: 'Modernes Buero im Stadtteil Cair, Skopje',
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
      latitude: 42.0070,
      longitude: 21.4350,
      location_id: cityMap.get('cair')!,
      agent_id: insertedAgents[0].id,
      featured: false,
      status: 'active',
      amenities: ['elevator', 'air_conditioning', 'parking', 'internet'],
    },
    // 4 - Land for sale in Gostivar
    {
      title_al: 'Tokë ndërtimore 10 ari në Gostivar',
      title_en: '10 are building land in Gostivar',
      title_de: '10 Ar Bauland in Gostivar',
      description_al: 'Tokë ndërtimore me leje ndërtimi, rrugë e asfaltuar, ujë dhe rrymë. Lokacion i shkëlqyer pranë qendrës.',
      description_en: 'Building land with construction permit, paved road, water, and electricity. Excellent location near the center.',
      description_de: 'Bauland mit Baugenehmigung, asphaltierter Strasse, Wasser und Strom. Ausgezeichnete Lage nahe dem Zentrum.',
      type: 'sale',
      category: 'land',
      price: 45000,
      currency: 'EUR',
      surface_area: 1000,
      rooms: null,
      bathrooms: null,
      floor: null,
      year_built: null,
      latitude: 41.7958,
      longitude: 20.9086,
      location_id: cityMap.get('gostivar-qytet')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['water', 'electricity', 'paved_road'],
    },
    // 5 - Apartment for rent in Kumanovo
    {
      title_al: 'Banesë me qira 2-dhomëshe në Kumanovë',
      title_en: '2-bedroom apartment for rent in Kumanovo',
      title_de: '2-Zimmer-Wohnung zur Miete in Kumanovo',
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
      latitude: 42.1322,
      longitude: 21.7144,
      location_id: cityMap.get('kumanove-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: false,
      status: 'active',
      amenities: ['furnished', 'internet', 'central_heating', 'elevator'],
    },
    // 6 - Store for rent in Bitola
    {
      title_al: 'Dyqan 80m² në qendër të Manastirit',
      title_en: '80m² store in Bitola center',
      title_de: '80m² Geschaeft im Zentrum von Bitola',
      description_al: 'Dyqan në rrugën kryesore tregtare Shirok Sokak, vitrinë e madhe, i përshtatshëm për çdo lloj biznesi.',
      description_en: 'Store on the main commercial street Shirok Sokak, large storefront, suitable for any type of business.',
      description_de: 'Geschaeft an der Haupteinkaufsstrasse Shirok Sokak, grosse Schaufensterfront, geeignet fuer jede Art von Geschaeft.',
      type: 'rent',
      category: 'store',
      price: 800,
      currency: 'EUR',
      surface_area: 80,
      rooms: 1,
      bathrooms: 1,
      floor: 0,
      year_built: 2018,
      latitude: 41.0297,
      longitude: 21.3292,
      location_id: cityMap.get('manastir-qytet')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['storefront', 'air_conditioning', 'security'],
    },
    // 7 - Warehouse for sale in Gazi Baba, Skopje
    {
      title_al: 'Depo industriale 500m² në Gazi Babë, Shkup',
      title_en: '500m² industrial warehouse in Gazi Baba, Skopje',
      title_de: '500m² Industrielager in Gazi Baba, Skopje',
      description_al: 'Depo e madhe në zonën industriale, qasje e lehtë për kamionë, dysheme betoni, lartësi 6m.',
      description_en: 'Large warehouse in the industrial zone, easy truck access, concrete floor, 6m height.',
      description_de: 'Grosses Lager in der Industriezone, leichter LKW-Zugang, Betonboden, 6m Hoehe.',
      type: 'sale',
      category: 'warehouse',
      price: 95000,
      currency: 'EUR',
      surface_area: 500,
      rooms: null,
      bathrooms: 1,
      floor: 0,
      year_built: 2015,
      latitude: 42.0200,
      longitude: 21.4700,
      location_id: cityMap.get('gazi-babe')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['truck_access', 'electricity', 'water', 'security'],
    },
    // 8 - Luxury apartment in Skopje
    {
      title_al: 'Apartament luksoz 4-dhomësh me pamje nga qyteti',
      title_en: 'Luxury 4-bedroom apartment with city views',
      title_de: 'Luxurioese 4-Zimmer-Wohnung mit Stadtblick',
      description_al: 'Apartament premium në katin e 12-të me pamje panoramike nga Kalaja e Shkupit, materiale cilësore, sistem smart home.',
      description_en: 'Premium apartment on the 12th floor with panoramic views of Skopje Fortress, quality materials, smart home system.',
      description_de: 'Premium-Wohnung im 12. Stock mit Panoramablick auf die Festung von Skopje, hochwertigen Materialien und Smart-Home-System.',
      type: 'sale',
      category: 'apartment',
      price: 250000,
      currency: 'EUR',
      surface_area: 160,
      rooms: 4,
      bathrooms: 2,
      floor: 12,
      year_built: 2025,
      latitude: 42.0010,
      longitude: 21.4480,
      location_id: cityMap.get('shkup-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: true,
      status: 'active',
      amenities: ['smart_home', 'parking', 'elevator', 'gym', 'balcony', 'air_conditioning'],
    },
    // 9 - House for sale in Ohrid
    {
      title_al: 'Shtëpi me pamje nga Liqeni i Ohrit',
      title_en: 'House with Lake Ohrid views',
      title_de: 'Haus mit Blick auf den Ohridsee',
      description_al: 'Shtëpi e bukur me pamje të mrekullueshme nga liqeni, e renovuar plotësisht, oborr i madh, afër Qendrës së Vjetër.',
      description_en: 'Beautiful house with stunning lake views, fully renovated, large yard, near the Old Town.',
      description_de: 'Schoenes Haus mit atemberaubendem Seeblick, komplett renoviert, grosser Garten, nahe der Altstadt.',
      type: 'sale',
      category: 'house',
      price: 135000,
      currency: 'EUR',
      surface_area: 180,
      rooms: 4,
      bathrooms: 2,
      floor: null,
      year_built: 1985,
      latitude: 41.1231,
      longitude: 20.8016,
      location_id: cityMap.get('oher-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: true,
      status: 'active',
      amenities: ['garden', 'renovated', 'central_heating', 'parking'],
    },
    // 10 - Apartment for rent in Struga
    {
      title_al: 'Banesë e re 1-dhomëshe me qira në Strugë',
      title_en: 'New 1-bedroom apartment for rent in Struga',
      title_de: 'Neue 1-Zimmer-Wohnung zur Miete in Struga',
      description_al: 'Banesë e re, e mobiluar, ideale për studentë ose çifte të reja. Lokacion i qetë pranë liqenit.',
      description_en: 'New, furnished apartment, ideal for students or young couples. Quiet location near the lake.',
      description_de: 'Neue, moeblierte Wohnung, ideal fuer Studenten oder junge Paare. Ruhige Lage in der Naehe des Sees.',
      type: 'rent',
      category: 'apartment',
      price: 250,
      currency: 'EUR',
      surface_area: 45,
      rooms: 1,
      bathrooms: 1,
      floor: 2,
      year_built: 2023,
      latitude: 41.1775,
      longitude: 20.6783,
      location_id: cityMap.get('struge-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: false,
      status: 'active',
      amenities: ['furnished', 'parking', 'internet'],
    },
    // 11 - Office for sale in Tetovo
    {
      title_al: 'Hapësirë komerciale 200m² në Tetovë',
      title_en: '200m² commercial space in Tetovo',
      title_de: '200m² Gewerbeflaeche in Tetovo',
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
      latitude: 42.0130,
      longitude: 20.9650,
      location_id: cityMap.get('tetove-qytet')!,
      agent_id: insertedAgents[2].id,
      featured: false,
      status: 'active',
      amenities: ['parking', 'elevator', 'air_conditioning', 'security'],
    },
    // 12 - Land for sale in Struga
    {
      title_al: 'Tokë bujqësore 50 ari në Strugë',
      title_en: '50 are agricultural land in Struga',
      title_de: '50 Ar Ackerland in Struga',
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
      latitude: 41.1800,
      longitude: 20.6800,
      location_id: cityMap.get('struge-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: false,
      status: 'active',
      amenities: ['water', 'access_road'],
    },
    // 13 - Featured: Penthouse in Skopje
    {
      title_al: 'Penthouse luksoz me tarracë në Shkup',
      title_en: 'Luxury penthouse with terrace in Skopje',
      title_de: 'Luxus-Penthouse mit Terrasse in Skopje',
      description_al: 'Penthouse ekskluziv në katin e fundit me tarracë 60m², pamje 360 gradë nga qyteti, 3 dhoma gjumi.',
      description_en: 'Exclusive penthouse on the top floor with 60m² terrace, 360-degree city views, 3 bedrooms.',
      description_de: 'Exklusives Penthouse im obersten Stockwerk mit 60m² Terrasse, 360-Grad-Stadtblick, 3 Schlafzimmer.',
      type: 'sale',
      category: 'apartment',
      price: 320000,
      currency: 'EUR',
      surface_area: 200,
      rooms: 3,
      bathrooms: 2,
      floor: 15,
      year_built: 2025,
      latitude: 42.0045,
      longitude: 21.4400,
      location_id: cityMap.get('shkup-qytet')!,
      agent_id: insertedAgents[0].id,
      featured: true,
      status: 'active',
      amenities: ['terrace', 'smart_home', 'parking', 'elevator', 'gym', 'pool'],
    },
    // 14 - Featured: Villa in Ohrid
    {
      title_al: 'Villë me pishinë pranë Liqenit të Ohrit',
      title_en: 'Villa with pool near Lake Ohrid',
      title_de: 'Villa mit Pool am Ohridsee',
      description_al: 'Villë luksoze me pishinë, 6 dhoma gjumi, oborr i madh, vetëm 200m nga liqeni. Ideale për turizëm ose banim.',
      description_en: 'Luxury villa with pool, 6 bedrooms, large yard, only 200m from the lake. Ideal for tourism or living.',
      description_de: 'Luxusvilla mit Pool, 6 Schlafzimmern, grossem Garten, nur 200m vom See. Ideal fuer Tourismus oder Wohnen.',
      type: 'sale',
      category: 'house',
      price: 280000,
      currency: 'EUR',
      surface_area: 350,
      rooms: 6,
      bathrooms: 4,
      floor: null,
      year_built: 2022,
      latitude: 41.1150,
      longitude: 20.8050,
      location_id: cityMap.get('oher-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: true,
      status: 'active',
      amenities: ['pool', 'garden', 'parking', 'air_conditioning', 'furnished', 'security'],
    },
    // 15 - Featured: Modern apartment in Tetovo
    {
      title_al: 'Banesë moderne 2-dhomëshe në qendër të Tetovës',
      title_en: 'Modern 2-bedroom apartment in Tetovo center',
      title_de: 'Moderne 2-Zimmer-Wohnung im Zentrum von Tetovo',
      description_al: 'Banesë e re me dizajn modern, materiale premium, ngrohje nën dysheme dhe ballkon me pamje nga Malet e Sharrit.',
      description_en: 'New apartment with modern design, premium materials, underfloor heating and balcony with Shar Mountain views.',
      description_de: 'Neue Wohnung mit modernem Design, Premium-Materialien, Fussbodenheizung und Balkon mit Blick auf das Shar-Gebirge.',
      type: 'sale',
      category: 'apartment',
      price: 89000,
      currency: 'EUR',
      surface_area: 75,
      rooms: 2,
      bathrooms: 1,
      floor: 4,
      year_built: 2024,
      latitude: 42.0110,
      longitude: 20.9680,
      location_id: cityMap.get('tetove-qytet')!,
      agent_id: insertedAgents[1].id,
      featured: true,
      status: 'active',
      amenities: ['balcony', 'elevator', 'central_heating', 'parking'],
    },
    // 16 - Featured: Duplex in Gostivar
    {
      title_al: 'Dupleks i ri 5-dhomësh në Gostivar',
      title_en: 'New 5-bedroom duplex in Gostivar',
      title_de: 'Neuer 5-Zimmer-Duplex in Gostivar',
      description_al: 'Dupleks i ri me 5 dhoma gjumi, garazhë, oborr, ngrohje qendrore dhe sistem alarmi. Lagje e qetë familjare.',
      description_en: 'New duplex with 5 bedrooms, garage, yard, central heating and alarm system. Quiet family neighborhood.',
      description_de: 'Neuer Duplex mit 5 Schlafzimmern, Garage, Garten, Zentralheizung und Alarmanlage. Ruhige Familiengegend.',
      type: 'sale',
      category: 'house',
      price: 155000,
      currency: 'EUR',
      surface_area: 240,
      rooms: 5,
      bathrooms: 3,
      floor: null,
      year_built: 2024,
      latitude: 41.7980,
      longitude: 20.9100,
      location_id: cityMap.get('gostivar-qytet')!,
      agent_id: insertedAgents[2].id,
      featured: true,
      status: 'active',
      amenities: ['garage', 'garden', 'central_heating', 'security', 'air_conditioning'],
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

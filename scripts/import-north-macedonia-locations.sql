BEGIN;

-- Safe, idempotent import for North Macedonia regions and municipalities.
-- This does not delete properties, agents, contacts, or existing locations.
-- Existing locations are updated in place by slug when a matching slug exists.

INSERT INTO locations (type, name_al, name_en, name_de, name_mk, parent_id, slug)
VALUES
  ('state', 'Rajoni Lindor', 'Eastern Region', 'Eastern Region', 'Источен Регион', NULL, 'eastern-region'),
  ('state', 'Rajoni Verilindor', 'Northeastern Region', 'Northeastern Region', 'Североисточен Регион', NULL, 'northeastern-region'),
  ('state', 'Rajoni i Pelagonise', 'Pelagonia Region', 'Pelagonia Region', 'Пелагониски Регион', NULL, 'pelagonia-region'),
  ('state', 'Rajoni i Pollogut', 'Polog Region', 'Polog Region', 'Полошки Регион', NULL, 'polog-region'),
  ('state', 'Rajoni i Shkupit', 'Skopje Region', 'Skopje Region', 'Скопски Регион', NULL, 'skopje-region'),
  ('state', 'Rajoni Juglindor', 'Southeastern Region', 'Southeastern Region', 'Југоисточен Регион', NULL, 'southeastern-region'),
  ('state', 'Rajoni Jugperendimor', 'Southwestern Region', 'Southwestern Region', 'Југозападен Регион', NULL, 'southwestern-region'),
  ('state', 'Rajoni i Vardarit', 'Vardar Region', 'Vardar Region', 'Вардарски Регион', NULL, 'vardar-region')
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  name_en = EXCLUDED.name_en,
  name_al = COALESCE(NULLIF(locations.name_al, ''), EXCLUDED.name_al),
  name_de = COALESCE(NULLIF(locations.name_de, ''), EXCLUDED.name_de),
  name_mk = COALESCE(NULLIF(locations.name_mk, ''), EXCLUDED.name_mk),
  parent_id = EXCLUDED.parent_id;

WITH city_rows (name_al, name_en, name_de, name_mk, parent_slug, slug) AS (
  VALUES
    ('Shkup', 'Skopje', 'Skopje', 'Скопје', 'skopje-region', 'shkup-qytet'),
    ('Aerodrom', 'Aerodrom', 'Aerodrom', 'Аеродром', 'skopje-region', 'aerodrom'),
    ('Haraçinë', 'Aracinovo', 'Aracinovo', 'Арачиново', 'skopje-region', 'haracine'),
    ('Butel', 'Butel', 'Butel', 'Бутел', 'skopje-region', 'butel'),
    ('Çair', 'Chair', 'Chair', 'Чаир', 'skopje-region', 'cair'),
    ('Centar', 'Centar', 'Centar', 'Центар', 'skopje-region', 'centar'),
    ('Chucher-Sandevo', 'Chucher-Sandevo', 'Chucher-Sandevo', 'Чучер-Сандево', 'skopje-region', 'chucher-sandevo'),
    ('Gazi Babë', 'Gazi Baba', 'Gazi Baba', 'Гази Баба', 'skopje-region', 'gazi-babe'),
    ('Gjorçe Petrov', 'Gjorce Petrov', 'Gjorce Petrov', 'Ѓорче Петров', 'skopje-region', 'gjorce-petrov'),
    ('Ilinden', 'Ilinden', 'Ilinden', 'Илинден', 'skopje-region', 'ilinden'),
    ('Karpos', 'Karpos', 'Karpos', 'Карпош', 'skopje-region', 'karpos'),
    ('Kisela Voda', 'Kisela Voda', 'Kisela Voda', 'Кисела Вода', 'skopje-region', 'kisela-voda'),
    ('Petrovec', 'Petrovec', 'Petrovec', 'Петровец', 'skopje-region', 'petrovec'),
    ('Saraj', 'Saraj', 'Saraj', 'Сарај', 'skopje-region', 'saraj'),
    ('Sopiste', 'Sopiste', 'Sopiste', 'Сопиште', 'skopje-region', 'sopiste'),
    ('Studeniçan', 'Studenicani', 'Studenicani', 'Студеничани', 'skopje-region', 'studenicani'),
    ('Suto Orizari', 'Suto Orizari', 'Suto Orizari', 'Шуто Оризари', 'skopje-region', 'suto-orizari'),
    ('Zelenikovo', 'Zelenikovo', 'Zelenikovo', 'Зелениково', 'skopje-region', 'zelenikovo'),

    ('Bogovinë', 'Bogovinje', 'Bogovinje', 'Боговиње', 'polog-region', 'bogovinje'),
    ('Bërvenicë', 'Brvenica', 'Brvenica', 'Брвеница', 'polog-region', 'bervenice'),
    ('Gostivar', 'Gostivar', 'Gostivar', 'Гостивар', 'polog-region', 'gostivar-qytet'),
    ('Jegunoc', 'Jegunovce', 'Jegunovce', 'Јегуновце', 'polog-region', 'jegunovce'),
    ('Mavrovë dhe Rostushë', 'Mavrovo and Rostusa', 'Mavrovo and Rostusa', 'Маврово и Ростуша', 'polog-region', 'mavrove'),
    ('Tearce', 'Tearce', 'Tearce', 'Теарце', 'polog-region', 'tearce'),
    ('Tetovë', 'Tetovo', 'Tetovo', 'Тетово', 'polog-region', 'tetove-qytet'),
    ('Vrapçisht', 'Vrapciste', 'Vrapciste', 'Врапчиште', 'polog-region', 'vrapcisht'),
    ('Zhelinë', 'Zelino', 'Zelino', 'Желино', 'polog-region', 'zelino'),

    ('Kratovo', 'Kratovo', 'Kratovo', 'Кратово', 'northeastern-region', 'kratovo'),
    ('Kriva Palanka', 'Kriva Palanka', 'Kriva Palanka', 'Крива Паланка', 'northeastern-region', 'kriva-palanka'),
    ('Kumanovë', 'Kumanovo', 'Kumanovo', 'Куманово', 'northeastern-region', 'kumanove-qytet'),
    ('Likovë', 'Lipkovo', 'Lipkovo', 'Липково', 'northeastern-region', 'likove'),
    ('Rankovce', 'Rankovce', 'Rankovce', 'Ранковце', 'northeastern-region', 'rankovce'),
    ('Staro Nagoricane', 'Staro Nagoricane', 'Staro Nagoricane', 'Старо Нагоричане', 'northeastern-region', 'staro-nagoricane'),

    ('Berovo', 'Berovo', 'Berovo', 'Берово', 'eastern-region', 'berovo'),
    ('Vinica', 'Vinica', 'Vinica', 'Виница', 'eastern-region', 'vinica'),
    ('Delcevo', 'Delcevo', 'Delcevo', 'Делчево', 'eastern-region', 'delcevo'),
    ('Zrnovci', 'Zrnovci', 'Zrnovci', 'Зрновци', 'eastern-region', 'zrnovci'),
    ('Karbinci', 'Karbinci', 'Karbinci', 'Карбинци', 'eastern-region', 'karbinci'),
    ('Kocani', 'Kocani', 'Kocani', 'Кочани', 'eastern-region', 'kocani'),
    ('Makedonska Kamenica', 'Makedonska Kamenica', 'Makedonska Kamenica', 'Македонска Каменица', 'eastern-region', 'makedonska-kamenica'),
    ('Pehçevë', 'Pehcevo', 'Pehcevo', 'Пехчево', 'eastern-region', 'pehcevo'),
    ('Probishtip', 'Probistip', 'Probistip', 'Пробиштип', 'eastern-region', 'probistip'),
    ('Çeshinovë-Obleshevë', 'Cesinovo-Oblesevo', 'Cesinovo-Oblesevo', 'Чешиново-Облешево', 'eastern-region', 'cesinovo-oblesevo'),
    ('Shtip', 'Stip', 'Stip', 'Штип', 'eastern-region', 'stip'),

    ('Çashkë', 'Caska', 'Caska', 'Чашка', 'vardar-region', 'caska'),
    ('Demir Kapija', 'Demir Kapija', 'Demir Kapija', 'Демир Капија', 'vardar-region', 'demir-kapija'),
    ('Gradsko', 'Gradsko', 'Gradsko', 'Градско', 'vardar-region', 'gradsko'),
    ('Kavadarci', 'Kavadarci', 'Kavadarci', 'Кавадарци', 'vardar-region', 'kavadarci'),
    ('Lozovo', 'Lozovo', 'Lozovo', 'Лозово', 'vardar-region', 'lozovo'),
    ('Negotino', 'Negotino', 'Negotino', 'Неготино', 'vardar-region', 'negotino'),
    ('Rosoman', 'Rosoman', 'Rosoman', 'Росоман', 'vardar-region', 'rosoman'),
    ('Sveti Nikollë', 'Sveti Nikole', 'Sveti Nikole', 'Свети Николе', 'vardar-region', 'sveti-nikole'),
    ('Veles', 'Veles', 'Veles', 'Велес', 'vardar-region', 'veles'),

    ('Bogdanci', 'Bogdanci', 'Bogdanci', 'Богданци', 'southeastern-region', 'bogdanci'),
    ('Bosilovo', 'Bosilovo', 'Bosilovo', 'Босилово', 'southeastern-region', 'bosilovo'),
    ('Vallandovë', 'Valandovo', 'Valandovo', 'Валандово', 'southeastern-region', 'valandovo'),
    ('Vasilevë', 'Vasilevo', 'Vasilevo', 'Василево', 'southeastern-region', 'vasilevo'),
    ('Gevgelija', 'Gevgelija', 'Gevgelija', 'Гевгелија', 'southeastern-region', 'gevgelija'),
    ('Dojran', 'Dojran', 'Dojran', 'Дојран', 'southeastern-region', 'dojran'),
    ('Konce', 'Konce', 'Konce', 'Конче', 'southeastern-region', 'konce'),
    ('Novo Selo', 'Novo Selo', 'Novo Selo', 'Ново Село', 'southeastern-region', 'novo-selo'),
    ('Radovish', 'Radovis', 'Radovis', 'Радовиш', 'southeastern-region', 'radovis'),
    ('Strumicë', 'Strumica', 'Strumica', 'Струмица', 'southeastern-region', 'strumica'),

    ('Zhupë Qendër', 'Centar Zupa', 'Centar Zupa', 'Центар Жупа', 'southwestern-region', 'centar-zupa'),
    ('Dibër', 'Debar', 'Debar', 'Дебар', 'southwestern-region', 'diber'),
    ('Debërcë', 'Debarca', 'Debarca', 'Дебрца', 'southwestern-region', 'deberce'),
    ('Kërçovë', 'Kicevo', 'Kicevo', 'Кичево', 'southwestern-region', 'kicevo'),
    ('Makedonski Brod', 'Makedonski Brod', 'Makedonski Brod', 'Македонски Брод', 'southwestern-region', 'makedonski-brod'),
    ('Ohër', 'Ohrid', 'Ohrid', 'Охрид', 'southwestern-region', 'oher-qytet'),
    ('Plasnica', 'Plasnica', 'Plasnica', 'Пласница', 'southwestern-region', 'plasnica'),
    ('Strugë', 'Struga', 'Struga', 'Струга', 'southwestern-region', 'struge-qytet'),
    ('Vevçan', 'Vevcani', 'Vevcani', 'Вевчани', 'southwestern-region', 'vevcan'),

    ('Manastir', 'Bitola', 'Bitola', 'Битола', 'pelagonia-region', 'manastir-qytet'),
    ('Demir Hisar', 'Demir Hisar', 'Demir Hisar', 'Демир Хисар', 'pelagonia-region', 'demir-hisar'),
    ('Dolneni', 'Dolneni', 'Dolneni', 'Долнени', 'pelagonia-region', 'dolneni'),
    ('Krivogashtani', 'Krivogashtani', 'Krivogashtani', 'Кривогаштани', 'pelagonia-region', 'krivogashtani'),
    ('Krushevë', 'Krusevo', 'Krusevo', 'Крушево', 'pelagonia-region', 'krusevo'),
    ('Mogillë', 'Mogila', 'Mogila', 'Могила', 'pelagonia-region', 'mogile'),
    ('Novaci', 'Novaci', 'Novaci', 'Новаци', 'pelagonia-region', 'novaci'),
    ('Prilep', 'Prilep', 'Prilep', 'Прилеп', 'pelagonia-region', 'prilep'),
    ('Resen', 'Resen', 'Resen', 'Ресен', 'pelagonia-region', 'resen')
)
INSERT INTO locations (type, name_al, name_en, name_de, name_mk, parent_id, slug)
SELECT
  'city',
  city_rows.name_al,
  city_rows.name_en,
  city_rows.name_de,
  city_rows.name_mk,
  parent_locations.id,
  city_rows.slug
FROM city_rows
JOIN locations AS parent_locations
  ON parent_locations.slug = city_rows.parent_slug
 AND parent_locations.type = 'state'
ON CONFLICT (slug) DO UPDATE
SET
  type = EXCLUDED.type,
  name_en = EXCLUDED.name_en,
  name_al = COALESCE(NULLIF(locations.name_al, ''), EXCLUDED.name_al),
  name_de = COALESCE(NULLIF(locations.name_de, ''), EXCLUDED.name_de),
  name_mk = COALESCE(NULLIF(locations.name_mk, ''), EXCLUDED.name_mk),
  parent_id = EXCLUDED.parent_id;

COMMIT;

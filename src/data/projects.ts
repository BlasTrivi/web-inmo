/**
 * Fuente única de datos de los proyectos.
 * De acá salen: rutas, <title>/descripción, OG images, JSON-LD, sitemap, llms.txt,
 * llms-full.txt, versiones .md y las grillas "Otros proyectos".
 *
 * El cuerpo de cada página (secciones) vive en `src/content/projects/<slug>/NN-<id>.html`.
 */

export type ProjectStatus =
  | 'launch' // Nuevo lanzamiento
  | 'last-units' // Terminado, últimas unidades
  | 'upcoming' // En preparación / próximamente
  | 'finished' // Terminado y habitado
  | 'delivered' // Entregado
  | 'sold-out'; // 100% vendido

export interface NavItem {
  /** id de la sección dentro de la página (ancla) */
  id: string;
  label: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Posición en el listado "Proyecto 0N" */
  order: number;
  status: ProjectStatus;
  /** Etiqueta corta (tarjetas y "Otros proyectos") */
  statusLabel: string;
  /** Texto del kicker de la portada, tal cual el original */
  kicker: string;
  /** Línea de ubicación de la portada */
  loc: string;
  hero: { image: string; alt: string; kenBurns: boolean };
  /** Imagen de las tarjetas "Otros proyectos" */
  cardImage: string;
  cardAlt: string;
  /** Índice de la portada */
  nav: NavItem[];
  /** <title> (se le agrega " · INMO Desarrollos") */
  title: string;
  /** meta description / descripción JSON-LD */
  description: string;
  /** Frase corta para la imagen OG */
  ogTagline: string;
  /** Dirección postal para JSON-LD (solo lo que figura en el sitio) */
  address: { street: string; locality: string };
  /** Tipo schema.org */
  schemaType: 'ApartmentComplex';
  /** Disponibilidad schema.org para el Offer (si corresponde) */
  availability?: 'InStock' | 'LimitedAvailability' | 'PreSale' | 'SoldOut';
  showroom?: string;
  /** Datos de la ficha (para JSON-LD additionalProperty y llms) */
  facts: { name: string; value: string }[];
  /** Amenities citados en el sitio */
  amenities: string[];
  numberOfUnits?: number;
}

export const projects: Project[] = [
  {
    slug: 'trinity-2',
    name: 'Trinity 2',
    order: 1,
    status: 'launch',
    statusLabel: 'Nuevo lanzamiento',
    kicker: 'Proyecto 01 · Nuevo lanzamiento',
    loc: 'Tte. Máximo Caballero esq. José Pappalardo · A 50 m del Club Internacional de Tenis · Asunción',
    hero: {
      image: 'trinity2_exterior_2.webp',
      alt: 'Fachada de Trinity 2, la nueva torre de Trinity Towers junto al Club Internacional de Tenis, Asunción',
      kenBurns: false,
    },
    cardImage: 'trinity2_exterior_2.webp',
    cardAlt: 'Fachada de Trinity 2 junto al CIT',
    nav: [
      { id: 'proyecto', label: 'El proyecto' },
      { id: 'amenities', label: 'Amenities' },
      { id: 'niveles', label: 'Elegí tu nivel' },
      { id: 'tipologias', label: 'Tipologías' },
      { id: 'galeria', label: 'Galería' },
      { id: 'ficha', label: 'Ficha y ubicación' },
    ],
    title: 'Trinity 2 · Nuevo lanzamiento junto al CIT',
    description:
      'Trinity 2: dieciséis niveles junto al Club Internacional de Tenis, de monoambientes a tres dormitorios (36 a 88 m²), con un piso entero de amenities. Nuevo lanzamiento de INMO en Asunción.',
    ogTagline: 'Nuevo lanzamiento · A 50 m del CIT',
    address: { street: 'Tte. Máximo Caballero esq. José Pappalardo', locality: 'Asunción' },
    schemaType: 'ApartmentComplex',
    availability: 'InStock',
    showroom: 'https://trinity-ii.urbania3d.app/',
    facts: [
      { name: 'Niveles', value: '16' },
      { name: 'Tipologías', value: 'Monoambiente (35,64 m²) a 3 dormitorios (88,46 m²)' },
      { name: 'Complejo', value: 'Trinity Towers: tres torres sobre 20.000 m² junto al Club Internacional de Tenis' },
      { name: 'Estado', value: 'Nuevo lanzamiento' },
    ],
    amenities: [
      'Piscina con solarium',
      'Deck',
      'Quinchos',
      'Gimnasio cubierto y exterior',
      'Playroom',
      'Cowork',
      'Sala de reuniones',
      'Sala de streaming',
    ],
  },
  {
    slug: 'the-address',
    name: 'The Address',
    order: 2,
    status: 'last-units',
    statusLabel: 'Últimas unidades',
    kicker: 'Proyecto 02 · Finalizado, últimas unidades',
    loc: 'Av. Santísima Trinidad · Barrio Mburucuyá · Asunción',
    hero: {
      image: 'address_pool.webp',
      alt: 'Piscina de The Address al atardecer sobre Asunción',
      kenBurns: true,
    },
    cardImage: 'address_dr_remate_3.webp',
    cardAlt: 'The Address de noche, con la azotea iluminada',
    nav: [
      { id: 'proyecto', label: 'El proyecto' },
      { id: 'amenities', label: 'Amenities' },
      { id: 'tipologias', label: 'Residencias y dúplex' },
      { id: 'galeria', label: 'Galería nocturna' },
      { id: 'ficha', label: 'Ficha y ubicación' },
    ],
    title: 'The Address · Residencias y dúplex en Mburucuyá',
    description:
      'The Address: residencias de dos y tres dormitorios en suite y dúplex de cuatro con piscina privada sobre la avenida Santísima Trinidad, Asunción. Terminado, últimas unidades.',
    ogTagline: 'Últimas unidades · Av. Santísima Trinidad',
    address: { street: 'Av. Santísima Trinidad, barrio Mburucuyá', locality: 'Asunción' },
    schemaType: 'ApartmentComplex',
    availability: 'LimitedAvailability',
    facts: [
      { name: 'Residencias', value: '56 · A 143 · B 142 · C 160 · D 160 m²' },
      { name: 'Dúplex', value: '8 · A 294 · B 278 · C 289 · D 297 m²' },
      { name: 'Cocheras', value: '142 propias, bauleras y estacionamiento para visitas' },
      { name: 'Diseña', value: 'F. Bibolini' },
      { name: 'Estado', value: 'Finalizado · últimas unidades en venta' },
    ],
    amenities: ['Amenities en el piso 5', 'Azotea', 'Piscina y deck privados en los dúplex', 'Baulera'],
  },
  {
    slug: 'president-tower',
    name: 'President Tower',
    order: 3,
    status: 'upcoming',
    statusLabel: 'Próximamente',
    kicker: 'Proyecto 03 · En preparación',
    loc: 'Luxury Residences · Un departamento por piso · Asunción',
    hero: {
      image: 'president_frame_torre.webp',
      alt: 'Render de President Tower, torre de luxury residences en Asunción',
      kenBurns: true,
    },
    cardImage: 'president_frame_torre.webp',
    cardAlt: 'Render de la torre President Tower',
    nav: [
      { id: 'proyecto', label: 'El proyecto' },
      { id: 'amenities', label: 'Amenities' },
      { id: 'galeria', label: 'Galería' },
      { id: 'unidades', label: 'Unidades' },
      { id: 'ficha', label: 'Ficha' },
    ],
    title: 'President Tower · Luxury residences, un departamento por piso',
    description:
      'President Tower: exclusividad y lujo en Asunción. Un departamento por piso con ascensor privado, lobby de doble altura, piscina, gimnasio, salón, coworking, kids room y playroom.',
    ogTagline: 'Luxury residences · Un departamento por piso',
    address: { street: 'Ubicación a confirmar en el lanzamiento', locality: 'Asunción' },
    schemaType: 'ApartmentComplex',
    availability: 'PreSale',
    showroom: 'https://president-tower.urbania3d.app/',
    facts: [
      { name: 'Concepto', value: 'Luxury residences: un departamento por piso con ascensor privado' },
      { name: 'Ubicación', value: 'A confirmar en el lanzamiento' },
      { name: 'Estado', value: 'En preparación' },
    ],
    amenities: [
      'Lobby de doble altura',
      'Salón de eventos',
      'Gimnasio',
      'Terraza con piscina',
      'Playroom',
      'Kids room',
      'Coworking',
    ],
  },
  {
    slug: 'boston-842',
    name: 'Boston 842',
    order: 4,
    status: 'finished',
    statusLabel: 'Terminado',
    kicker: 'Proyecto 04 · Terminado',
    loc: 'Juan de Salazar entre Washington y Padre Cardozo · Las Mercedes · Asunción',
    hero: { image: 'boston_aerial.webp', alt: 'Boston 842 desde el aire al atardecer', kenBurns: false },
    cardImage: 'boston_facade.webp',
    cardAlt: 'Fachada de ladrillo visto de Boston 842',
    nav: [
      { id: 'proyecto', label: 'El proyecto' },
      { id: 'materiales', label: 'Materiales' },
      { id: 'galeria', label: 'Galería' },
      { id: 'dia', label: 'Un día en Boston' },
      { id: 'amenities', label: 'Amenities' },
      { id: 'tipologias', label: 'Tipologías' },
      { id: 'ficha', label: 'Ficha y ubicación' },
    ],
    title: 'Boston 842 · Estilo Soho en Las Mercedes',
    description:
      'Boston 842: siete pisos y 29 unidades de uno a tres dormitorios en Las Mercedes, Asunción. Ladrillo visto y diseño industrial, con dos terrazas, piscina, rooftop grill, quincho y gimnasio.',
    ogTagline: 'Terminado · Las Mercedes, Asunción',
    address: { street: 'Juan de Salazar entre Washington y Padre Cardozo, barrio Las Mercedes', locality: 'Asunción' },
    schemaType: 'ApartmentComplex',
    numberOfUnits: 29,
    facts: [
      { name: 'Edificio', value: '7 pisos · 29 unidades · 6 dúplex' },
      { name: 'Tipologías', value: '1, 2 y 3 dormitorios, de 49,28 a 172,72 m²' },
      { name: 'Diseña', value: 'F. Bibolini' },
      { name: 'Construye', value: 'AGB' },
      { name: 'Estado', value: 'Terminado y habitado' },
    ],
    amenities: ['Piscina', 'Playground', 'Rooftop grill', 'Quincho y bar climatizados', 'Gimnasio', 'Play room', 'Meeting room', 'Cowork'],
  },
  {
    slug: 'trinity-3',
    name: 'Trinity 3',
    order: 5,
    status: 'delivered',
    statusLabel: 'Entregado',
    kicker: 'Proyecto  · Entregado · Segunda etapa de Trinity Towers',
    loc: 'Tte. Máximo Caballero esq. Calle 4 · A 50 m del Club Internacional de Tenis',
    hero: { image: 'trinity3_aerial.webp', alt: 'Vista aérea de Trinity 3 junto al Club Internacional de Tenis', kenBurns: false },
    cardImage: 'trinity3_tower.webp',
    cardAlt: 'Torre de Trinity 3',
    nav: [
      { id: 'proyecto', label: 'El proyecto' },
      { id: 'tipologias', label: 'Tipologías' },
      { id: 'galeria', label: 'Galería' },
      { id: 'ficha', label: 'Ficha' },
    ],
    title: 'Trinity 3 · Segunda etapa de Trinity Towers',
    description:
      'Trinity 3: 28 departamentos de dos dormitorios (62 a 80 m²) con azotea, piscina panorámica, quincho climatizado y gimnasio, a 50 m del Club Internacional de Tenis, Asunción. Entregado.',
    ogTagline: 'Entregado · A 50 m del CIT',
    address: { street: 'Tte. Máximo Caballero esq. Calle 4', locality: 'Asunción' },
    schemaType: 'ApartmentComplex',
    numberOfUnits: 28,
    facts: [
      { name: 'Edificio', value: 'PB + 2 pisos de estacionamiento + 7 pisos · 28 departamentos' },
      { name: 'Superficie', value: '62 a 80 m² por unidad' },
      { name: 'Estado', value: 'Entregado' },
    ],
    amenities: ['Azotea con piscina panorámica', 'Quincho climatizado con parrilla', 'Gimnasio'],
  },
  {
    slug: 'laguna-club',
    name: 'Laguna Club',
    order: 6,
    status: 'delivered',
    statusLabel: 'Entregado',
    kicker: 'Proyecto  · Entregado',
    loc: 'Apartments & Lofts · Máximo Caballero esq. José Pappalardo · A pasos del CIT',
    hero: { image: 'laguna_02.webp', alt: 'Laguna Club, apartments & lofts a pasos del CIT en Asunción', kenBurns: false },
    cardImage: 'laguna_facade.webp',
    cardAlt: 'Fachada de Laguna Club',
    nav: [
      { id: 'proyecto', label: 'El proyecto' },
      { id: 'tipologias', label: 'Tipologías' },
      { id: 'galeria', label: 'Galería' },
      { id: 'ficha', label: 'Ficha' },
    ],
    title: 'Laguna Club · Apartments & lofts a pasos del CIT',
    description:
      'Laguna Club: cinco pisos de suites, lofts y un departamento familiar (39 a 60 m²), con dos niveles de cocheras y azotea con piscina panorámica, a pasos del CIT en Asunción. Entregado.',
    ogTagline: 'Entregado · Apartments & lofts',
    address: { street: 'Máximo Caballero esq. José Pappalardo', locality: 'Asunción' },
    schemaType: 'ApartmentComplex',
    facts: [
      { name: 'Edificio', value: '5 pisos de departamentos, 2 niveles de cocheras y azotea' },
      { name: 'Tipologías', value: 'Suites A, B, E y F · Lofts C y D · Familiar G' },
      { name: 'Diseña', value: 'F. Bibolini' },
      { name: 'Construye', value: 'Tedec' },
      { name: 'Estado', value: 'Entregado' },
    ],
    amenities: ['Piscina panorámica con terraza descubierta', 'Salón de eventos climatizado con parrilla', 'Gimnasio equipado', 'Business center'],
  },
  {
    slug: 'infinity',
    name: 'Infinity',
    order: 7,
    status: 'sold-out',
    statusLabel: '100% vendido',
    kicker: 'Proyecto  · Entregado · 100% vendido',
    loc: 'Apartments & Lofts · Av. Santísima Trinidad entre Julio Correa y Prof. Francisco Fernández',
    hero: {
      image: 'img_70.webp',
      alt: 'Infinity, apartments & lofts sobre la avenida Santísima Trinidad en Asunción',
      kenBurns: true,
    },
    cardImage: 'infinity_front.webp',
    cardAlt: 'Frente de Infinity',
    nav: [
      { id: 'proyecto', label: 'El proyecto' },
      { id: 'tipologias', label: 'Tipologías' },
      { id: 'galeria', label: 'Galería' },
      { id: 'ficha', label: 'Ficha' },
    ],
    title: 'Infinity · Apartments & lofts sobre Santísima Trinidad',
    description:
      'Infinity: apartments & lofts de 36 a 93 m² sobre la avenida Santísima Trinidad, Asunción, con piscina panorámica, dos salones de eventos, gimnasio con sauna y business center. 100% vendido.',
    ogTagline: '100% vendido · Av. Santísima Trinidad',
    address: { street: 'Av. Santísima Trinidad entre Julio Correa y Prof. Francisco Fernández', locality: 'Asunción' },
    schemaType: 'ApartmentComplex',
    availability: 'SoldOut',
    facts: [
      { name: 'Tipologías', value: 'A 53,11 · B 92,63 · C 73,30 · D 35,96 · E 53,08 m²' },
      { name: 'Diseña', value: 'F. Bibolini' },
      { name: 'Construye', value: 'Tedec' },
      { name: 'Estado', value: 'Entregado · 100% vendido' },
    ],
    amenities: ['Piscina panorámica', 'Dos salones de eventos', 'Gimnasio con sauna', 'Playground', 'Business center', 'Laundry'],
  },
];

export const projectBySlug = (slug: string): Project => {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Proyecto desconocido: ${slug}`);
  return p;
};

export const projectPath = (slug: string): string => `/${slug}/`;

/** Secciones de la home (para el menú y el mapa de títulos del "telón" de transición). */
export const homeSections = [
  { id: 'manifiesto', label: 'Manifiesto', title: 'Manifiesto' },
  { id: 'proyectos', label: 'Proyectos', title: 'Proyectos' },
  { id: 'entregados', label: 'Entregados', title: 'Entregados' },
  { id: 'nosotros', label: 'Diez años', title: 'Diez años' },
  { id: 'contacto', label: 'Contacto', title: 'Contacto' },
] as const;

/** Entradas del menú principal, en orden. */
export const menuItems: { label: string; href: string }[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Manifiesto', href: '/#manifiesto' },
  { label: 'Proyectos', href: '/#proyectos' },
  { label: 'Trinity 2', href: '/trinity-2/' },
  { label: 'The Address', href: '/the-address/' },
  { label: 'President Tower', href: '/president-tower/' },
  { label: 'Boston 842', href: '/boston-842/' },
  { label: 'Entregados', href: '/#entregados' },
  { label: 'Diez años', href: '/#nosotros' },
  { label: 'Contacto', href: '/#contacto' },
];

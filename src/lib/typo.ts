/**
 * Tipografía de texto en español: espacios duros (U+00A0) para que nombre y número
 * ("Trinity 2", "Boston 842", "Planta 3", "142 m²", "en 3D") no se corten en dos líneas.
 * Se aplica solo al texto visible (nunca a atributos, URLs ni JSON-LD).
 */
const NBSP = '\u00a0';

// palabra + número: "Trinity 2", "Boston 842", "Planta 3", "Piso 5", "Nivel 16", "Suite 2"
const WORD_NUM = /\b(Trinity|Boston|Planta|Plantas|Piso|Pisos|Nivel|Niveles|Proyecto|Tipolog[ií]as?|Residencias?)\s+(?=\d)/g;
// número + unidad: "142 m²", "2 dormitorios", "16 niveles"
const NUM_UNIT = /(\d)\s+(m²|m2|dormitorios?|dorm\.|baños?|niveles|pisos?|unidades|departamentos|salones|cocheras|residencias|dúplex)(?!\p{L})/gu;
// "en 3D", "Ver en 3D", "Showroom 3D": el 3D no queda solo en la línea
const TO_3D = /\b(en|Showroom|showroom|Plantas?|plantas?)\s+(?=3D\b)/g;
// letra de tipología / unidad suelta: "Suite A", "Loft C", "Familiar G"
const WORD_LETTER = /\b(Suites?|Lofts?|Familiar|Residencias?|Dúplex)\s+(?=[A-G]\b)/g;

// rangos: "142 – 143 m²"
const RANGE = /(\d)\s+([–-])\s+(?=\d)/g;

export function nb(s: string): string {
  return s
    .replace(RANGE, '$1' + NBSP + '$2 ')
    .replace(WORD_NUM, '$1' + NBSP)
    .replace(NUM_UNIT, '$1' + NBSP + '$2')
    .replace(TO_3D, '$1' + NBSP)
    .replace(WORD_LETTER, '$1' + NBSP);
}

/** Reemplaza el número de "Proyecto 0N ·" por la posición real en el orden único. */
export function renumber(html: string, order: number): string {
  return html.replace(/Proyecto\s*\d*\s*·/g, `Proyecto ${String(order).padStart(2, '0')} ·`);
}

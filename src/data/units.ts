/**
 * Unidades disponibles por proyecto. ARCHIVO GENERADO por `scripts/units-from-xlsx.py` desde la lista de
 * precios mensual (Excel de INMO). No editar a mano salvo correcciones puntuales.
 *
 * COMO ACTUALIZAR CADA MES:
 *   1. Guardar el Excel nuevo (una hoja por proyecto, mismo formato).
 *   2. python -I scripts/units-from-xlsx.py "ruta/al/excel.xlsx"   (necesita `pip install openpyxl`)
 *   3. Revisar el resumen que imprime y el diff de src/data/units.ts.
 * Proyectos sin hoja (Trinity 2, Laguna Club) no figuran acá: la sección muestra el aviso "consultá con un asesor".
 *
 * Los PRECIOS y las condiciones comerciales (forma de pago, cochera/baulera) están cargados pero NO se
 * publican mientras `SHOW_PRICES` sea false (src/config/site.ts).
 */

export interface AvailableUnit {
  /** Identificador visible: "C", "A+B", "Piso 5" */
  unidad: string;
  piso?: string;
  /** "3 dormitorios + servicio", "Semipiso 3 dormitorios + servicio" */
  tipologia?: string;
  dormitorios?: number;
  /** m² cubiertos, balcón interno y totales (propios = cubiertos + balcón + cocheras + baulera) */
  m2Cubiertos?: number;
  m2Balcon?: number;
  m2?: number;
  /** Cocheras / bauleras incluidas en el precio */
  cocheras?: number;
  baulera?: number;
  /** "Disponible", "Alquilada", "Unidad modelo..." */
  estado?: string;
  /** Aclaración de la planilla ("Dúplex", "Piso completo") */
  nota?: string;
  /** Precio de contado en USD (número). Solo se muestra con SHOW_PRICES = true */
  precio?: number;
  /** URL del plano (opcional) */
  plano?: string;
}

export interface UnitConditions {
  /** USD */
  cocheraAdicional?: number;
  baulera?: number;
  vigencia?: string;
  formaPago?: string;
  generales?: string;
}

export interface ProjectUnits {
  /** Fecha de la lista (AAAA-MM-DD) */
  updated: string;
  conditions: UnitConditions;
  /** La página del proyecto tiene sección #tipologias: la tipología de cada unidad enlaza ahí */
  tipologiasLink: boolean;
  units: AvailableUnit[];
}


export const UNITS: Record<string, ProjectUnits> = {
  'president-tower': {
    updated: '2026-10-01',
    conditions: {"cocheraAdicional": 40000, "baulera": 10000, "vigencia": "Último día hábil de cada mes. Sujeto a variación de precios sin previo aviso", "formaPago": "Entrega 10% + 30% durante obra (en cuotas) + 60% a la posesión (may-2028)", "generales": "Todos los valores incluyen 2 cocheras."},
    tipologiasLink: true,
    units: [
      {"unidad": "Piso 5", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1255329},
      {"unidad": "Piso 6", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1260411},
      {"unidad": "Piso 8", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1270576},
      {"unidad": "Piso 13", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1295989},
      {"unidad": "Piso 15", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1306154},
      {"unidad": "Piso 17", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1316319},
      {"unidad": "Piso 19", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1326484},
      {"unidad": "Piso 20", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1331566},
      {"unidad": "Piso 21", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1336649},
      {"unidad": "Piso 22", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1341731},
      {"unidad": "Piso 23", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1346814},
      {"unidad": "Piso 25", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 391.92, "m2": 429.42, "cocheras": 2, "estado": "Disponible", "nota": "Piso completo", "precio": 1356979},
    ],
  },
  'the-address': {
    updated: '2026-10-01',
    conditions: {"cocheraAdicional": 40000, "baulera": 10000, "vigencia": "Último día hábil de cada mes. Sujeto a variación de precios sin previo aviso", "formaPago": "Entrega del 30% a la firma del boleto y el saldo financiado en cuotas mensuales iguales", "generales": "Todos los valores incluyen cocheras según tipología. La unidad MODELO incluye muebles empotrados; no incluye electrodomésticos ni decoración."},
    tipologiasLink: true,
    units: [
      {"unidad": "C", "piso": "7", "tipologia": "3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 159.54, "m2Balcon": 27.15, "m2": 215.19, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 653000},
      {"unidad": "D", "piso": "7", "tipologia": "3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 156.71, "m2Balcon": 22.22, "m2": 203.93, "cocheras": 2, "estado": "Disponible", "precio": 620000},
      {"unidad": "A+B", "piso": "7", "tipologia": "Semipiso 3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 272.88, "m2Balcon": 62.88, "m2": 376.76, "cocheras": 3, "baulera": 1, "estado": "Unidad modelo", "precio": 1135000},
      {"unidad": "B", "piso": "9", "tipologia": "2 dormitorios + servicio", "dormitorios": 2, "m2Cubiertos": 143.83, "m2Balcon": 0, "m2": 172.33, "cocheras": 2, "baulera": 1, "estado": "Alquilada", "precio": 530000},
      {"unidad": "A+B", "piso": "13", "tipologia": "Semipiso 3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 272.88, "m2Balcon": 0, "m2": 310.38, "cocheras": 3, "estado": "Disponible", "precio": 994800},
      {"unidad": "A+B", "piso": "15", "tipologia": "Semipiso 3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 272.88, "m2Balcon": 0, "m2": 310.38, "cocheras": 3, "estado": "Alquilada", "precio": 996800},
      {"unidad": "C", "piso": "15", "tipologia": "3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 159.54, "m2Balcon": 0, "m2": 188.04, "cocheras": 2, "baulera": 1, "estado": "Alquilada", "precio": 673000},
      {"unidad": "A+B", "piso": "16", "tipologia": "Semipiso 3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 272.88, "m2Balcon": 0, "m2": 313.88, "cocheras": 3, "baulera": 1, "estado": "Disponible", "precio": 1008800},
      {"unidad": "A+B", "piso": "18", "tipologia": "Semipiso 3 dormitorios + servicio", "dormitorios": 3, "m2Cubiertos": 272.88, "m2Balcon": 0, "m2": 310.38, "cocheras": 3, "estado": "Alquilada", "precio": 999800},
      {"unidad": "D", "piso": "19", "tipologia": "Mega departamento 2 dormitorios", "dormitorios": 2, "m2Cubiertos": 156.71, "m2Balcon": 0, "m2": 181.71, "cocheras": 2, "estado": "Disponible", "precio": 634000},
      {"unidad": "A", "piso": "20", "tipologia": "2 dormitorios + servicio", "dormitorios": 2, "m2Cubiertos": 144.27, "m2Balcon": 0, "m2": 169.27, "cocheras": 2, "estado": "Disponible", "precio": 531000},
      {"unidad": "A", "piso": "21-22", "tipologia": "4 dormitorios + servicio", "dormitorios": 4, "m2Cubiertos": 297.34, "m2Balcon": 0, "m2": 338.34, "cocheras": 3, "baulera": 1, "estado": "Disponible", "nota": "Dúplex", "precio": 1048000},
      {"unidad": "B", "piso": "21-22", "tipologia": "4 dormitorios", "dormitorios": 4, "m2Cubiertos": 284.72, "m2Balcon": 0, "m2": 329.22, "cocheras": 3, "baulera": 2, "estado": "Disponible", "nota": "Dúplex", "precio": 1020000},
    ],
  },
  'boston-842': {
    updated: '2026-10-01',
    conditions: {"cocheraAdicional": 25000, "baulera": 7500, "vigencia": "Último día hábil de cada mes. Sujeto a variación de precios sin previo aviso", "formaPago": "Entrega 30% + saldo financiado en cuotas mensuales iguales", "generales": "Todos los valores incluyen cocheras según tipología. Las unidades MODELO incluyen muebles empotrados; no incluyen electrodomésticos ni decoración."},
    tipologiasLink: true,
    units: [
      {"unidad": "A", "piso": "1", "tipologia": "2 dormitorios - Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 15.34, "m2": 165.3, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 312871},
      {"unidad": "B", "piso": "1", "tipologia": "2 dormitorios - Contra Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 295651},
      {"unidad": "A", "piso": "2", "tipologia": "2 dormitorios - Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Alquilada", "precio": 302566},
      {"unidad": "B", "piso": "2", "tipologia": "2 dormitorios - Contra Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 300264},
      {"unidad": "D", "piso": "2 y 3", "tipologia": "3 dormitorios - Contra Frente", "dormitorios": 3, "m2Cubiertos": 172.72, "m2Balcon": 0, "m2": 213.22, "cocheras": 3, "baulera": 1, "estado": "Disponible", "precio": 436505},
      {"unidad": "A", "piso": "3", "tipologia": "2 dormitorios - Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Unidad modelo, amoblamiento incluido", "precio": 317469},
      {"unidad": "B", "piso": "3", "tipologia": "2 dormitorios - Contra Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Alquilada", "precio": 312467},
      {"unidad": "A", "piso": "4", "tipologia": "2 dormitorios - Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 302268},
      {"unidad": "B", "piso": "4", "tipologia": "2 dormitorios - Contra Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Alquiler temporario, amoblada", "precio": 337566},
      {"unidad": "C", "piso": "4 y 5", "tipologia": "3 dormitorios - Frente", "dormitorios": 3, "m2Cubiertos": 172.72, "m2Balcon": 0, "m2": 213.22, "cocheras": 3, "baulera": 1, "estado": "Disponible", "nota": "Dúplex", "precio": 436074},
      {"unidad": "A", "piso": "5", "tipologia": "2 dormitorios - Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 322768},
      {"unidad": "B", "piso": "5", "tipologia": "2 dormitorios - Contra Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 312157},
      {"unidad": "B", "piso": "7", "tipologia": "2 dormitorios - Contra Frente", "dormitorios": 2, "m2Cubiertos": 121.96, "m2Balcon": 0, "m2": 149.96, "cocheras": 2, "baulera": 1, "estado": "Disponible", "precio": 328073},
    ],
  },
  'marquis': {
    updated: '2026-10-01',
    conditions: {"cocheraAdicional": 15000, "baulera": 5000, "vigencia": "Último día hábil de cada mes. Sujeto a variación de precios sin previo aviso", "formaPago": "Entrega 30% + saldo financiado en cuotas mensuales iguales", "generales": "Los valores corresponden a la unidad y NO incluyen cochera ni baulera (se adquieren por separado a los precios indicados)."},
    tipologiasLink: false,
    units: [
      {"unidad": "D", "piso": "9 · Nivel 12", "tipologia": "2 dormitorios", "dormitorios": 2, "m2Cubiertos": 82.23, "m2Balcon": 0, "m2": 82.23, "cocheras": 0, "estado": "Alquilada", "precio": 156500},
      {"unidad": "C", "piso": "10 · Nivel 13", "tipologia": "2 dormitorios", "dormitorios": 2, "m2Cubiertos": 82.09, "m2Balcon": 0, "m2": 82.09, "cocheras": 0, "estado": "Disponible", "precio": 157500},
      {"unidad": "D", "piso": "11 · Nivel 14", "tipologia": "2 dormitorios", "dormitorios": 2, "m2Cubiertos": 82.23, "m2Balcon": 0, "m2": 82.23, "cocheras": 0, "estado": "Disponible", "precio": 158500},
    ],
  },
  'trinity-3': {
    updated: '2026-10-01',
    conditions: {"cocheraAdicional": 15000, "baulera": 4000, "vigencia": "Último día hábil de cada mes. Sujeto a variación de precios sin previo aviso", "formaPago": "Entrega 30% + saldo financiado en cuotas mensuales iguales", "generales": "Los valores corresponden a la unidad y NO incluyen cochera ni baulera (se adquieren por separado a los precios indicados)."},
    tipologiasLink: true,
    units: [
      {"unidad": "A", "piso": "1 · Nivel 3", "tipologia": "2 dormitorios", "dormitorios": 2, "m2Cubiertos": 75.35, "m2Balcon": 0, "m2": 75.35, "cocheras": 0, "estado": "Disponible", "precio": 126000},
      {"unidad": "A", "piso": "2 · Nivel 4", "tipologia": "2 dormitorios", "dormitorios": 2, "m2Cubiertos": 75.35, "m2Balcon": 0, "m2": 75.35, "cocheras": 0, "estado": "Unidad modelo, amoblamiento incluido", "precio": 137500},
      {"unidad": "A", "piso": "4 · Nivel 6", "tipologia": "2 dormitorios", "dormitorios": 2, "m2Cubiertos": 75.35, "m2Balcon": 0, "m2": 75.35, "cocheras": 0, "estado": "Disponible", "precio": 129000},
    ],
  },
};

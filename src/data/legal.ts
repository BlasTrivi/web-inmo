/**
 * Textos legales (Términos y condiciones, Política de privacidad, Política de cookies).
 *
 * >>> BORRADOR: debe revisarlo un abogado (derecho paraguayo y, si corresponde, europeo) antes de publicar. <<<
 *
 * Reglas con las que se escribió:
 *  - La identidad de la empresa sale de `site.ts`.
 *  - La normativa paraguaya se cita solo en términos generales ("la normativa vigente de la República del
 *    Paraguay en materia de protección de datos personales y defensa del consumidor"): NO se citan números
 *    de ley porque no se verificaron. Un abogado puede completarlos.
 *  - Los hechos técnicos (qué se guarda en el navegador, qué terceros se cargan) se verificaron en el código.
 *
 * TODO-CLIENTE (pendientes de datos del cliente):
 *  - RUC y datos registrales de INMO Group SA (`LEGAL_ID.ruc`; si se completa, aparece en los textos).
 *  - Proveedor de hosting y su ubicación (hoy figura de forma genérica; el hosting está pendiente de definir).
 *  - Correo o responsable específico para datos personales (hoy: el correo general de recepción).
 *  - Plazos de conservación de consultas y contactos comerciales.
 *  - Si se envían comunicaciones comerciales (newsletter, promociones) y con qué consentimiento.
 */
import { SITE, LEGAL } from '../config/site';

/** TODO-CLIENTE: completar RUC y datos registrales; vacío = no se muestra. */
export const LEGAL_ID = { ruc: '' };

export interface LegalSection {
  id: string;
  title: string;
  /** HTML ya listo (párrafos, listas, tablas) */
  html: string;
}

export interface LegalDoc {
  slug: 'terminos' | 'privacidad' | 'cookies';
  path: string;
  title: string;
  /** <title> (sin sufijo) */
  seoTitle: string;
  description: string;
  lead: string;
  sections: LegalSection[];
}

const A = SITE.address;
const addr = `${A.street}, ${A.locality}, ${A.countryName}`;
const mail = `<a href="mailto:${SITE.email}">${SITE.email}</a>`;
const wa = `<a href="${SITE.whatsapp}" target="_blank" rel="noopener">${SITE.phoneDisplay}</a>`;
const ruc = LEGAL_ID.ruc ? ` (RUC ${LEGAL_ID.ruc})` : '';
const who = `${SITE.legalName}${ruc}, que opera la marca ${SITE.name}`;
const laws = 'la normativa vigente de la República del Paraguay en materia de protección de datos personales y defensa del consumidor';

const contactList = `<ul>
<li><strong>Empresa:</strong> ${SITE.legalName} (${SITE.name})</li>
<li><strong>Domicilio:</strong> ${addr}</li>
<li><strong>Correo:</strong> ${mail}</li>
<li><strong>WhatsApp:</strong> ${wa}</li>
</ul>`;

// ---------------------------------------------------------------------------------------------
// Términos y condiciones de uso
// ---------------------------------------------------------------------------------------------
const terminos: LegalDoc = {
  slug: 'terminos',
  path: '/terminos/',
  title: 'Términos y condiciones de uso',
  seoTitle: 'Términos y condiciones de uso',
  description: `Términos y condiciones de uso del sitio de ${SITE.name}: alcance de la información de los proyectos, imágenes ilustrativas, propiedad intelectual, responsabilidad y ley aplicable.`,
  lead: `Reglas de uso de este sitio y alcance de la información que publicamos sobre nuestros proyectos.`,
  sections: [
    {
      id: 'quienes-somos',
      title: 'Quiénes somos y aceptación',
      html: `<p>Este sitio web (${SITE.url.replace(/^https?:\/\//, '')}) es operado por ${who}, con domicilio en ${addr}.</p>
<p>Al navegar por el sitio o usar sus funciones (por ejemplo, el formulario de contacto o el botón de WhatsApp) aceptás estos términos. Si no estás de acuerdo, te pedimos que no lo utilices.</p>`,
    },
    {
      id: 'uso-del-sitio',
      title: 'Uso del sitio',
      html: `<p>Podés usar el sitio para informarte sobre nuestros proyectos y comunicarte con nosotros. Te comprometés a:</p>
<ul>
<li>usarlo de forma lícita y de buena fe;</li>
<li>no intentar acceder sin autorización a sus sistemas, ni interferir en su funcionamiento o seguridad;</li>
<li>no usar sistemas automáticos para copiar su contenido de manera masiva;</li>
<li>no suplantar a otra persona ni dar datos falsos al contactarnos.</li>
</ul>`,
    },
    {
      id: 'informacion-de-proyectos',
      title: 'Información de los proyectos',
      html: `<p>El contenido del sitio sobre los proyectos (textos, superficies, plantas, amenities, estado y demás datos) es <strong>informativo</strong>. En particular:</p>
<ul>
<li><strong>Imágenes ilustrativas.</strong> Los renders, recreaciones, plantas amobladas y fotografías de proyectos en obra son referenciales. El resultado final puede variar en terminaciones, mobiliario, vegetación, vistas y entorno.</li>
<li><strong>Superficies y medidas.</strong> Se indican según la documentación del proyecto y pueden tener variaciones. Las medidas definitivas son las que figuren en el contrato y en los planos aprobados.</li>
<li><strong>Precios, disponibilidad y financiación.</strong> Están sujetos a cambios sin previo aviso y a confirmación por parte de ${SITE.name}. La disponibilidad de una unidad se confirma recién por escrito.</li>
<li><strong>Estado de los proyectos.</strong> Las etiquetas como “Nuevo lanzamiento”, “Últimas unidades”, “100% vendido” o “Próximamente” reflejan la información disponible a la fecha de publicación y pueden cambiar.</li>
</ul>
<p><strong>Nada de lo publicado en este sitio constituye una oferta vinculante</strong> ni una promesa de venta. Toda operación se formaliza únicamente mediante el instrumento escrito que firmen las partes.</p>`,
    },
    {
      id: 'contacto-y-whatsapp',
      title: 'Formulario de contacto y WhatsApp',
      html: `<p>El formulario de la página de inicio arma un mensaje con los datos que escribís y abre WhatsApp para que lo envíes vos. Hasta que no lo enviés desde WhatsApp, no recibimos nada. El botón flotante de WhatsApp funciona de la misma manera.</p>
<p>Enviar una consulta no genera reserva, compromiso de compra ni obligación para ninguna de las partes. El uso de WhatsApp se rige además por los términos y la política de privacidad de WhatsApp (Meta). Cómo tratamos tus datos está explicado en la <a href="/privacidad/">Política de privacidad</a>.</p>`,
    },
    {
      id: 'terceros',
      title: 'Contenido y servicios de terceros',
      html: `<p>El sitio incluye enlaces y contenidos de terceros, como el showroom virtual 3D (alojado en <em>urbania3d.app</em>), mapas y nuestras redes sociales. No controlamos esos sitios, no somos responsables de su contenido ni de sus políticas, y su uso se rige por sus propias condiciones.</p>`,
    },
    {
      id: 'propiedad-intelectual',
      title: 'Propiedad intelectual',
      html: `<p>Los textos, fotografías, renders, planos, logotipos, marcas, diseños y demás contenidos del sitio pertenecen a ${SITE.legalName} o a quienes nos autorizaron a usarlos, y están protegidos por la normativa de propiedad intelectual aplicable. Está prohibido reproducirlos, modificarlos, distribuirlos o usarlos con fines comerciales sin autorización escrita previa.</p>
<p>Podés compartir los enlaces del sitio y las páginas de las Notas con fines personales y no comerciales, citando la fuente.</p>`,
    },
    {
      id: 'notas',
      title: 'Notas y contenido editorial',
      html: `<p>Las publicaciones de la sección <a href="/notas/">Notas</a> tienen fines informativos y de divulgación. No constituyen asesoramiento legal, financiero, contable ni de inversión. Antes de tomar una decisión de compra o inversión, te recomendamos consultar con profesionales independientes.</p>`,
    },
    {
      id: 'responsabilidad',
      title: 'Limitación de responsabilidad',
      html: `<p>Hacemos un esfuerzo razonable para que la información del sitio sea correcta y esté actualizada, pero no garantizamos que esté libre de errores ni que el sitio funcione sin interrupciones. En la medida permitida por la ley, ${SITE.legalName} no responde por daños derivados del uso del sitio o de decisiones tomadas solo en base a su contenido.</p>
<p>Nada de lo dispuesto en estos términos limita los derechos que ${laws} te reconoce como consumidor y que no pueden ser renunciados.</p>`,
    },
    {
      id: 'datos-y-cookies',
      title: 'Datos personales y cookies',
      html: `<p>El tratamiento de datos personales se explica en la <a href="/privacidad/">Política de privacidad</a> y el uso de cookies y almacenamiento local en la <a href="/cookies/">Política de cookies</a>. Ambas forman parte de estos términos.</p>`,
    },
    {
      id: 'cambios',
      title: 'Cambios en los términos',
      html: `<p>Podemos actualizar estos términos cuando sea necesario, por ejemplo por cambios en el sitio o en la normativa. La versión vigente es la publicada en esta página, con su fecha de última actualización (${LEGAL.updatedLabel}). El uso del sitio después de un cambio implica su aceptación.</p>`,
    },
    {
      id: 'ley-aplicable',
      title: 'Ley aplicable y jurisdicción',
      html: `<p>Estos términos se rigen por las leyes de la República del Paraguay. Para cualquier controversia relacionada con el sitio, las partes se someten a los tribunales competentes de la ciudad de Asunción, sin perjuicio de los derechos que ${laws} reconozca al consumidor para acudir a otras vías o foros.</p>`,
    },
    {
      id: 'contacto',
      title: 'Contacto',
      html: `<p>Para consultas sobre estos términos:</p>${contactList}`,
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Política de privacidad y protección de datos
// ---------------------------------------------------------------------------------------------
const privacidad: LegalDoc = {
  slug: 'privacidad',
  path: '/privacidad/',
  title: 'Política de privacidad y protección de datos',
  seoTitle: 'Política de privacidad y protección de datos',
  description: `Política de privacidad de ${SITE.name}: qué datos personales tratamos, para qué, con qué base legal, cuánto tiempo, con quién los compartimos y cómo ejercer tus derechos.`,
  lead: `Qué datos personales tratamos cuando usás este sitio o nos escribís, para qué los usamos y qué derechos tenés.`,
  sections: [
    {
      id: 'responsable',
      title: 'Responsable del tratamiento',
      html: `<p>El responsable del tratamiento de tus datos personales es ${who}.</p>${contactList}
<p>Para cualquier consulta o solicitud sobre tus datos escribinos a ${mail}.</p>`,
    },
    {
      id: 'principios',
      title: 'Principios que seguimos',
      html: `<p>Tratamos los datos personales conforme a ${laws}, y alineamos nuestras prácticas con los principios del Reglamento General de Protección de Datos de la Unión Europea (RGPD) para atender a visitantes internacionales:</p>
<ul>
<li>licitud, lealtad y transparencia;</li>
<li>limitación de la finalidad: solo usamos los datos para lo que te explicamos acá;</li>
<li>minimización: pedimos lo mínimo necesario;</li>
<li>exactitud y actualización;</li>
<li>limitación del plazo de conservación;</li>
<li>integridad y confidencialidad.</li>
</ul>`,
    },
    {
      id: 'datos-que-recopilamos',
      title: 'Qué datos recopilamos',
      html: `<table>
<caption class="vh">Datos que tratamos y su origen</caption>
<thead><tr><th scope="col">Situación</th><th scope="col">Datos</th></tr></thead>
<tbody>
<tr><th scope="row">Formulario de contacto</th><td>Nombre, teléfono (opcional), proyecto de interés y mensaje. <strong>Estos datos no se envían a nuestros servidores:</strong> se usan en tu navegador para armar un mensaje de WhatsApp que enviás vos.</td></tr>
<tr><th scope="row">WhatsApp</th><td>Tu número de teléfono, el nombre de tu perfil y el contenido de los mensajes que nos enviás, tanto desde el formulario como desde el botón flotante o los enlaces del sitio.</td></tr>
<tr><th scope="row">Correo electrónico</th><td>Tu dirección y el contenido de los mensajes que nos escribas.</td></tr>
<tr><th scope="row">Preferencias de cookies</th><td>Tu elección de cookies, guardada en el almacenamiento local de tu navegador (ver <a href="/cookies/">Política de cookies</a>).</td></tr>
<tr><th scope="row">Datos técnicos</th><td>Como en cualquier sitio web, el proveedor de hosting puede registrar datos técnicos de la conexión (dirección IP, navegador, fecha y hora, páginas pedidas) por seguridad y funcionamiento.</td></tr>
</tbody></table>
<p>No solicitamos datos sensibles (salud, religión, ideología, origen étnico, etc.). Te pedimos que no los incluyas en tus mensajes.</p>`,
    },
    {
      id: 'finalidades',
      title: 'Para qué los usamos y base legal',
      html: `<table>
<caption class="vh">Finalidades y bases legales</caption>
<thead><tr><th scope="col">Finalidad</th><th scope="col">Base legal</th></tr></thead>
<tbody>
<tr><th scope="row">Responder tus consultas sobre proyectos, unidades, visitas y financiación</th><td>Tu consentimiento al contactarnos y la aplicación de medidas precontractuales a tu pedido.</td></tr>
<tr><th scope="row">Gestionar la relación comercial si avanzás con una compra o reserva</th><td>Ejecución del contrato y de sus medidas previas.</td></tr>
<tr><th scope="row">Mantener la seguridad y el buen funcionamiento del sitio</th><td>Interés legítimo de ${SITE.legalName}, ponderado con tus derechos.</td></tr>
<tr><th scope="row">Recordar tu elección de cookies</th><td>Necesidad técnica para cumplir tu decisión.</td></tr>
<tr><th scope="row">Cumplir obligaciones legales, contables y fiscales, y defendernos ante reclamos</th><td>Obligación legal e interés legítimo.</td></tr>
</tbody></table>
<p>No tomamos decisiones automatizadas que produzcan efectos jurídicos sobre vos, ni vendemos tus datos. Si en el futuro enviamos comunicaciones comerciales (por ejemplo novedades de lanzamientos), lo haremos con tu consentimiento previo y podrás retirarlo en cualquier momento.</p>`,
    },
    {
      id: 'destinatarios',
      title: 'Con quién compartimos los datos',
      html: `<p>Solo compartimos datos cuando es necesario y con quienes ofrecen garantías adecuadas:</p>
<ul>
<li><strong>WhatsApp (Meta Platforms).</strong> Cuando nos escribís por WhatsApp, Meta procesa el mensaje según sus propias condiciones. Nosotros no controlamos ese tratamiento.</li>
<li><strong>Proveedor de hosting y de red de distribución del sitio.</strong> Para que el sitio esté disponible.</li>
<li><strong>Urbania3D (urbania3d.app).</strong> Proveedor del showroom virtual 3D. Su contenido se carga en tu navegador solo si lo permitís (categoría “Contenido de terceros”); en ese caso puede recibir datos técnicos como tu dirección IP.</li>
<li><strong>Asesores profesionales</strong> (legales, contables) y <strong>autoridades</strong> cuando la ley lo exija.</li>
<li><strong>Personal y colaboradores de ${SITE.name}</strong> que gestionan tu consulta, sujetos a deber de confidencialidad.</li>
</ul>`,
    },
    {
      id: 'transferencias',
      title: 'Transferencias internacionales',
      html: `<p>Algunos de los proveedores mencionados (por ejemplo WhatsApp/Meta o el proveedor de hosting) pueden tratar datos en servidores ubicados fuera de Paraguay, incluidos Estados Unidos y otros países. Cuando ocurre, procuramos trabajar con proveedores que ofrezcan garantías adecuadas (como cláusulas contractuales o certificaciones reconocidas) y cumplir los requisitos que ${laws} establezca para esas transferencias. Si te encontrás en la Unión Europea o el Espacio Económico Europeo, las transferencias fuera de esas regiones se apoyan en las garantías previstas por el RGPD.</p>`,
    },
    {
      id: 'conservacion',
      title: 'Cuánto tiempo conservamos los datos',
      html: `<ul>
<li><strong>Consultas y contactos:</strong> el tiempo necesario para atenderlos y, luego, el que exijan obligaciones legales o la defensa de eventuales reclamos. Después los eliminamos o anonimizamos.</li>
<li><strong>Relación comercial:</strong> durante la vigencia del contrato y durante los plazos legales posteriores.</li>
<li><strong>Preferencias de cookies:</strong> hasta ${LEGAL.consentMonths} meses o hasta que cambies tu elección.</li>
<li><strong>Registros técnicos del hosting:</strong> según la política del proveedor y por períodos acotados.</li>
</ul>
<!-- TODO-CLIENTE: definir y completar los plazos concretos de conservación de consultas y contactos comerciales -->`,
    },
    {
      id: 'derechos',
      title: 'Tus derechos y cómo ejercerlos',
      html: `<p>Podés ejercer en cualquier momento los siguientes derechos sobre tus datos personales:</p>
<ul>
<li><strong>Acceso:</strong> saber qué datos tuyos tratamos y recibir una copia.</li>
<li><strong>Rectificación y actualización:</strong> corregir datos inexactos o incompletos.</li>
<li><strong>Supresión (cancelación):</strong> pedir que eliminemos tus datos cuando ya no sean necesarios o retires tu consentimiento.</li>
<li><strong>Oposición:</strong> oponerte a ciertos tratamientos, en especial a los basados en interés legítimo o con fines comerciales.</li>
<li><strong>Limitación:</strong> pedir que suspendamos temporalmente el tratamiento en los casos previstos por la ley.</li>
<li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y de uso común.</li>
<li><strong>Retirar tu consentimiento</strong> cuando el tratamiento se base en él, sin afectar lo hecho antes.</li>
</ul>
<p>Para ejercerlos, escribinos a ${mail} indicando tu nombre, el derecho que querés ejercer y un medio para responderte. Podemos pedirte que acredites tu identidad. Respondemos dentro de los plazos que fije la normativa aplicable.</p>
<p>Si considerás que no atendimos correctamente tu solicitud, podés presentar un reclamo ante la autoridad competente en Paraguay o, si residís en la Unión Europea o el Espacio Económico Europeo, ante tu autoridad de control.</p>`,
    },
    {
      id: 'menores',
      title: 'Menores de edad',
      html: `<p>El sitio está dirigido a personas mayores de 18 años y no recopilamos intencionalmente datos de menores. Si sos madre, padre o tutor y creés que un menor nos envió datos, escribinos a ${mail} y los eliminaremos.</p>`,
    },
    {
      id: 'seguridad',
      title: 'Seguridad',
      html: `<p>Aplicamos medidas técnicas y organizativas razonables para proteger los datos: el sitio se sirve por conexión cifrada (HTTPS), es un sitio estático que no tiene base de datos propia con datos de visitantes, y limitamos el acceso a la información a quienes la necesitan. Aun así, ningún sistema es completamente seguro; si detectás un problema de seguridad, avisanos a ${mail}.</p>`,
    },
    {
      id: 'cookies',
      title: 'Cookies y tecnologías similares',
      html: `<p>El sitio no carga herramientas de analítica ni de publicidad de terceros, y los showrooms 3D de terceros solo se cargan con tu permiso. Guarda en tu navegador solo lo necesario para funcionar y recordar tu elección de cookies. Encontrás el detalle, y cómo cambiar tus preferencias, en la <a href="/cookies/">Política de cookies</a>.</p>`,
    },
    {
      id: 'enlaces',
      title: 'Enlaces a otros sitios',
      html: `<p>Este sitio enlaza a redes sociales, mapas, WhatsApp y al showroom 3D. Cada uno trata los datos según su propia política; te recomendamos leerlas.</p>`,
    },
    {
      id: 'cambios',
      title: 'Cambios en esta política',
      html: `<p>Podemos actualizar esta política por cambios en el sitio, en nuestros proveedores o en la normativa. La versión vigente es la publicada acá, con su fecha de última actualización (${LEGAL.updatedLabel}).</p>`,
    },
    {
      id: 'ley-aplicable',
      title: 'Ley aplicable y jurisdicción',
      html: `<p>Esta política se rige por las leyes de la República del Paraguay y, para el tratamiento de datos de residentes de la Unión Europea, por las disposiciones del RGPD que resulten imperativamente aplicables. Para cualquier controversia, las partes se someten a los tribunales competentes de Asunción, sin perjuicio de los derechos irrenunciables que te correspondan.</p>`,
    },
    {
      id: 'contacto',
      title: 'Contacto',
      html: `<p>Para consultas sobre privacidad o para ejercer tus derechos:</p>${contactList}`,
    },
  ],
};

// ---------------------------------------------------------------------------------------------
// Política de cookies
// ---------------------------------------------------------------------------------------------
const cookies: LegalDoc = {
  slug: 'cookies',
  path: '/cookies/',
  title: 'Política de cookies',
  seoTitle: 'Política de cookies',
  description: `Política de cookies de ${SITE.name}: qué guarda este sitio en tu navegador, qué terceros intervienen y cómo cambiar tu elección en cualquier momento.`,
  lead: `Qué guarda este sitio en tu navegador, qué terceros intervienen y cómo cambiar tu elección.`,
  sections: [
    {
      id: 'que-son',
      title: 'Qué son las cookies',
      html: `<p>Las cookies son pequeños archivos que un sitio guarda en tu navegador. Existen tecnologías parecidas, como el almacenamiento local (<em>localStorage</em>) y de sesión (<em>sessionStorage</em>), que cumplen funciones similares. En esta política las llamamos, en conjunto, “cookies”.</p>`,
    },
    {
      id: 'que-usa-el-sitio',
      title: 'Qué usa este sitio hoy',
      html: `<p>Este sitio <strong>no carga herramientas de analítica ni de publicidad</strong>, no instala cookies de seguimiento propias y solo carga contenido de terceros (el showroom 3D) con tu permiso. Para funcionar usa el almacenamiento de tu navegador para lo siguiente (lo que cargue Urbania3D, si lo permitís, se explica más abajo):</p>
<table>
<caption class="vh">Elementos guardados en tu navegador</caption>
<thead><tr><th scope="col">Nombre</th><th scope="col">Tipo</th><th scope="col">Para qué sirve</th><th scope="col">Duración</th></tr></thead>
<tbody>
<tr><th scope="row"><code>inmo-consent</code></th><td>Necesaria · localStorage</td><td>Recordar tu elección sobre cookies (versión, fecha y categorías aceptadas, incluida la de contenido de terceros).</td><td>Hasta ${LEGAL.consentMonths} meses o hasta que la cambies.</td></tr>
<tr><th scope="row"><code>inmo-pre</code></th><td>Necesaria · sessionStorage</td><td>Saber que ya viste la animación de entrada de la página de inicio, para no repetirla.</td><td>Hasta que cerrás la pestaña.</td></tr>
<tr><th scope="row"><code>inmo-curtain</code></th><td>Necesaria · sessionStorage</td><td>Continuar la transición visual al pasar de una página a otra del sitio.</td><td>Hasta que cerrás la pestaña.</td></tr>
</tbody></table>`,
    },
    {
      id: 'terceros',
      title: 'Terceros',
      html: `<ul>
<li><strong>Showroom virtual 3D.</strong> Algunas páginas muestran un recorrido 3D alojado por Urbania3D (<em>urbania3d.app</em>). <strong>No se carga hasta que lo permitís</strong>: mientras no aceptes la categoría “Contenido de terceros”, en su lugar ves un aviso con el botón “Cargar showroom 3D” y un enlace para abrirlo en una pestaña nueva. Una vez cargado, ese proveedor puede recibir datos técnicos (como tu dirección IP) y establecer sus propias cookies, regidas por su política.</li>
<li><strong>Enlaces externos.</strong> WhatsApp, redes sociales y mapas se abren en sitios de terceros solo cuando hacés clic en un enlace.</li>
</ul>`,
    },
    {
      id: 'categorias',
      title: 'Categorías y tu elección',
      html: `<p>Al ingresar te mostramos un aviso para que elijas. Las categorías son:</p>
<ul>
<li><strong>Necesarias:</strong> imprescindibles para el funcionamiento del sitio. Están siempre activas.</li>
<li><strong>Contenido de terceros:</strong> showrooms 3D de Urbania3D y otros contenidos externos que pueden usar sus propias cookies. Solo se cargan si activás esta categoría o tocás “Cargar showroom 3D”; podés desactivarla cuando quieras y el contenido se descarga.</li>
<li><strong>Analíticas:</strong> servirían para medir cómo se usa el sitio y mejorarlo. <em>Hoy no hay ninguna instalada.</em></li>
<li><strong>Marketing:</strong> servirían para publicidad y medición de campañas. <em>Hoy no hay ninguna instalada.</em></li>
</ul>
<p>Las categorías de contenido de terceros, analíticas y de marketing están desactivadas por defecto. “Aceptar” activa todas las categorías (incluido el contenido de terceros) y “Rechazar” las deja todas apagadas. Si en el futuro incorporamos alguna herramienta, solo se activará si la aceptás, y actualizaremos esta política. Rechazar es tan fácil como aceptar y no limita el uso del sitio.</p>`,
    },
    {
      id: 'cambiar-eleccion',
      title: 'Cómo cambiar tu elección',
      html: `<p>Podés cambiar o retirar tu consentimiento cuando quieras desde el enlace <strong>Preferencias de cookies</strong> que está al pie de todas las páginas, o con este botón (ahí podés activar o desactivar “Contenido de terceros”, lo que carga o descarga los showrooms 3D):</p>
<p><button type="button" class="legal-btn" data-cookie-prefs>Abrir preferencias de cookies</button></p>
<p>También podés borrar los datos del sitio desde la configuración de tu navegador. Si lo hacés, volveremos a preguntarte tu elección.</p>`,
    },
    {
      id: 'cambios',
      title: 'Cambios en esta política',
      html: `<p>Podemos actualizarla cuando cambien las tecnologías que usa el sitio o la normativa. La versión vigente es la publicada acá, con su fecha de última actualización (${LEGAL.updatedLabel}). Si el cambio es relevante, volveremos a pedir tu elección.</p>`,
    },
    {
      id: 'contacto',
      title: 'Contacto',
      html: `<p>Para consultas sobre esta política, o sobre cómo tratamos tus datos, mirá la <a href="/privacidad/">Política de privacidad</a> o escribinos:</p>${contactList}`,
    },
  ],
};

export const legalDocs: Record<LegalDoc['slug'], LegalDoc> = { terminos, privacidad, cookies };
export const legalList: LegalDoc[] = [terminos, privacidad, cookies];

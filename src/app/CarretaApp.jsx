import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Box, Plus, Truck, ChevronDown, MapPin, Weight,
  Calendar, HelpCircle, Sprout, Package, MessageCircle, Check, X, CheckCircle2,
  Wrench, ShoppingCart,
} from "lucide-react";




// Localidades de Argentina (CP, Provincia, Localidad). Subconjunto para la demo;
// en producción se usa codigos_postales.json completo (23.071 filas) o un endpoint.
const PROVINCIAS = [
  "Buenos Aires","Capital Federal","Catamarca","Chaco","Chubut","Cordoba",
  "Corrientes","Entre Rios","Formosa","Jujuy","La Pampa","La Rioja",
  "Mendoza","Misiones","Neuquen","Rio Negro","Salta","San Juan",
  "San Luis","Santa Cruz","Santa Fe","Santiago Del Estero",
  "Tierra Del Fuego","Tucuman"
];


/**
 * Carreta — Prototipo unificado (MVP)
 * Flujo: Ingreso (rol) → Panel → Detalle de pedido/servicio/solicitud.
 * Roles: Productor (flete + ver servicios), Transportista (ofertas de flete),
 *         Contratista (publica maquinaria), Comercio (ve solicitudes de repuestos/insumos).
 * Alcance MVP: sin pagos in-app, sin GPS, sin ratings. Precio final se coordina
 * por fuera (teléfono / WhatsApp). Datos mock en estado, listos para enchufar a la API.
 */

const ROLES = {
  productor: {
    accent: "#16a34a", soft: "#dcfce7", Icon: Sprout,
    title: "Panel del Productor", user: "María González", initials: "MG",
    tabs: [
      { id: "pedidos", label: "Mis Pedidos", icon: Box },
      { id: "crear", label: "Crear Pedido", icon: Plus },
      { id: "servicios", label: "Servicios", icon: Wrench },
      { id: "solicitudes", label: "Repuestos", icon: ShoppingCart },
      { id: "presupuestos", label: "Presupuestos", icon: Package },
      { id: "historial", label: "Historial", icon: CheckCircle2 },
    ],
  },
  transportista: {
    accent: "#2563eb", soft: "#dbeafe", Icon: Truck,
    title: "Panel del Transportista", user: "Carlos Méndez", initials: "CM",
    tabs: [
      { id: "disponibles", label: "Pedidos Disponibles", icon: Box },
      { id: "mispedidos", label: "Mis Pedidos", icon: Truck },
      { id: "solicitudes", label: "Repuestos", icon: ShoppingCart },
      { id: "historial", label: "Historial", icon: CheckCircle2 },
    ],
  },
  contratista: {
    accent: "#d97706", soft: "#fef3c7", Icon: Wrench,
    title: "Panel del Contratista", user: "Roberto Campos", initials: "RC",
    tabs: [
      { id: "misservicios", label: "Mis Servicios", icon: Wrench },
      { id: "crearservicio", label: "Publicar", icon: Plus },
      { id: "solicitudes", label: "Repuestos", icon: ShoppingCart },
    ],
  },
  comercio: {
    accent: "#dc2626", soft: "#fee2e2", Icon: ShoppingCart,
    title: "Panel del Comercio", user: "Agro Repuestos SRL", initials: "AR",
    tabs: [
      { id: "solicitudes", label: "Solicitudes", icon: ShoppingCart },
      { id: "presupuestos", label: "Presupuestos", icon: Package },
    ],
  },
};


// Actividades y tipos de carga
const ME_TRANSPORTISTA = "Carlos Méndez";
const ME_CONTRATISTA = "Roberto Campos";
const ME_COMERCIO = "Agro Repuestos SRL";

const ACTIVIDADES = [
  { id: "agricola", label: "Agrícola", emoji: "🌾" },
  { id: "ganadero", label: "Ganadero", emoji: "🐄" },
];
const CARGO_AGRO = ["Soja", "Trigo", "Maíz", "Sorgo", "Cebada", "Avena", "Girasol", "Maní", "Expeller", "MAP", "Urea", "Otros"];
const CARGO_GANADERO = ["Terneros", "Terneras", "Novillitos", "Novillos", "Vaquillonas", "Vacas", "Vacas con cría", "Toros", "Otros"];
const HACIENDA_CATS = ["Terneros", "Terneras", "Novillitos", "Novillos", "Vaquillonas", "Vacas", "Vacas con cría", "Toros", "Otros"];
const ACT_LABELS = {
  agricola: { unit: "kg", unitLabel: "Total a enviar (kg)", vehiculo: "camiones", vehiculoLabel: "Camiones", badge: { bg: "#dcfce7", c: "#166534", t: "Agrícola" } },
  ganadero: { unit: "cab", unitLabel: "Cantidad de cabezas", vehiculo: "jaulas", vehiculoLabel: "Jaulas", badge: { bg: "#fef3c7", c: "#92400e", t: "Ganadero" } },
};
// Categorías para presupuestos formales
const PRESUPUESTO_CATS = {
  agricola: ["Agroquímicos", "Semillas", "Fertilizantes", "Silobolsa", "Otro"],
  ganadero: ["Productos Veterinarios", "Suplementos Dietarios", "Alimentos Balanceados", "Caravanas / Identificación", "Otro"],
  general: ["Repuestos", "Combustible", "Lubricantes", "Otro"],
};

const INITIAL_ORDERS = [];


const SERVICE_TYPES = ["Cosechadora", "Sembradora", "Tractor", "Fumigadora", "Embolsadora", "Rotoenfardadora", "Mixer", "Otro"];
const URGENCIAS = [
  { id: "urgente", label: "Urgente", bg: "#fee2e2", c: "#991b1b" },
  { id: "normal", label: "Normal", bg: "#fef3c7", c: "#92400e" },
  { id: "puede_esperar", label: "Puede esperar", bg: "#f3f4f6", c: "#6b7280" },
];

const INITIAL_SERVICES = [
  { id: 201, tipo: "Cosechadora", descripcion: "John Deere S770 con plataforma sojera 35 pies. Disponible para campaña gruesa.", localidad: "Venado Tuerto", provincia: "Santa Fe", lat: -33.7497, lng: -61.9669, precio: "USD 18/ha", disponibilidad: "Inmediata", owner: "Roberto Campos" },
  { id: 202, tipo: "Sembradora", descripcion: "Apache 27000 de 16 surcos a 52.5 cm con fertilización. Monitor de siembra incluido.", localidad: "Pergamino", provincia: "Buenos Aires", lat: -33.9023, lng: -60.5473, precio: "A convenir", disponibilidad: "A partir del 15/06", owner: "Roberto Campos" },
  { id: 203, tipo: "Fumigadora", descripcion: "Pla Map II 3200 litros, botalón 28 m, piloto automático.", localidad: "Rufino", provincia: "Santa Fe", lat: -34.2667, lng: -62.7, precio: "USD 6/ha", disponibilidad: "Inmediata", owner: "Servicios Agro Sur" },
  { id: 204, tipo: "Tractor", descripcion: "Case IH Magnum 340 con piloto automático. Disponible con chofer.", localidad: "Córdoba Capital", provincia: "Cordoba", lat: -31.425, lng: -64.175, precio: "A convenir", disponibilidad: "Inmediata", owner: "Maquinarias del Centro" },
  { id: 205, tipo: "Embolsadora", descripcion: "Richiger R1050 para silo bolsa de 9 pies. Con tractor y operario.", localidad: "San Nicolás de los Arroyos", provincia: "Buenos Aires", lat: -33.3303, lng: -60.2269, precio: "$650.000/día", disponibilidad: "Consultar", owner: "Roberto Campos" },
];

const INITIAL_SOLICITUDES = [];

const INITIAL_PRESUPUESTOS = [];

// Helpers de pedido (1 origen + ofertas por todo el pedido)
const orderStatus = (o) => {
  if (o.estado === "cancelado") return "Cancelado";
  if (o.estado === "pausado") return "Pausado";
  if (o.incidencia) return "Contingencia";
  if (o.recepcion) return "Finalizado";
  if (o.entrega) return "Entregado";
  return (o.offers || []).some((of) => of.status === "aceptada") ? "Confirmado" : "Pendiente";
};
const isOpen = (o) => orderStatus(o) === "Pendiente";
const nearestDist = (o, base) => distKm(base, o);

// Vista del transportista sobre un pedido
const myOffersIn = (o) => (o.offers || []).filter((of) => of.by === ME_TRANSPORTISTA);
const myJobState = (o) => {
  const offs = myOffersIn(o);
  if (offs.some((of) => of.status === "aceptada")) return "ganado";
  if (offs.some((of) => of.status === "enviada")) return "enjuego";
  return "perdido";
};

const STATUS = {
  Pendiente: { bg: "#fef3c7", color: "#92400e" },
  Confirmado: { bg: "#dcfce7", color: "#166534" },
  Pausado: { bg: "#e0e7ff", color: "#4338ca" },
  Cancelado: { bg: "#f3f4f6", color: "#6b7280" },
  Contingencia: { bg: "#fee2e2", color: "#991b1b" },
  Entregado: { bg: "#dbeafe", color: "#1d4ed8" },
  Finalizado: { bg: "#dcfce7", color: "#166534" },
};

const CONTINGENCIA_MOTIVOS = ["Problema mecánico", "Problema en ruta", "Problema climático", "Problema en destino", "Problema con la carga", "Otro"];
// Validación de dominio/patente argentina (nuevo: AA123BB, viejo: AAA123)
const normDom = (d) => d.toUpperCase().replace(/[\s\-\.]/g, "");
const validDominio = (d) => { const c = normDom(d); return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(c) || /^[A-Z]{3}\d{3}$/.test(c); };
const formatDominio = (d) => { const c = normDom(d); if (/^[A-Z]{2}\d{3}[A-Z]{2}$/.test(c)) return c.slice(0,2)+' '+c.slice(2,5)+' '+c.slice(5); if (/^[A-Z]{3}\d{3}$/.test(c)) return c.slice(0,3)+' '+c.slice(3); return c; };

const docLabel = (act) => act === "ganadero" ? { short: "DT-e/Guía", full: "DT-e / Guía de Traslado", org: "SENASA" } : { short: "CPE", full: "Carta de Porte Electrónica (CPE)", org: "ARCA" };
const semiLabel = (act) => act === "ganadero" ? "jaula" : "acoplado/tolva";
// Validación y formateo de CUIT (XX-XXXXXXXX-X)
const normCuit = (c) => c.replace(/[\s\-\.]/g, "");
const validCuit = (c) => /^\d{11}$/.test(normCuit(c));
const formatCuit = (c) => { const n = normCuit(c); return n.length === 11 ? n.slice(0, 2) + "-" + n.slice(2, 10) + "-" + n.slice(10) : n; };

// Extraer lat/lng de un link de Google Maps
function parseGMapsUrl(url) {
  if (!url) return null;
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,          // maps/@lat,lng
    /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,     // maps?q=lat,lng
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,    // maps?ll=lat,lng
    /place\/[^/]*\/(-?\d+\.\d+),(-?\d+\.\d+)/, // place/name/lat,lng
    /(-?\d{1,3}\.\d{4,}),\s*(-?\d{1,3}\.\d{4,})/, // raw coords
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
  }
  return null;
}
function gmapsLink(lat, lng) { return `https://www.google.com/maps?q=${lat},${lng}`; }

const peso = (n) => "$ " + Number(n).toLocaleString("es-AR");
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
// Distancia en km entre dos coordenadas (Haversine)
function distKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const R = 6371, toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/* ---- Persistencia del perfil del transportista (zona + radio) ----
   En el prototipo usa el almacenamiento del artefacto (persiste entre sesiones).
   En producción: reemplazar loadProfile/saveProfile por GET/PUT al perfil en tu API. */
const PROFILE_KEY = "carreta:transportista:zona";
async function loadProfile() {
  try {
    if (typeof window === "undefined" || !window.storage) return null;
    const r = await window.storage.get(PROFILE_KEY);
    return r && r.value ? JSON.parse(r.value) : null;
  } catch { return null; }
}
async function saveProfile(data) {
  try {
    if (typeof window === "undefined" || !window.storage) return;
    await window.storage.set(PROFILE_KEY, JSON.stringify(data));
  } catch { /* noop */ }
}

/* ============================ LOCATION INPUT ============================ */
function LocationInput({ localidad, provincia, onLocalidad, onProvincia, accent, placeholder }) {
  return (
    <div className="cr-loc-input">
      <input value={localidad || ""} onChange={(e) => onLocalidad(e.target.value)}
        placeholder={placeholder || "Localidad"} className="cr-loc-text" />
      <select value={provincia || ""} onChange={(e) => onProvincia(e.target.value)}
        className="cr-loc-prov" style={provincia ? { borderColor: accent + "88" } : undefined}>
        <option value="">Provincia</option>
        {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
      </select>
    </div>
  );
}

/* ============================ LANDING ============================ */
function Landing({ onPick }) {
  const cards = [
    { id: "productor", accent: "#22c55e", tint: "rgba(34,197,94,0.16)", Icon: Sprout,
      title: "Soy Productor", desc: "Creá pedidos de flete, contratá servicios de maquinaria y pedí repuestos.",
      points: ["Publicar pedidos de carga", "Ver servicios de contratistas", "Solicitar repuestos e insumos"] },
    { id: "transportista", accent: "#60a5fa", tint: "rgba(59,130,246,0.18)", Icon: Truck,
      title: "Soy Transportista", desc: "Explorá pedidos disponibles, enviá tu oferta y gestioná tus viajes.",
      points: ["Ver pedidos en tu zona", "Enviar ofertas de precio", "Pedir repuestos para tu camión"] },
    { id: "contratista", accent: "#f59e0b", tint: "rgba(245,158,11,0.18)", Icon: Wrench,
      title: "Soy Contratista", desc: "Publicá tus servicios de maquinaria y llegá a productores de todo el país.",
      points: ["Publicar cosechadoras, sembradoras…", "Que los productores te encuentren", "Solicitar repuestos para tu equipo"] },
    { id: "comercio", accent: "#f87171", tint: "rgba(248,113,113,0.18)", Icon: ShoppingCart,
      title: "Soy Comercio", desc: "Mirá qué necesitan productores, transportistas y contratistas y ofreceles tus productos.",
      points: ["Ver solicitudes de repuestos", "Responder con precio y stock", "Conectar directo con el comprador"] },
  ];
  const stats = [
    { icon: Package, value: "1.240+", label: "Pedidos activos" },
    { icon: Truck, value: "380+", label: "Transportistas" },
    { icon: Wrench, value: "95+", label: "Contratistas" },
    { icon: MapPin, value: "23", label: "Provincias" },
  ];
  return (
    <div className="cr-landing cr-fade">
      <div className="cr-bg" /><div className="cr-overlay" />
      <main className="cr-l-content">
        <div className="cr-logo">
          <div className="cr-logo-chip"><Truck size={26} color="#fff" strokeWidth={2.2} /></div>
          <span className="cr-logo-name">Carreta</span>
        </div>
        <p className="cr-tagline">Conectamos productores, transportistas, contratistas y comercios del agro de todo el país.</p>
        <div className="cr-stats">
          {stats.map(({ icon: Icon, value, label }) => (
            <div className="cr-stat" key={label}>
              <Icon size={22} color="#22c55e" strokeWidth={2} />
              <span className="cr-stat-val">{value}</span><span className="cr-stat-lbl">{label}</span>
            </div>
          ))}
        </div>
        <p className="cr-howto">¿Cómo querés ingresar?</p>
        <div className="cr-cards">
          {cards.map(({ id, accent, tint, Icon, title, desc, points }) => (
            <div key={id} className="cr-lcard" onClick={() => onPick(id)} role="button" tabIndex={0}>
              <div className="cr-lcard-head">
                <div className="cr-lcard-chip" style={{ background: tint }}><Icon size={24} color={accent} strokeWidth={2} /></div>
                <ArrowRight size={22} className="cr-lcard-arrow" />
              </div>
              <h2 className="cr-lcard-title">{title}</h2>
              <p className="cr-lcard-desc">{desc}</p>
              <ul className="cr-points">
                {points.map((p) => (<li className="cr-point" key={p}><span className="cr-dot" style={{ background: accent }} />{p}</li>))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <footer className="cr-footer">Plataforma agropecuaria integral · Argentina</footer>
    </div>
  );
}

/* ============================ ORDER CARD ============================ */
function OrderCard({ order, accent, soft, onOpen }) {
  const status = orderStatus(order);
  const st = STATUS[status] || STATUS.Pendiente;
  const n = order.offers.length;
  const al = ACT_LABELS[order.actividad] || ACT_LABELS.agricola;
  const ab = al.badge;
  return (
    <div className="cr-card" onClick={onOpen}>
      <div className="cr-card-main">
        <div className="cr-card-chip" style={{ background: soft }}><Box size={20} color={accent} strokeWidth={2} /></div>
        <div className="cr-card-body">
          <div className="cr-card-titlerow">
            <span className="cr-card-cargo">{order.cargo}</span>
            <span className="cr-badge" style={{ background: ab.bg, color: ab.c }}>{ab.t}</span>
            <span className="cr-badge" style={{ background: st.bg, color: st.color }}>{status}</span>
          </div>
          <div className="cr-card-route">
            <MapPin size={14} color="#9ca3af" />
            <span>{order.localidad} → {order.to}{order.km ? ` · ${order.km} km` : ""}</span>
          </div>
          <div className="cr-card-meta">
            <span className="cr-meta-item"><Weight size={14} color="#9ca3af" /> {Number(order.kilos).toLocaleString("es-AR")} {al.unit}</span>
            <span className="cr-meta-item"><Truck size={14} color="#9ca3af" /> {order.jaulasSimples != null ? `${order.jaulasSimples || 0} simple${(order.jaulasSimples||0)!==1?"s":""} + ${order.jaulasDobles || 0} doble${(order.jaulasDobles||0)!==1?"s":""}` : `${order.camiones} ${al.vehiculo}`}</span>
            <span className="cr-meta-item"><Calendar size={14} color="#9ca3af" /> {order.date}</span>
            {order._dist != null && (
              <span className="cr-dist" style={{ color: accent }}><MapPin size={13} /> a ~{order._dist} km</span>
            )}
            {n > 0 && <span className="cr-offers">{n} oferta{n > 1 ? "s" : ""}</span>}
          </div>
        </div>
        <ChevronDown size={20} color="#9ca3af" className="cr-chev" style={{ transform: "rotate(-90deg)" }} />
      </div>
    </div>
  );
}

/* ============================ ORDER DETAIL ============================ */
function OfferForm({ order, accent, onSendOffer }) {
  const need = order.camiones;
  const al = ACT_LABELS[order.actividad] || ACT_LABELS.agricola;
  const semi = semiLabel(order.actividad);
  const [price, setPrice] = useState("");
  const [trucks, setTrucks] = useState(String(need || 1));
  const [note, setNote] = useState("");
  const [seguro, setSeguro] = useState("");
  const [peajes, setPeajes] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [cuitTransp, setCuitTransp] = useState("");
  const n = Math.max(1, Math.min(20, Number(trucks) || 1));
  const [vehs, setVehs] = useState(Array.from({ length: n }, () => ({ chasis: "", semi: "", chofer: "", cuitChofer: "" })));

  // Sincroniza la cantidad de filas de vehículos con trucks
  const prevN = vehs.length;
  if (n !== prevN) {
    if (n > prevN) { const copy = [...vehs]; while (copy.length < n) copy.push({ chasis: "", semi: "", chofer: "", cuitChofer: "" }); setVehs(copy); }
    else setVehs(vehs.slice(0, n));
  }

  const setVeh = (i, field, val) => setVehs((vs) => vs.map((v, j) => j === i ? { ...v, [field]: field === "chofer" ? val : field === "cuitChofer" ? val.replace(/[^\d\-]/g, "") : val.toUpperCase() } : v));
  const allVehOk = vehs.every((v) => validDominio(v.chasis) && validDominio(v.semi) && v.chofer.trim() && validCuit(v.cuitChofer));
  const isGan = order.actividad === "ganadero";
  const canSend = (isGan ? price : price) && allVehOk && razonSocial.trim() && validCuit(cuitTransp);
  const send = () => {
    if (!canSend) return;
    onSendOffer(order.id, {
      id: Date.now(), by: ME_TRANSPORTISTA, razonSocial: razonSocial.trim(), cuitTransp: normCuit(cuitTransp),
      price: Number(price), seguro: Number(seguro) || 0, peajes: Number(peajes) || 0,
      precioPorKm: isGan ? Number(price) || 0 : undefined,
      precioTotal: isGan
        ? (((Number(price) || 0) * (order.km || 0)) + (Number(seguro) || 0) + (Number(peajes) || 0)) * n
        : (Number(price) || 0) * ((Number(order.kilos) || 0) / 1000) + (Number(seguro) || 0) + (Number(peajes) || 0),
      camiones: n, note, status: "enviada",
      vehiculos: vehs.map((v) => ({ chasis: normDom(v.chasis), semi: normDom(v.semi), chofer: v.chofer.trim(), cuitChofer: normCuit(v.cuitChofer) })),
    });
  };
  return (
    <div className="cr-form">
      <p className="cr-need" style={{ marginTop: 0 }}><Truck size={14} /> Este pedido necesita <strong>{order.jaulasSimples != null ? `${order.jaulasSimples} simple${order.jaulasSimples!==1?"s":""} + ${order.jaulasDobles || 0} doble${(order.jaulasDobles||0)!==1?"s":""}` : `${need} ${al.vehiculo}`}</strong> · {Number(order.kilos).toLocaleString("es-AR")} {al.unit}.</p>
      {/* Datos empresa transportista */}
      <div className="cr-vehs-head"><span>Datos del transportista</span></div>
      <div className="cr-form-grid">
        <div className="cr-field"><label>Razón social / Nombre</label><input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Ej: Transportes Méndez SRL" /></div>
        <div className="cr-field"><label>CUIT transportista {cuitTransp && !validCuit(cuitTransp) && <span style={{ color: "#dc2626", fontSize: 11 }}>· 11 dígitos</span>}</label>
          <input value={cuitTransp} onChange={(e) => setCuitTransp(e.target.value.replace(/[^\d\-]/g, ""))} placeholder="30-12345678-9" maxLength={13}
            style={cuitTransp && !validCuit(cuitTransp) ? { borderColor: "#fca5a5" } : cuitTransp && validCuit(cuitTransp) ? { borderColor: "#86efac" } : undefined} />
        </div>
      </div>
      <div className="cr-form-grid" style={{ marginTop: 12 }}>
        {isGan ? (
          <>
            <div className="cr-field"><label>Flete ($ por km)</label><input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="Ej: 1500" /></div>
            <div className="cr-field"><label>Seguro ($ por jaula)</label><input value={seguro} onChange={(e) => setSeguro(e.target.value.replace(/\D/g, ""))} placeholder="Ej: 50000" /></div>
            <div className="cr-field"><label>Peajes ($ por jaula)</label><input value={peajes} onChange={(e) => setPeajes(e.target.value.replace(/\D/g, ""))} placeholder="Ej: 25000" /></div>
          </>
        ) : (
          <>
            <div className="cr-field"><label>Precio ofertado ($ / tn)</label><input value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="Ej: 42000" /></div>
            <div className="cr-field"><label>Seguro ($)</label><input value={seguro} onChange={(e) => setSeguro(e.target.value.replace(/\D/g, ""))} placeholder="Ej: 30000" /></div>
            <div className="cr-field"><label>Peajes ($)</label><input value={peajes} onChange={(e) => setPeajes(e.target.value.replace(/\D/g, ""))} placeholder="Ej: 15000" /></div>
          </>
        )}
        <div className="cr-field"><label>{al.vehiculoLabel} que pongo</label><input value={trucks} onChange={(e) => setTrucks(e.target.value.replace(/\D/g, ""))} placeholder={String(need)} /></div>
      </div>
      {isGan && (Number(price) > 0 || Number(seguro) > 0 || Number(peajes) > 0) && (
        <p className="cr-hint" style={{ fontWeight: 600, color: "#166534", marginTop: 6 }}>
          Total ofertado: {peso((((Number(price) || 0) * (order.km || 0)) + (Number(seguro) || 0) + (Number(peajes) || 0)) * n)}
          {order.km ? ` (${peso(Number(price) || 0)}/km × ${order.km} km + seguro + peajes) × ${n} ${al.vehiculo}` : " (cargá km en el pedido para calcular el flete)"}
        </p>
      )}
      {!isGan && (Number(price) > 0 || Number(seguro) > 0 || Number(peajes) > 0) && (() => {
        const toneladas = (Number(order.kilos) || 0) / 1000;
        const total = (Number(price) || 0) * toneladas + (Number(seguro) || 0) + (Number(peajes) || 0);
        return (
          <p className="cr-hint" style={{ fontWeight: 600, color: "#166534", marginTop: 6 }}>
            Total ofertado: {peso(total)}
            {` (${toneladas.toLocaleString("es-AR")} tn × ${peso(Number(price) || 0)}/tn + seguro + peajes)`}
          </p>
        );
      })()}

      {/* Dominios por cada vehículo */}
      <div className="cr-vehs-head">
        <span>Vehículos y choferes ({n})</span>
        <span className="cr-hint" style={{ margin: 0 }}>Formato: AA 123 BB (nuevo) o AAA 123 (antiguo)</span>
      </div>
      {vehs.map((v, i) => {
        const cOk = !v.chasis || validDominio(v.chasis);
        const sOk = !v.semi || validDominio(v.semi);
        return (
          <div className="cr-veh-row" key={i} style={{ flexWrap: "wrap" }}>
            <span className="cr-veh-n" style={{ background: accent + "22", color: accent }}>{i + 1}</span>
            <div className="cr-field" style={{ flex: 1 }}>
              <label>Chasis {v.chasis && !cOk && <span style={{ color: "#dc2626", fontSize: 11 }}>· inválido</span>}</label>
              <input value={v.chasis} onChange={(e) => setVeh(i, "chasis", e.target.value)} placeholder="AB123CD" maxLength={9}
                style={v.chasis && !cOk ? { borderColor: "#fca5a5" } : v.chasis && cOk ? { borderColor: "#86efac" } : undefined} />
            </div>
            <div className="cr-field" style={{ flex: 1 }}>
              <label>{semi} {v.semi && !sOk && <span style={{ color: "#dc2626", fontSize: 11 }}>· inválido</span>}</label>
              <input value={v.semi} onChange={(e) => setVeh(i, "semi", e.target.value)} placeholder="AB123CD" maxLength={9}
                style={v.semi && !sOk ? { borderColor: "#fca5a5" } : v.semi && sOk ? { borderColor: "#86efac" } : undefined} />
            </div>
            <div className="cr-field" style={{ flex: 1.2, minWidth: 140 }}>
              <label>Chofer</label>
              <input value={v.chofer} onChange={(e) => setVeh(i, "chofer", e.target.value)} placeholder="Nombre y Apellido" />
            </div>
            <div className="cr-field" style={{ flex: 1, minWidth: 130 }}>
              <label>CUIT chofer {v.cuitChofer && !validCuit(v.cuitChofer) && <span style={{ color: "#dc2626", fontSize: 11 }}>· inválido</span>}</label>
              <input value={v.cuitChofer} onChange={(e) => setVeh(i, "cuitChofer", e.target.value)} placeholder="20-12345678-9" maxLength={13}
                style={v.cuitChofer && !validCuit(v.cuitChofer) ? { borderColor: "#fca5a5" } : v.cuitChofer && validCuit(v.cuitChofer) ? { borderColor: "#86efac" } : undefined} />
            </div>
          </div>
        );
      })}

      <div className="cr-form-grid" style={{ marginTop: 12 }}>
        <div className="cr-field full"><label>Disponibilidad / equipo</label><input value={note} onChange={(e) => setNote(e.target.value)} placeholder={order.actividad === "ganadero" ? "Ej: Jaula doble piso, salgo el lunes" : "Ej: Camión cerealero, salgo el lunes"} /></div>
      </div>
      {n > 0 && n < need && (
        <p className="cr-hint" style={{ color: "#b45309" }}>Ofrecés menos {al.vehiculo} de los que pide el pedido. Igual podés enviarla; el productor decide.</p>
      )}
      <div style={{ marginTop: 12 }}>
        <button className="cr-btn cr-btn-primary" style={{ background: accent, opacity: canSend ? 1 : 0.5 }} disabled={!canSend} onClick={send}>Enviar oferta <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}

function OrderDetail({ order, role, accent, soft, onBack, onConfirm, onSendOffer, onUploadCpe, onPause, onResume, onCancel, onReassign, onEdit, onContingencia, onResolve, onEntrega, onRecepcion, onCalificar }) {
  const dl = docLabel(order.actividad);
  const status = orderStatus(order);
  const st = STATUS[status] || STATUS.Pendiente;
  const need = order.camiones;
  const hasAccepted = (order.offers || []).some((of) => of.status === "aceptada");
  const confirmedOrder = hasAccepted;
  const isPaused = status === "Pausado";
  const isCancelled = status === "Cancelado";
  const isEntregado = status === "Entregado";
  const isFinalizado = status === "Finalizado";
  const myOffer = order.offers.find((o) => o.by === ME_TRANSPORTISTA);
  const al = ACT_LABELS[order.actividad] || ACT_LABELS.agricola;
  const [editingVeh, setEditingVeh] = useState(null); // index del vehículo que se edita
  const [editData, setEditData] = useState({ chasis: "", semi: "", chofer: "" });
  const [editing, setEditing] = useState(false);
  const [ef, setEf] = useState({});
  const [showIncForm, setShowIncForm] = useState(false);
  const [showEntregaForm, setShowEntregaForm] = useState(false);
  const [entregaObs, setEntregaObs] = useState("");
  const [showCalifForm, setShowCalifForm] = useState(false);
  const [calif, setCalif] = useState({ c1: 0, c2: 0, c3: 0, comentario: "" });
  const [incMotivo, setIncMotivo] = useState(CONTINGENCIA_MOTIVOS[0]);
  const [incDesc, setIncDesc] = useState("");
  const startEdit = () => { setEf({ localidad: order.localidad, provincia: order.provincia, to: order.to, kilos: String(order.kilos), km: String(order.km || ""), camiones: String(order.camiones), date: order.date, cargo: order.cargo, mapsOrigen: order.mapsOrigen || "", mapsDest: order.mapsDest || "" }); setEditing(true); };
  const saveEdit = () => { onEdit(order.id, { localidad: ef.localidad, provincia: ef.provincia, to: ef.to, kilos: Number(ef.kilos), km: Number(ef.km) || null, camiones: Number(ef.camiones), date: ef.date, cargo: ef.cargo, mapsOrigen: ef.mapsOrigen, mapsDest: ef.mapsDest }); setEditing(false); };
  const sef = (k) => (e) => setEf({ ...ef, [k]: e.target.value });

  return (
    <div className="cr-content cr-fade">
      <button className="cr-breadcrumb" onClick={onBack}><ArrowLeft size={16} /> Volver</button>

      {/* Cabecera del pedido */}
      <div className="cr-detail-card">
        <div className="cr-card-main">
          <div className="cr-card-chip" style={{ background: soft }}><Box size={22} color={accent} strokeWidth={2} /></div>
          <div className="cr-card-body">
            <div className="cr-card-titlerow">
              <span className="cr-detail-cargo">{order.cargo}</span>
              <span className="cr-badge" style={{ background: st.bg, color: st.color }}>{status}</span>
            </div>
            <div className="cr-card-route" style={{ marginTop: 8 }}>
              <MapPin size={15} color="#9ca3af" />
              <span>{order.localidad} → {order.to}{order.km ? ` · ${order.km} km` : ""}</span>
            </div>
          </div>
        </div>
        <div className="cr-detail-grid">
          <div><span className="cr-detail-k">Carga</span><span className="cr-detail-v">{order.cargo}</span></div>
          <div><span className="cr-detail-k">{al.unitLabel.replace(/\(.*\)/, "").trim()}</span><span className="cr-detail-v">{Number(order.kilos).toLocaleString("es-AR")} {al.unit}</span></div>
          <div><span className="cr-detail-k">{al.vehiculoLabel}</span><span className="cr-detail-v">{order.jaulasSimples != null ? `${order.jaulasSimples} simple${order.jaulasSimples!==1?"s":""} + ${order.jaulasDobles || 0} doble${(order.jaulasDobles||0)!==1?"s":""}` : order.camiones}</span></div>
          <div><span className="cr-detail-k">Distancia</span><span className="cr-detail-v">{order.km ? order.km + " km" : "—"}</span></div>
          <div><span className="cr-detail-k">Entrega</span><span className="cr-detail-v">{order.date}</span></div>
          <div><span className="cr-detail-k">Productor</span><span className="cr-detail-v">{order.owner}</span></div>
          <div><span className="cr-detail-k">Origen</span><span className="cr-detail-v">{order.localidad}, {order.provincia}
            {(order.lat || order.mapsOrigen) && <a className="cr-maps-link" href={order.mapsOrigen || gmapsLink(order.lat, order.lng)} target="_blank" rel="noreferrer"><MapPin size={12} /> Ver en Maps</a>}
          </span></div>
          <div><span className="cr-detail-k">Destino</span><span className="cr-detail-v">{order.to}
            {(order.toLat || order.mapsDest) && <a className="cr-maps-link" href={order.mapsDest || gmapsLink(order.toLat, order.toLng)} target="_blank" rel="noreferrer"><MapPin size={12} /> Ver en Maps</a>}
          </span></div>
        </div>
      </div>

      {/* PRODUCTOR: acciones sobre el pedido */}
      {role === "productor" && !isCancelled && (
        <div className="cr-order-actions">
          {!editing && !confirmedOrder && (
            <button className="cr-btn cr-btn-ghost" onClick={startEdit} style={{ color: accent }}>✏️ Modificar pedido</button>
          )}
          {isPaused ? (
            <button className="cr-btn cr-btn-ghost" onClick={() => onResume(order.id)} style={{ color: "#16a34a" }}><Check size={15} /> Reanudar pedido</button>
          ) : !confirmedOrder ? (
            <button className="cr-btn cr-btn-ghost" onClick={() => onPause(order.id)} style={{ color: "#4338ca" }}>⏸ Pausar pedido</button>
          ) : null}
          {!confirmedOrder && (
            <button className="cr-btn cr-btn-ghost" onClick={() => { if (confirm("¿Seguro que querés cancelar este pedido? Esta acción no se puede deshacer.")) onCancel(order.id); }} style={{ color: "#dc2626" }}><X size={15} /> Cancelar pedido</button>
          )}
        </div>
      )}

      {/* Formulario de edición */}
      {editing && (
        <div className="cr-reassign-form" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#166534" }}>✏️ Modificar pedido</h4>
          <div className="cr-form-grid">
            <div className="cr-field"><label>Tipo de carga</label>
              <select value={ef.cargo} onChange={sef("cargo")}>{(order.actividad === "ganadero" ? CARGO_GANADERO : CARGO_AGRO).map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            <div className="cr-field"><label>{al.vehiculoLabel}</label>
              <input value={ef.camiones} onChange={(e) => setEf({ ...ef, camiones: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="cr-field"><label>Origen (localidad)</label><input value={ef.localidad} onChange={sef("localidad")} /></div>
            <div className="cr-field"><label>Provincia origen</label>
              <select value={ef.provincia} onChange={sef("provincia")}><option value="">Provincia</option>{PROVINCIAS.map((p) => <option key={p}>{p}</option>)}</select>
            </div>
            <div className="cr-field"><label>Destino</label><input value={ef.to} onChange={sef("to")} /></div>
            <div className="cr-field"><label>{al.unitLabel}</label>
              <input value={ef.kilos} onChange={(e) => setEf({ ...ef, kilos: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="cr-field"><label>Km del recorrido</label>
              <input value={ef.km} onChange={(e) => setEf({ ...ef, km: e.target.value.replace(/\D/g, "") })} />
            </div>
            <div className="cr-field"><label>Fecha de entrega</label><input type="date" value={ef.date} onChange={sef("date")} /></div>
            <div className="cr-field full"><label>Link Google Maps origen</label><input value={ef.mapsOrigen} onChange={sef("mapsOrigen")} placeholder="Pegá link de Maps" /></div>
            <div className="cr-field full"><label>Link Google Maps destino</label><input value={ef.mapsDest} onChange={sef("mapsDest")} placeholder="Pegá link de Maps" /></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button className="cr-btn cr-btn-primary" style={{ background: accent, fontSize: 13 }} onClick={saveEdit}><Check size={14} /> Guardar cambios</button>
            <button className="cr-btn cr-btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Aviso si está pausado o cancelado */}
      {isPaused && <p className="cr-hint" style={{ color: "#4338ca", fontWeight: 600, background: "#e0e7ff", padding: "10px 14px", borderRadius: 10 }}>⏸ Este pedido está pausado. Los transportistas no lo ven. Podés reanudarlo cuando quieras.</p>}
      {isCancelled && <p className="cr-hint" style={{ color: "#6b7280", fontWeight: 600, background: "#f3f4f6", padding: "10px 14px", borderRadius: 10 }}>Este pedido fue cancelado.</p>}

      {/* Contingencia reportada por el transportista (vista del productor) */}
      {order.incidencia && role === "productor" && (
        <div className="cr-inc-box">
          <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#991b1b" }}>⚠️ El transportista reportó una contingencia</h4>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
            <strong>Motivo:</strong> {order.incidencia.motivo}<br />
            <strong>Descripción:</strong> {order.incidencia.descripcion}<br />
            <strong>Fecha:</strong> {order.incidencia.fecha} · <strong>Reportado por:</strong> {order.incidencia.by}
          </div>
          <p className="cr-hint" style={{ marginTop: 10 }}>Podés devolver el pedido al mismo transportista si se resolvió el problema, o republicarlo para recibir nuevas ofertas. Si hace falta, también podés modificar la {dl.org} actual o subir una nueva más abajo.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            <button className="cr-btn cr-btn-primary" style={{ background: "#16a34a", fontSize: 13 }} onClick={() => onResolve(order.id, "mismo")}>
              <Check size={14} /> Devolver al mismo transportista
            </button>
            <button className="cr-btn cr-btn-primary" style={{ background: "#2563eb", fontSize: 13 }} onClick={() => onResolve(order.id, "republicar")}>
              <ArrowRight size={14} /> Republicar para nuevas ofertas
            </button>
            <button className="cr-btn cr-btn-ghost" style={{ fontSize: 13, color: "#dc2626" }}
              onClick={() => { if (confirm("¿Cancelar el pedido definitivamente?")) onCancel(order.id); }}>
              <X size={14} /> Cancelar pedido
            </button>
          </div>
        </div>
      )}

      {/* ENTREGA / RECEPCIÓN / CALIFICACIÓN — común a productor y transportista */}
          {/* Entrega informada */}
          {order.entrega && (
            <div className="cr-inc-box" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#166534" }}>✓ Viaje realizado y descargado</h4>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                <strong>Fecha:</strong> {order.entrega.fecha} · <strong>Informado por:</strong> {order.entrega.by}
                {order.entrega.observacion && <><br /><strong>Observación:</strong> {order.entrega.observacion}</>}
              </div>
              {role === "productor" && !order.recepcion && (
                <div style={{ marginTop: 12 }}>
                  <button className="cr-btn cr-btn-primary" style={{ background: "#16a34a", fontSize: 13 }}
                    onClick={() => { if (confirm("¿Confirmar la recepción de la carga en destino?")) onRecepcion(order.id); }}>
                    <Check size={14} /> Confirmar recepción en destino
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recepción confirmada */}
          {order.recepcion && (
            <div className="cr-inc-box" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
              <h4 style={{ margin: "0 0 4px", fontSize: 13, color: "#166534" }}>✓ Recepción confirmada el {order.recepcion.fecha}</h4>
            </div>
          )}

          {/* CALIFICACIÓN MUTUA */}
          {order.recepcion && (() => {
            const miCalif = role === "productor" ? "productor" : "transportista";
            const yaCalificó = order.calificaciones && order.calificaciones[miCalif];
            const labels = role === "productor"
              ? ["Atención", "Cumple tiempos de traslado", "Condiciones acordadas"]
              : ["Acceso a lugar de carga", "Tiempos de operación", "Condiciones acordadas"];
            const Carreta = ({ n, sel, onSel }) => (
              <div style={{ display: "flex", gap: 2 }}>
                {[1,2,3,4,5].map((v) => (
                  <button key={v} onClick={() => onSel(v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, opacity: v <= sel ? 1 : 0.25 }}>🚛</button>
                ))}
              </div>
            );
            const nivelesText = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];
            if (yaCalificó) {
              return (
                <div className="cr-inc-box" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                  <h4 style={{ margin: "0 0 10px", fontSize: 14, color: "#92400e" }}>⭐ Tu calificación</h4>
                  {labels.map((l, i) => {
                    const val = yaCalificó["c" + (i + 1)];
                    return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 180, color: "#374151" }}>{l}</span>
                      <span style={{ fontSize: 18 }}>{"🚛".repeat(val)}{"⬜".repeat(5 - val)}</span>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>{nivelesText[val]}</span>
                    </div>;
                  })}
                  {yaCalificó.comentario && <p style={{ fontSize: 13, color: "#6b7280", marginTop: 8 }}>"{yaCalificó.comentario}"</p>}
                </div>
              );
            }
            return (
              <div style={{ marginTop: 16 }}>
                {!showCalifForm ? (
                  <button className="cr-btn cr-btn-primary" style={{ background: "#d97706", fontSize: 13 }} onClick={() => setShowCalifForm(true)}>
                    ⭐ Calificar {role === "productor" ? "al transportista" : "al productor"}
                  </button>
                ) : (
                  <div className="cr-reassign-form" style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                    <h4 style={{ margin: "0 0 14px", fontSize: 14, color: "#92400e" }}>⭐ Calificar {role === "productor" ? "al transportista" : "al productor"}</h4>
                    <p className="cr-hint" style={{ marginTop: -8, marginBottom: 14 }}>1 carreta = Malo, 2 = Regular, 3 = Bueno, 4 = Muy bueno, 5 = Excelente</p>
                    {labels.map((l, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, minWidth: 180, color: "#374151" }}>{l}</span>
                        <Carreta sel={calif["c" + (i + 1)]} onSel={(v) => setCalif({ ...calif, ["c" + (i + 1)]: v })} />
                        <span style={{ fontSize: 12, color: "#6b7280", minWidth: 70 }}>{nivelesText[calif["c" + (i + 1)]] || ""}</span>
                      </div>
                    ))}
                    <div className="cr-field full" style={{ marginTop: 8 }}><label>Comentario (opcional)</label>
                      <input value={calif.comentario} onChange={(e) => setCalif({ ...calif, comentario: e.target.value })} placeholder="Breve aclaración…" />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button className="cr-btn cr-btn-primary" style={{ background: "#d97706", fontSize: 13 }}
                        disabled={!calif.c1 || !calif.c2 || !calif.c3}
                        onClick={() => { onCalificar(order.id, miCalif, calif); setShowCalifForm(false); }}>
                        Enviar calificación
                      </button>
                      <button className="cr-btn cr-btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowCalifForm(false)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}


      {/* PRODUCTOR: ofertas recibidas */}
      {role === "productor" && (
        <>
          <h3 className="cr-h3">Ofertas recibidas ({order.offers.filter((o) => o.status !== "pausada").length})</h3>
          <p className="cr-need"><Truck size={14} /> Necesitás <strong>{need} camión{need > 1 ? "es" : ""}</strong> para cubrir este pedido.</p>
          {order.offers.filter((o) => o.status !== "pausada").length === 0 && <p className="cr-empty">Todavía no recibiste ofertas para este pedido.</p>}
          {order.offers.filter((o) => o.status !== "pausada").map((of) => {
            const accepted = of.status === "aceptada";
            const rejected = of.status === "rechazada";
            const cubre = (of.camiones || 0) >= need;
            return (
              <div className={`cr-offer ${accepted ? "is-acc" : ""} ${rejected ? "is-rej" : ""}`} key={of.id}>
                <div className="cr-offer-av" style={{ background: soft, color: accent }}>{of.by.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
                <div className="cr-offer-info">
                  <div className="cr-offer-name">{of.razonSocial || of.by}
                    {accepted && <span className="cr-tag-acc"><CheckCircle2 size={13} /> Confirmado</span>}
                    {rejected && <span className="cr-tag-rej">No seleccionado</span>}
                  </div>
                  <div className="cr-offer-zona">{of.cuitTransp ? `CUIT: ${formatCuit(of.cuitTransp)}` : of.zona}</div>
                  <div className="cr-offer-trucks" style={{ color: cubre ? "#166534" : "#b45309" }}>
                    <Truck size={13} /> Ofrece {of.camiones} camión{of.camiones > 1 ? "es" : ""}
                    {cubre ? " · cubre el pedido" : ` · faltan ${need - of.camiones}`}
                  </div>
                  {of.vehiculos && of.vehiculos.length > 0 && (
                    <div className="cr-offer-vehs">{of.vehiculos.map((v, i) => (
                      <div className="cr-offer-dom" key={i}><span className="cr-veh-n" style={{ width: 20, height: 20, fontSize: 10 }}>{i + 1}</span> <span>Chasis: <strong>{formatDominio(v.chasis)}</strong></span> <span>{semiLabel(order.actividad)}: <strong>{formatDominio(v.semi)}</strong></span>{v.chofer && <span className="cr-dom-chofer">Chofer: {v.chofer}{v.cuitChofer ? ` · CUIT: ${formatCuit(v.cuitChofer)}` : ""}</span>}</div>
                    ))}</div>
                  )}
                  {of.note && <div className="cr-offer-note">“{of.note}”</div>}
                  {order.actividad === "ganadero" && of.seguro != null && (() => {
                    const flete = (of.price || 0) * (order.km || 0);
                    const porJaula = flete + (of.seguro || 0) + (of.peajes || 0);
                    const total = porJaula * (of.camiones || 1);
                    return (
                      <div className="cr-offer-desglose">
                        <span>Flete: {peso(of.price)}/km{order.km ? ` × ${order.km} km = ${peso(flete)}` : ""}</span>
                        <span>Seguro: {peso(of.seguro)}/jaula</span>
                        <span>Peajes: {peso(of.peajes || 0)}/jaula</span>
                        <span>Por jaula: {peso(porJaula)}</span>
                        <span style={{ color: "#166534", fontWeight: 700 }}>× {of.camiones} jaula{of.camiones > 1 ? "s" : ""} = {peso(total)}</span>
                      </div>
                    );
                  })()}
                  {order.actividad !== "ganadero" && (of.seguro || of.peajes) && (() => {
                    const toneladas = (order.kilos || 0) / 1000;
                    const flete = (of.price || 0) * toneladas;
                    const total = flete + (of.seguro || 0) + (of.peajes || 0);
                    return (
                      <div className="cr-offer-desglose">
                        <span>Flete: {peso(of.price)}/tn × {toneladas.toLocaleString("es-AR")} tn = {peso(flete)}</span>
                        <span>Seguro: {peso(of.seguro || 0)}</span>
                        <span>Peajes: {peso(of.peajes || 0)}</span>
                        <span style={{ color: "#166534", fontWeight: 700 }}>Total: {peso(total)}</span>
                      </div>
                    );
                  })()}
                </div>
                <div className="cr-offer-right">
                  <div className="cr-offer-price">{(() => {
                    if (order.actividad === "ganadero" && of.seguro != null) {
                      const flete = (of.price || 0) * (order.km || 0);
                      const total = (flete + (of.seguro || 0) + (of.peajes || 0)) * (of.camiones || 1);
                      return <>{peso(total)}<span> total</span></>;
                    }
                    if (order.actividad !== "ganadero" && (of.seguro || of.peajes)) {
                      const toneladas = (order.kilos || 0) / 1000;
                      const total = (of.price || 0) * toneladas + (of.seguro || 0) + (of.peajes || 0);
                      return <>{peso(total)}<span> total</span></>;
                    }
                    return <>{peso(of.price)}<span> / tn</span></>;
                  })()}</div>
                  {!confirmedOrder && !rejected && (
                    <button className="cr-btn cr-btn-primary" style={{ background: accent }} onClick={() => { if (confirm("¿Confirmar esta oferta?\n\nUna vez confirmada, las demás ofertas serán rechazadas y esta acción no se puede deshacer.")) onConfirm(order.id, of.id); }}>
                      <Check size={15} /> Confirmar
                    </button>
                  )}
                  {accepted && (
                    <a className="cr-btn cr-wpp" href="https://wa.me/" target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
                  )}
                </div>
              </div>
            );
          })}
          <p className="cr-hint">El precio final se acuerda directamente con el transportista por teléfono o WhatsApp.</p>

          {/* CPE: subir carta de porte por vehículo (solo si hay oferta aceptada) */}
          {confirmedOrder && (() => {
            const accOffer = order.offers.find((o) => o.status === "aceptada");
            if (!accOffer || !accOffer.vehiculos || !accOffer.vehiculos.length) return null;
            const total = accOffer.vehiculos.length;
            const loaded = accOffer.vehiculos.filter((v) => v.cpe).length;
            return (
              <div style={{ marginTop: 16 }}>
                <h3 className="cr-h3">{dl.full} ({loaded}/{total})</h3>
                <p className="cr-hint" style={{ marginTop: -8, marginBottom: 14 }}>
                  {order.incidencia
                    ? `Hay una contingencia activa: podés modificar la ${dl.org} actual o subir una nueva para cada vehículo.`
                    : `Subí el PDF de ${dl.org} para cada vehículo. El transportista lo va a poder descargar desde su panel.`}
                </p>
                {accOffer.vehiculos.map((v, i) => (
                  <div className="cr-cpe-row" key={i}>
                    <span className="cr-veh-n" style={{ background: accent + "22", color: accent, width: 22, height: 22, fontSize: 10 }}>{i + 1}</span>
                    <div className="cr-cpe-info">
                      <span className="cr-cpe-dom">{formatDominio(v.chasis)} — {formatDominio(v.semi)}</span>
                      {v.cpe ? (
                        <span className="cr-cpe-ok"><CheckCircle2 size={14} color="#16a34a" /> {v.cpe.fileName}</span>
                      ) : (
                        <span className="cr-cpe-pending">{dl.short} pendiente</span>
                      )}
                    </div>
                    <div className="cr-cpe-actions" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {v.cpe && (
                        <a className="cr-btn cr-btn-ghost" href={v.cpe.dataUrl} download={v.cpe.fileName} style={{ fontSize: 12 }}>Ver PDF</a>
                      )}
                      {(!v.cpe || order.incidencia) && (
                        <label className="cr-btn cr-btn-primary" style={{ background: accent, fontSize: 12, cursor: "pointer" }}>
                          <Plus size={13} /> {v.cpe ? `Modificar ${dl.short}` : `Subir ${dl.short}`}
                          <input type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => onUploadCpe(order.id, accOffer.id, i, { fileName: file.name, dataUrl: reader.result, uploadDate: new Date().toISOString().slice(0, 10) });
                            reader.readAsDataURL(file);
                          }} />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

        </>
      )}

      {/* TRANSPORTISTA: enviar / ver oferta */}
      {role === "transportista" && (
        <>
          <h3 className="cr-h3">Tu oferta</h3>
          {myOffer ? (
            <div className={`cr-offer ${myOffer.status === "aceptada" ? "is-acc" : ""} ${myOffer.status === "rechazada" ? "is-rej" : ""}`}>
              <div className="cr-offer-av" style={{ background: soft, color: accent }}>CM</div>
              <div className="cr-offer-info">
                <div className="cr-offer-name">Tu oferta
                  {myOffer.status === "aceptada" && <span className="cr-tag-acc"><CheckCircle2 size={13} /> Aceptada</span>}
                  {myOffer.status === "rechazada" && <span className="cr-tag-rej">No seleccionada</span>}
                  {myOffer.status === "enviada" && <span className="cr-tag-acc" style={{ background: "#dbeafe", color: "#1d4ed8" }}>Enviada</span>}
                </div>
                <div className="cr-offer-trucks" style={{ color: "#1d4ed8" }}><Truck size={13} /> {myOffer.camiones} {al.vehiculo}</div>
                {order.actividad === "ganadero" && myOffer.seguro != null && (() => {
                  const flete = (myOffer.price || 0) * (order.km || 0);
                  const porVeh = flete + (myOffer.seguro || 0) + (myOffer.peajes || 0);
                  const total = porVeh * (myOffer.camiones || 1);
                  return (
                    <div className="cr-offer-desglose">
                      <span>Flete: {peso(myOffer.price)}/km{order.km ? ` × ${order.km} km = ${peso(flete)}` : ""}</span>
                      <span>Seguro: {peso(myOffer.seguro || 0)}/jaula</span>
                      <span>Peajes: {peso(myOffer.peajes || 0)}/jaula</span>
                      <span>Por vehículo: {peso(porVeh)}</span>
                      <span style={{ color: "#166534", fontWeight: 700 }}>× {myOffer.camiones} veh. = Total: {peso(total)}</span>
                    </div>
                  );
                })()}
                {order.actividad !== "ganadero" && (myOffer.seguro || myOffer.peajes) && (() => {
                  const toneladas = (order.kilos || 0) / 1000;
                  const flete = (myOffer.price || 0) * toneladas;
                  const total = flete + (myOffer.seguro || 0) + (myOffer.peajes || 0);
                  return (
                    <div className="cr-offer-desglose">
                      <span>Flete: {peso(myOffer.price)}/tn × {toneladas.toLocaleString("es-AR")} tn = {peso(flete)}</span>
                      <span>Seguro: {peso(myOffer.seguro || 0)}</span>
                      <span>Peajes: {peso(myOffer.peajes || 0)}</span>
                      <span style={{ color: "#166534", fontWeight: 700 }}>Total: {peso(total)}</span>
                    </div>
                  );
                })()}
                {myOffer.vehiculos && myOffer.vehiculos.length > 0 && (
                <div className="cr-offer-vehs">{myOffer.vehiculos.map((v, i) => (
                  <div className="cr-offer-dom" key={i}><span className="cr-veh-n" style={{ width: 20, height: 20, fontSize: 10 }}>{i + 1}</span> <span>Chasis: <strong>{formatDominio(v.chasis)}</strong></span> <span>{semiLabel(order.actividad)}: <strong>{formatDominio(v.semi)}</strong></span>{v.chofer && <span className="cr-dom-chofer">Chofer: {v.chofer}{v.cuitChofer ? ` · CUIT: ${formatCuit(v.cuitChofer)}` : ""}</span>}</div>
                ))}</div>
              )}
              </div>
              <div className="cr-offer-right">
                <div className="cr-offer-price">{(() => {
                    if (order.actividad === "ganadero" && myOffer.seguro != null) {
                      const flete = (myOffer.price || 0) * (order.km || 0);
                      const tot = (flete + (myOffer.seguro || 0) + (myOffer.peajes || 0)) * (myOffer.camiones || 1);
                      return <>{peso(tot)}<span> total ({myOffer.camiones} veh.)</span></>;
                    }
                    if (order.actividad !== "ganadero" && (myOffer.seguro || myOffer.peajes)) {
                      const toneladas = (order.kilos || 0) / 1000;
                      const tot = (myOffer.price || 0) * toneladas + (myOffer.seguro || 0) + (myOffer.peajes || 0);
                      return <>{peso(tot)}<span> total</span></>;
                    }
                    return <>{peso(myOffer.price)}<span> / tn</span></>;
                  })()}</div>
                {myOffer.status === "aceptada" && (
                  <a className="cr-btn cr-wpp" href="https://wa.me/" target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
                )}
              </div>
            </div>
          ) : confirmedOrder || isCancelled ? (
            <p className="cr-empty">{isCancelled ? "Este pedido fue cancelado." : "Este pedido ya fue confirmado con otro transportista."}</p>
          ) : isPaused ? (
            <p className="cr-empty">Este pedido está pausado por el productor.</p>
          ) : (
            <OfferForm order={order} accent={accent} onSendOffer={onSendOffer}  />
          )}



          <p className="cr-hint">Una vez confirmado, coordinás el precio final y la logística con el productor por teléfono o WhatsApp.</p>

          {/* TRANSPORTISTA: informar entrega */}
          {myOffer && myOffer.status === "aceptada" && !order.entrega && !order.incidencia && (
            <div style={{ marginTop: 16 }}>
              {!showEntregaForm ? (
                <button className="cr-btn cr-btn-primary" style={{ background: "#16a34a", fontSize: 13 }} onClick={() => setShowEntregaForm(true)}>
                  <Check size={14} /> Informar viaje realizado y descarga
                </button>
              ) : (
                <div className="cr-reassign-form" style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#166534" }}>✓ Informar entrega</h4>
                  <div className="cr-field full"><label>Observaciones (opcional)</label>
                    <textarea value={entregaObs} onChange={(e) => setEntregaObs(e.target.value)} rows={2}
                      placeholder="Ej: Descarga sin novedades, se completó a las 14:00"
                      style={{ resize: "vertical", fontFamily: "inherit", fontSize: 13.5, padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", width: "100%" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button className="cr-btn cr-btn-primary" style={{ background: "#16a34a", fontSize: 13 }}
                      onClick={() => { onEntrega(order.id, { fecha: new Date().toISOString().slice(0, 10), observacion: entregaObs.trim(), by: ME_TRANSPORTISTA }); setShowEntregaForm(false); }}>
                      <Check size={13} /> Confirmar entrega
                    </button>
                    <button className="cr-btn cr-btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowEntregaForm(false)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reportar contingencia (solo si la oferta está aceptada, no hay contingencia previa y todavía no se entregó) */}
          {myOffer && myOffer.status === "aceptada" && !order.incidencia && !order.entrega && (
            <div style={{ marginTop: 16 }}>
              {!showIncForm ? (
                <button className="cr-btn cr-btn-ghost" style={{ color: "#dc2626" }} onClick={() => setShowIncForm(true)}>
                  ⚠️ Reportar contingencia / Devolver pedido
                </button>
              ) : (
                <div className="cr-reassign-form" style={{ background: "#fef2f2", borderColor: "#fecaca" }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 14, color: "#991b1b" }}>⚠️ Reportar contingencia</h4>
                  <p className="cr-hint" style={{ marginTop: 0, marginBottom: 12 }}>Reportá el problema y el pedido se devuelve al productor para que decida cómo proceder.</p>
                  <div className="cr-form-grid">
                    <div className="cr-field"><label>Motivo</label>
                      <select value={incMotivo} onChange={(e) => setIncMotivo(e.target.value)}>
                        {CONTINGENCIA_MOTIVOS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="cr-field full"><label>Descripción del problema</label>
                      <textarea value={incDesc} onChange={(e) => setIncDesc(e.target.value)} rows={3}
                        placeholder="Describí qué pasó: rotura mecánica, corte de ruta, problema con la carga, etc."
                        style={{ resize: "vertical", fontFamily: "inherit", fontSize: 13.5, padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", width: "100%" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="cr-btn cr-btn-primary" style={{ background: "#dc2626", fontSize: 13 }}
                      disabled={!incDesc.trim()}
                      onClick={() => { onContingencia(order.id, { motivo: incMotivo, descripcion: incDesc.trim(), by: ME_TRANSPORTISTA, fecha: new Date().toISOString().slice(0, 10) }); setShowIncForm(false); setIncDesc(""); }}>
                      ⚠️ Confirmar contingencia
                    </button>
                    <button className="cr-btn cr-btn-ghost" style={{ fontSize: 13 }} onClick={() => setShowIncForm(false)}>Cancelar</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mostrar contingencia reportada (deja de mostrarse una vez entregado el viaje) */}
          {order.incidencia && role === "transportista" && !order.entrega && (
            <div className="cr-inc-box">
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#991b1b" }}>⚠️ Contingencia reportada</h4>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                <strong>Motivo:</strong> {order.incidencia.motivo}<br />
                <strong>Descripción:</strong> {order.incidencia.descripcion}<br />
                <strong>Fecha:</strong> {order.incidencia.fecha} · <strong>Reportado por:</strong> {order.incidencia.by}
              </div>
              <p className="cr-hint" style={{ marginTop: 8 }}>El productor fue notificado y debe decidir cómo proceder.</p>
            </div>
          )}

          {/* CPE: descargar carta de porte por vehículo */}
          {myOffer && myOffer.status === "aceptada" && myOffer.vehiculos && myOffer.vehiculos.length > 0 && (() => {
            const total = myOffer.vehiculos.length;
            const loaded = myOffer.vehiculos.filter((v) => v.cpe).length;
            return (
              <div style={{ marginTop: 16 }}>
                <h3 className="cr-h3">{dl.full} ({loaded}/{total})</h3>
                <p className="cr-hint" style={{ marginTop: -8, marginBottom: 14 }}>El productor sube el PDF de {dl.org} para cada vehículo. Descargalo acá.</p>
                {myOffer.vehiculos.map((v, i) => (
                  <div className="cr-cpe-row" key={i} style={{ flexWrap: "wrap" }}>
                    <span className="cr-veh-n" style={{ background: accent + "22", color: accent, width: 22, height: 22, fontSize: 10 }}>{i + 1}</span>
                    <div className="cr-cpe-info">
                      <span className="cr-cpe-dom">{formatDominio(v.chasis)} — {formatDominio(v.semi)}</span>
                      {v.chofer && <span style={{ fontSize: 12, color: "#6b7280" }}>Chofer: {v.chofer}</span>}
                      {v.cpe ? (
                        <span className="cr-cpe-ok"><CheckCircle2 size={14} color="#16a34a" /> {v.cpe.fileName} · subida el {v.cpe.uploadDate}</span>
                      ) : (
                        <span className="cr-cpe-pending">Pendiente — el productor todavía no lo subió</span>
                      )}
                    </div>
                    <div className="cr-cpe-actions" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {v.cpe && (
                        <a className="cr-btn cr-btn-primary" style={{ background: accent, fontSize: 12 }} href={v.cpe.dataUrl} download={v.cpe.fileName}>
                          <ArrowRight size={13} /> Descargar {dl.short}
                        </a>
                      )}
                      {!order.entrega && (
                        <button className="cr-btn cr-btn-ghost" style={{ fontSize: 12, color: "#d97706" }}
                          onClick={() => { setEditingVeh(i); setEditData({ chasis: v.chasis, semi: v.semi, chofer: v.chofer || "" }); }}>
                          Reasignar
                        </button>
                      )}
                    </div>
                    {editingVeh === i && !order.entrega && (
                      <div className="cr-reassign-form">
                        <div className="cr-form-grid">
                          <div className="cr-field"><label>Nuevo chasis</label>
                            <input value={editData.chasis} onChange={(e) => setEditData({ ...editData, chasis: e.target.value.toUpperCase() })} placeholder="AB123CD" maxLength={9}
                              style={editData.chasis && !validDominio(editData.chasis) ? { borderColor: "#fca5a5" } : editData.chasis && validDominio(editData.chasis) ? { borderColor: "#86efac" } : undefined} />
                          </div>
                          <div className="cr-field"><label>Nuevo {semiLabel(order.actividad)}</label>
                            <input value={editData.semi} onChange={(e) => setEditData({ ...editData, semi: e.target.value.toUpperCase() })} placeholder="AB123CD" maxLength={9}
                              style={editData.semi && !validDominio(editData.semi) ? { borderColor: "#fca5a5" } : editData.semi && validDominio(editData.semi) ? { borderColor: "#86efac" } : undefined} />
                          </div>
                          <div className="cr-field"><label>Nuevo chofer</label>
                            <input value={editData.chofer} onChange={(e) => setEditData({ ...editData, chofer: e.target.value })} placeholder="Nombre y Apellido" />
                          </div>
                        </div>
                        <p className="cr-hint" style={{ marginTop: 6 }}>Al reasignar, la CPE cargada se descarta (el productor deberá subir una nueva).</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <button className="cr-btn cr-btn-primary" style={{ background: accent, fontSize: 12 }}
                            disabled={!validDominio(editData.chasis) || !validDominio(editData.semi) || !editData.chofer.trim()}
                            onClick={() => { onReassign(order.id, myOffer.id, i, { chasis: normDom(editData.chasis), semi: normDom(editData.semi), chofer: editData.chofer.trim() }); setEditingVeh(null); }}>
                            <Check size={13} /> Confirmar reasignación
                          </button>
                          <button className="cr-btn cr-btn-ghost" style={{ fontSize: 12 }} onClick={() => setEditingVeh(null)}>Cancelar</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

/* ============================ CREAR PEDIDO ============================ */
function CrearPedido({ accent, onCreate }) {
  const [act, setAct] = useState("agricola");
  const al = ACT_LABELS[act];
  const [f, setF] = useState({ cargo: "Soja", cargoOtro: "", localidad: "", provincia: "", lat: null, lng: null, mapsOrigen: "", to: "", toLocalidad: "", toProv: "", toLat: null, toLng: null, mapsDest: "", kilos: "", km: "", camiones: "1", date: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  // Ganadero: categorías con cantidades
  const [cats, setCats] = useState(HACIENDA_CATS.map((c) => ({ tipo: c, cantidad: "", kg: "", detalle: "" })));
  const setCat = (i, field, val) => setCats((cs) => cs.map((c, j) => j === i ? { ...c, [field]: val } : c));
  const totalCab = cats.reduce((s, c) => s + (Number(c.cantidad) || 0), 0);
  const totalKg = cats.reduce((s, c) => s + (Number(c.kg) || 0), 0);
  const catsConCantidad = cats.filter((c) => Number(c.cantidad) > 0);

  const switchAct = (a) => { setAct(a); setF({ ...f, cargo: a === "ganadero" ? "Hacienda" : CARGO_AGRO[0], cargoOtro: "" }); };

  const cargoFinal = f.cargo === "Otros" && f.cargoOtro ? f.cargoOtro : f.cargo;
  const okAgro = f.cargo && (f.cargo !== "Otros" || f.cargoOtro) && f.localidad && f.provincia && f.to && Number(f.kilos) > 0 && Number(f.camiones) > 0;
  const totalJaulas = (Number(f.jaulasSimples) || 0) + (Number(f.jaulasDobles) || 0);
  const okGan = f.localidad && f.provincia && f.to && totalCab > 0 && totalJaulas > 0;
  const ok = act === "ganadero" ? okGan : okAgro;

  const coordsOrigen = f.lat ? { lat: f.lat, lng: f.lng } : parseGMapsUrl(f.mapsOrigen);
  const coordsDest = f.toLat ? { lat: f.toLat, lng: f.toLng } : parseGMapsUrl(f.mapsDest);
  const handleMapsOrigen = (url) => { const c = parseGMapsUrl(url); setF({ ...f, mapsOrigen: url, lat: c ? c.lat : null, lng: c ? c.lng : null }); };
  const handleMapsDest = (url) => { const c = parseGMapsUrl(url); setF({ ...f, mapsDest: url, toLat: c ? c.lat : null, toLng: c ? c.lng : null }); };

  const buildOrder = () => {
    const base = {
      id: Date.now(), actividad: act, localidad: f.localidad, provincia: f.provincia,
      lat: coordsOrigen ? coordsOrigen.lat : null, lng: coordsOrigen ? coordsOrigen.lng : null, mapsOrigen: f.mapsOrigen || null,
      to: f.to, toLat: coordsDest ? coordsDest.lat : null, toLng: coordsDest ? coordsDest.lng : null, mapsDest: f.mapsDest || null,
      km: Number(f.km) || null, camiones: Number(f.camiones),
      date: f.date || "—", owner: "María González", offers: [],
    };
    if (act === "ganadero") {
      const desc = catsConCantidad.map((c) => c.tipo === "Otros" && c.detalle ? `${c.detalle}: ${c.cantidad}` : `${c.tipo}: ${c.cantidad}`).join(", ");
      const js = Number(f.jaulasSimples) || 0, jd = Number(f.jaulasDobles) || 0;
      return { ...base, cargo: desc, categorias: catsConCantidad.map((c) => ({ tipo: c.tipo, cantidad: Number(c.cantidad), kg: Number(c.kg) || 0, detalle: c.detalle || "" })), kilos: totalCab, pesoTotal: totalKg, camiones: js + jd, jaulasSimples: js, jaulasDobles: jd };
    }
    return { ...base, cargo: cargoFinal, kilos: Number(f.kilos) };
  };

  return (
    <div className="cr-fade">
      <div className="cr-section-head"><h2 className="cr-h2">Crear Pedido</h2></div>
      <div className="cr-act-bar" style={{ marginBottom: 18 }}>
        {ACTIVIDADES.map((a) => (
          <button key={a.id} className="cr-act-btn" onClick={() => switchAct(a.id)}
            style={act === a.id ? { background: al.badge.bg, color: al.badge.c, borderColor: al.badge.c } : undefined}>
            {a.emoji} {a.label}
          </button>
        ))}
      </div>
      <div className="cr-form">
        {/* AGRÍCOLA: tipo de carga + kg */}
        {act === "agricola" && (
          <div className="cr-form-grid">
            <div className="cr-field"><label>Tipo de carga</label>
              <select value={f.cargo} onChange={set("cargo")}>{CARGO_AGRO.map((c) => <option key={c}>{c}</option>)}</select>
            </div>
            {f.cargo === "Otros" && (
              <div className="cr-field"><label>Especificar producto</label>
                <input value={f.cargoOtro} onChange={set("cargoOtro")} placeholder="Ej: Semilla de alfalfa" />
              </div>
            )}
            <div className="cr-field"><label>{al.unitLabel}</label><input value={f.kilos} onChange={(e) => setF({ ...f, kilos: e.target.value.replace(/\D/g, "") })} placeholder="Ej: 90000" /></div>
            <div className="cr-field"><label>{al.vehiculoLabel}</label><input value={f.camiones} onChange={(e) => setF({ ...f, camiones: e.target.value.replace(/\D/g, "") })} placeholder="Ej: 3" /></div>
          </div>
        )}

        {/* GANADERO: categorías con cantidades */}
        {act === "ganadero" && (
          <>
            <div className="cr-vehs-head"><span>Categorías y cantidades</span><span className="cr-hint" style={{ margin: 0 }}>Total: {totalCab} cab. · {totalKg.toLocaleString("es-AR")} kg aprox.</span></div>
            <div className="cr-cats-grid">
              {cats.map((c, i) => (
                <div className="cr-cat-row" key={c.tipo}>
                  <span className="cr-cat-label">{c.tipo}</span>
                  <input className="cr-cat-input" value={c.cantidad} onChange={(e) => setCat(i, "cantidad", e.target.value.replace(/\D/g, ""))} placeholder="Cant."
                    style={Number(c.cantidad) > 0 ? { borderColor: "#86efac", background: "#f0fdf4" } : undefined} />
                  <input className="cr-cat-input" value={c.kg} onChange={(e) => setCat(i, "kg", e.target.value.replace(/\D/g, ""))} placeholder="Kg aprox."
                    style={{ width: 90 }} />
                  {c.tipo === "Otros" && Number(c.cantidad) > 0 && (
                    <input className="cr-cat-detalle" value={c.detalle} onChange={(e) => setCat(i, "detalle", e.target.value)} placeholder="¿Qué animal?" />
                  )}
                </div>
              ))}
            </div>
            <div className="cr-vehs-head" style={{ marginTop: 14 }}><span>Jaulas necesarias</span></div>
            <div className="cr-form-grid">
              <div className="cr-field"><label>Jaulas simples</label><input value={f.jaulasSimples || ""} onChange={(e) => setF({ ...f, jaulasSimples: e.target.value.replace(/\D/g, "") })} placeholder="0" /></div>
              <div className="cr-field"><label>Jaulas dobles</label><input value={f.jaulasDobles || ""} onChange={(e) => setF({ ...f, jaulasDobles: e.target.value.replace(/\D/g, "") })} placeholder="0" /></div>
            </div>
          </>
        )}

        {/* Campos comunes: origen, destino, km, fecha */}
        <div className="cr-form-grid" style={{ marginTop: 16 }}>
          <div className="cr-field">
            <label>Origen (punto de partida)</label>
            <LocationInput localidad={f.localidad} provincia={f.provincia} accent={accent} placeholder="Localidad de origen"
              onLocalidad={(v) => setF({ ...f, localidad: v })} onProvincia={(v) => setF({ ...f, provincia: v })} />
          </div>
          <div className="cr-field">
            <label>Punto en Google Maps (origen) {coordsOrigen && <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 700 }}>✓ detectado</span>}</label>
            <input value={f.mapsOrigen} onChange={(e) => handleMapsOrigen(e.target.value)} placeholder="Pegá el link de Google Maps" style={coordsOrigen ? { borderColor: "#86efac" } : undefined} />
          </div>
          <div className="cr-field">
            <label>Destino</label>
            <LocationInput localidad={f.toLocalidad || ""} provincia={f.toProv || ""} accent={accent} placeholder="Localidad de destino"
              onLocalidad={(v) => setF({ ...f, toLocalidad: v, to: v + (f.toProv ? ", " + f.toProv : "") })}
              onProvincia={(v) => setF({ ...f, toProv: v, to: (f.toLocalidad || "") + (v ? ", " + v : "") })} />
          </div>
          <div className="cr-field">
            <label>Punto en Google Maps (destino) {coordsDest && <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 700 }}>✓ detectado</span>}</label>
            <input value={f.mapsDest} onChange={(e) => handleMapsDest(e.target.value)} placeholder="Pegá el link de Google Maps" style={coordsDest ? { borderColor: "#86efac" } : undefined} />
          </div>
          <div className="cr-field"><label>Km del recorrido</label><input value={f.km} onChange={(e) => setF({ ...f, km: e.target.value.replace(/\D/g, "") })} placeholder="Ej: 350" /></div>
          <div className="cr-field"><label>Fecha de entrega</label><input type="date" value={f.date} onChange={set("date")} /></div>
        </div>
        <p className="cr-hint">Los transportistas que filtren por tu localidad verán tu solicitud.</p>
        <div style={{ marginTop: 16 }}>
          <button className="cr-new" style={{ background: accent, opacity: ok ? 1 : 0.5 }} disabled={!ok}
            onClick={() => onCreate(buildOrder())}>
            <Plus size={17} strokeWidth={2.6} /> Publicar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ SERVICE CARD ============================ */
function ServiceCard({ svc, accent, soft, onOpen }) {
  return (
    <div className="cr-card" onClick={onOpen}>
      <div className="cr-card-main">
        <div className="cr-card-chip" style={{ background: soft }}><Wrench size={20} color={accent} strokeWidth={2} /></div>
        <div className="cr-card-body">
          <div className="cr-card-titlerow">
            <span className="cr-card-cargo">{svc.tipo}</span>
            <span className="cr-badge" style={{ background: "#fef3c7", color: "#92400e" }}>{svc.disponibilidad}</span>
          </div>
          <div className="cr-card-route"><MapPin size={14} color="#9ca3af" /><span>{svc.localidad}, {svc.provincia}</span></div>
          {svc.zonas && svc.zonas.length > 0 && (
            <div className="cr-card-zonas">También en: {svc.zonas.map((z) => z.localidad).join(", ")}</div>
          )}
          <div className="cr-card-meta">
            <span className="cr-meta-item" style={{ fontWeight: 700 }}>{svc.precio}</span>
            <span className="cr-meta-item" style={{ color: "#6b7280" }}>· {svc.owner}</span>
            
          </div>
          <p className="cr-card-desc-line">{svc.descripcion.slice(0, 90)}{svc.descripcion.length > 90 ? "…" : ""}</p>
        </div>
        <ChevronDown size={20} color="#9ca3af" className="cr-chev" style={{ transform: "rotate(-90deg)" }} />
      </div>
    </div>
  );
}

/* ============================ CREAR SERVICIO ============================ */
function CrearServicio({ accent, onCreate }) {
  const [f, setF] = useState({ tipo: "Cosechadora", descripcion: "", localidad: "", provincia: "", precio: "", disponibilidad: "Inmediata" });
  const [zonas, setZonas] = useState([]);
  const [zonaLoc, setZonaLoc] = useState("");
  const [zonaProv, setZonaProv] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const addZona = () => { if (zonaLoc && zonaProv) { setZonas([...zonas, { localidad: zonaLoc, provincia: zonaProv }]); setZonaLoc(""); setZonaProv(""); } };
  const removeZona = (i) => setZonas(zonas.filter((_, j) => j !== i));
  const ok = f.tipo && f.provincia && f.descripcion;
  return (
    <div className="cr-fade">
      <div className="cr-section-head"><h2 className="cr-h2">Publicar Servicio</h2></div>
      <div className="cr-form">
        <div className="cr-form-grid">
          <div className="cr-field"><label>Tipo de maquinaria</label>
            <select value={f.tipo} onChange={set("tipo")}>{SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </div>
          <div className="cr-field"><label>Disponibilidad</label>
            <select value={f.disponibilidad} onChange={set("disponibilidad")}><option>Inmediata</option><option>Consultar</option><option>A partir del 15/06</option></select>
          </div>
          <div className="cr-field">
            <label>Ubicación del equipo</label>
            <LocationInput localidad={f.localidad} provincia={f.provincia} accent={accent} placeholder="Donde está el equipo"
              onLocalidad={(v) => setF({ ...f, localidad: v })} onProvincia={(v) => setF({ ...f, provincia: v })} />
          </div>
          <div className="cr-field"><label>Precio</label><input value={f.precio} onChange={set("precio")} placeholder="Ej: USD 18/ha o A convenir" /></div>
          <div className="cr-field full"><label>Descripción del servicio</label>
            <textarea value={f.descripcion} onChange={set("descripcion")} rows={3} placeholder="Ej: John Deere S770 con plataforma sojera 35 pies…" style={{ resize: "vertical", fontFamily: "inherit", fontSize: 13.5, padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", width: "100%" }} />
          </div>
        </div>

        {/* Zonas donde ofrece el servicio */}
        <div className="cr-vehs-head" style={{ marginTop: 18 }}>
          <span>Localidades donde ofrezco este servicio</span>
        </div>
        <p className="cr-hint" style={{ marginTop: 0, marginBottom: 10 }}>Además de donde está el equipo, agregá las localidades a las que te desplazás para trabajar.</p>
        {zonas.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {zonas.map((z, i) => (
              <span key={i} className="cr-zona-chip">
                {z.localidad}, {z.provincia}
                <button onClick={() => removeZona(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", marginLeft: 4, padding: 0 }}><X size={13} /></button>
              </span>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div className="cr-field" style={{ flex: 1 }}>
            <label>Localidad</label>
            <input value={zonaLoc} onChange={(e) => setZonaLoc(e.target.value)} placeholder="Ej: Pergamino" />
          </div>
          <div className="cr-field" style={{ flex: 1 }}>
            <label>Provincia</label>
            <select value={zonaProv} onChange={(e) => setZonaProv(e.target.value)} style={{ height: 38, borderRadius: 9, border: "1px solid #e5e7eb", padding: "0 10px", fontFamily: "inherit", fontSize: 13 }}>
              <option value="">Provincia</option>
              {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button className="cr-btn cr-btn-ghost" style={{ height: 38, color: accent, fontWeight: 700 }} onClick={addZona} disabled={!zonaLoc || !zonaProv}><Plus size={15} /> Agregar</button>
        </div>

        <p className="cr-hint" style={{ marginTop: 14 }}>Los productores van a encontrar tu servicio buscando por la ubicación del equipo o por cualquiera de las zonas que agregues.</p>
        <div style={{ marginTop: 16 }}>
          <button className="cr-new" style={{ background: accent, opacity: ok ? 1 : 0.5 }} disabled={!ok}
            onClick={() => onCreate({ id: Date.now(), tipo: f.tipo, descripcion: f.descripcion, localidad: f.localidad, provincia: f.provincia, precio: f.precio || "A convenir", disponibilidad: f.disponibilidad, owner: ME_CONTRATISTA, zonas })}>
            <Plus size={17} strokeWidth={2.6} /> Publicar servicio
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ SOLICITUD CARD ============================ */
function SolicitudCard({ sol, accent, soft, onOpen }) {
  const urg = URGENCIAS.find((u) => u.id === sol.urgencia) || URGENCIAS[1];
  const roleBadge = { productor: { l: "Productor", c: "#16a34a" }, transportista: { l: "Transportista", c: "#2563eb" }, contratista: { l: "Contratista", c: "#d97706" } };
  const rb = roleBadge[sol.role] || roleBadge.productor;
  return (
    <div className="cr-card" onClick={onOpen}>
      <div className="cr-card-main">
        <div className="cr-card-chip" style={{ background: soft }}><ShoppingCart size={20} color={accent} strokeWidth={2} /></div>
        <div className="cr-card-body">
          <div className="cr-card-titlerow">
            <span className="cr-card-cargo">{sol.item.length > 45 ? sol.item.slice(0, 45) + "…" : sol.item}</span>
            <span className="cr-badge" style={{ background: urg.bg, color: urg.c }}>{urg.label}</span>
          </div>
          <div className="cr-card-route"><MapPin size={14} color="#9ca3af" /><span>{sol.localidad}, {sol.provincia}</span></div>
          <div className="cr-card-meta">
            <span className="cr-meta-item" style={{ color: rb.c, fontWeight: 600 }}>{rb.l}</span>
            <span className="cr-meta-item">· {sol.by}</span>
            <span className="cr-meta-item"><Calendar size={14} color="#9ca3af" /> {sol.date}</span>
            {sol.respuestas.length > 0 && <span className="cr-offers">{sol.respuestas.length} respuesta{sol.respuestas.length > 1 ? "s" : ""}</span>}
          </div>
        </div>
        <ChevronDown size={20} color="#9ca3af" className="cr-chev" style={{ transform: "rotate(-90deg)" }} />
      </div>
    </div>
  );
}

/* ============================ SOLICITUD DETAIL ============================ */
function SolicitudDetail({ sol, role, accent, soft, onBack, onRespond }) {
  const urg = URGENCIAS.find((u) => u.id === sol.urgencia) || URGENCIAS[1];
  const [precio, setPrecio] = useState("");
  const [nota, setNota] = useState("");
  const send = () => {
    if (!nota && !precio) return;
    onRespond(sol.id, { id: Date.now(), by: ROLES[role]?.user || "—", precio, nota, status: "enviada" });
    setPrecio(""); setNota("");
  };
  return (
    <div className="cr-content cr-fade">
      <button className="cr-breadcrumb" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
      <div className="cr-detail-card">
        <div className="cr-card-main">
          <div className="cr-card-chip" style={{ background: soft }}><ShoppingCart size={22} color={accent} strokeWidth={2} /></div>
          <div className="cr-card-body">
            <div className="cr-card-titlerow">
              <span className="cr-detail-cargo">{sol.item}</span>
              <span className="cr-badge" style={{ background: urg.bg, color: urg.c }}>{urg.label}</span>
            </div>
            <div className="cr-card-route" style={{ marginTop: 8 }}><MapPin size={15} color="#9ca3af" /><span>{sol.localidad}, {sol.provincia}</span></div>
          </div>
        </div>
        <div className="cr-detail-grid">
          <div><span className="cr-detail-k">Solicitante</span><span className="cr-detail-v">{sol.by}</span></div>
          <div><span className="cr-detail-k">Rol</span><span className="cr-detail-v" style={{ textTransform: "capitalize" }}>{sol.role}</span></div>
          <div><span className="cr-detail-k">Fecha</span><span className="cr-detail-v">{sol.date}</span></div>
          <div><span className="cr-detail-k">Urgencia</span><span className="cr-detail-v">{urg.label}</span></div>
        </div>
        {sol.descripcion && <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, margin: "16px 0 0", padding: "0 18px 18px" }}>{sol.descripcion}</p>}
      </div>

      <h3 className="cr-h3">Respuestas ({sol.respuestas.length})</h3>
      {sol.respuestas.length === 0 && <p className="cr-empty">Todavía no hay respuestas para esta solicitud.</p>}
      {sol.respuestas.map((r) => (
        <div className="cr-offer" key={r.id}>
          <div className="cr-offer-av" style={{ background: soft, color: accent }}>{r.by.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
          <div className="cr-offer-info">
            <div className="cr-offer-name">{r.by}</div>
            {r.nota && <div className="cr-offer-note">"{r.nota}"</div>}
          </div>
          <div className="cr-offer-right">
            {r.precio && <div className="cr-offer-price">{r.precio}</div>}
            <a className="cr-btn cr-wpp" href="https://wa.me/" target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
          </div>
        </div>
      ))}

      {role === "comercio" && (
        <>
          <h3 className="cr-h3">Responder</h3>
          <div className="cr-form">
            <div className="cr-form-grid">
              <div className="cr-field"><label>Precio / presupuesto</label><input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: $185.000 + IVA" /></div>
              <div className="cr-field full"><label>Mensaje</label><input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: Tenemos en stock, entrega en 24hs" /></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="cr-btn cr-btn-primary" style={{ background: accent }} onClick={send}>Enviar respuesta <ArrowRight size={15} /></button>
            </div>
          </div>
        </>
      )}
      <p className="cr-hint">El precio final y la entrega se coordinan directamente por teléfono o WhatsApp.</p>
    </div>
  );
}

/* ============================ SERVICE DETAIL ============================ */
function ServiceDetail({ svc, accent, soft, onBack }) {
  return (
    <div className="cr-content cr-fade">
      <button className="cr-breadcrumb" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
      <div className="cr-detail-card">
        <div className="cr-card-main">
          <div className="cr-card-chip" style={{ background: soft }}><Wrench size={22} color={accent} strokeWidth={2} /></div>
          <div className="cr-card-body">
            <div className="cr-card-titlerow">
              <span className="cr-detail-cargo">{svc.tipo}</span>
              <span className="cr-badge" style={{ background: "#fef3c7", color: "#92400e" }}>{svc.disponibilidad}</span>
            </div>
            <div className="cr-card-route" style={{ marginTop: 8 }}><MapPin size={15} color="#9ca3af" /><span>{svc.localidad}, {svc.provincia}</span></div>
          </div>
        </div>
        <div className="cr-detail-grid">
          <div><span className="cr-detail-k">Tipo</span><span className="cr-detail-v">{svc.tipo}</span></div>
          <div><span className="cr-detail-k">Precio</span><span className="cr-detail-v">{svc.precio}</span></div>
          <div><span className="cr-detail-k">Contratista</span><span className="cr-detail-v">{svc.owner}</span></div>
          <div><span className="cr-detail-k">Disponibilidad</span><span className="cr-detail-v">{svc.disponibilidad}</span></div>
          <div><span className="cr-detail-k">Ubicación del equipo</span><span className="cr-detail-v">{svc.localidad}, {svc.provincia}</span></div>
          {svc.zonas && svc.zonas.length > 0 && (
            <div><span className="cr-detail-k">También trabaja en</span><span className="cr-detail-v">{svc.zonas.map((z) => `${z.localidad} (${z.provincia})`).join(", ")}</span></div>
          )}
        </div>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, margin: "16px 0 0", padding: "0 18px 18px" }}>{svc.descripcion}</p>
      </div>
      <div style={{ padding: "0 0 20px" }}>
        <a className="cr-btn cr-wpp" href="https://wa.me/" target="_blank" rel="noreferrer" style={{ display: "inline-flex" }}><MessageCircle size={15} /> Contactar por WhatsApp</a>
      </div>
      <p className="cr-hint">El precio final y las condiciones se acuerdan directamente con el contratista.</p>
    </div>
  );
}

/* ============================ CREAR SOLICITUD ============================ */
function CrearSolicitud({ accent, role, onCreate }) {
  const [f, setF] = useState({ item: "", descripcion: "", urgencia: "normal", localidad: "", provincia: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.item && f.provincia;
  return (
    <div className="cr-form" style={{ marginTop: 16 }}>
      <div className="cr-form-grid">
        <div className="cr-field full"><label>¿Qué necesitás?</label><input value={f.item} onChange={set("item")} placeholder="Ej: Correa de cosechadora JD S770" /></div>
        <div className="cr-field"><label>Urgencia</label>
          <select value={f.urgencia} onChange={set("urgencia")}>{URGENCIAS.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</select>
        </div>
        <div className="cr-field">
          <label>Localidad</label>
          <LocationInput localidad={f.localidad} provincia={f.provincia} accent={accent} placeholder="Tu localidad"
            onLocalidad={(v) => setF({ ...f, localidad: v })} onProvincia={(v) => setF({ ...f, provincia: v })} />
        </div>
        <div className="cr-field full"><label>Detalle (opcional)</label><input value={f.descripcion} onChange={set("descripcion")} placeholder="Modelo, cantidad, si aceptás genérico…" /></div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button className="cr-new" style={{ background: accent, opacity: ok ? 1 : 0.5 }} disabled={!ok}
          onClick={() => { onCreate({ id: Date.now(), item: f.item, descripcion: f.descripcion, urgencia: f.urgencia, localidad: f.localidad, provincia: f.provincia, cp: f.cp, by: ROLES[role]?.user || "—", role, date: new Date().toISOString().slice(0, 10), respuestas: [] }); setF({ item: "", descripcion: "", urgencia: "normal", localidad: "", provincia: "" }); }}>
          <Plus size={17} strokeWidth={2.6} /> Publicar solicitud
        </button>
      </div>
    </div>
  );
}

/* ============================ PRESUPUESTO CARD ============================ */
function PresupuestoCard({ pres, accent, soft, onOpen }) {
  const ab = (ACT_LABELS[pres.actividad] || ACT_LABELS.agricola).badge;
  return (
    <div className="cr-card" onClick={onOpen}>
      <div className="cr-card-main">
        <div className="cr-card-chip" style={{ background: soft }}><Package size={20} color={accent} strokeWidth={2} /></div>
        <div className="cr-card-body">
          <div className="cr-card-titlerow">
            <span className="cr-card-cargo">{pres.titulo.length > 40 ? pres.titulo.slice(0, 40) + "…" : pres.titulo}</span>
            <span className="cr-badge" style={{ background: ab.bg, color: ab.c }}>{ab.t}</span>
          </div>
          <div className="cr-card-route"><MapPin size={14} color="#9ca3af" /><span>{pres.localidad}, {pres.provincia} · {pres.categoria}</span></div>
          <div className="cr-card-meta">
            <span className="cr-meta-item">· {pres.by}</span>
            <span className="cr-meta-item"><Calendar size={14} color="#9ca3af" /> {pres.date}</span>
            {pres.respuestas.length > 0 && <span className="cr-offers">{pres.respuestas.length} cotización{pres.respuestas.length > 1 ? "es" : ""}</span>}
          </div>
        </div>
        <ChevronDown size={20} color="#9ca3af" className="cr-chev" style={{ transform: "rotate(-90deg)" }} />
      </div>
    </div>
  );
}

/* ============================ PRESUPUESTO DETAIL ============================ */
function PresupuestoDetail({ pres, role, accent, soft, onBack, onRespond }) {
  const ab = (ACT_LABELS[pres.actividad] || ACT_LABELS.agricola).badge;
  const [precio, setPrecio] = useState("");
  const [nota, setNota] = useState("");
  const [validez, setValidez] = useState("7 días");
  const send = () => {
    if (!precio) return;
    onRespond(pres.id, { id: Date.now(), by: ROLES[role]?.user || "—", precio, nota, validez, status: "enviada" });
    setPrecio(""); setNota("");
  };
  return (
    <div className="cr-content cr-fade">
      <button className="cr-breadcrumb" onClick={onBack}><ArrowLeft size={16} /> Volver</button>
      <div className="cr-detail-card">
        <div className="cr-card-main">
          <div className="cr-card-chip" style={{ background: soft }}><Package size={22} color={accent} strokeWidth={2} /></div>
          <div className="cr-card-body">
            <div className="cr-card-titlerow">
              <span className="cr-detail-cargo">{pres.titulo}</span>
              <span className="cr-badge" style={{ background: ab.bg, color: ab.c }}>{ab.t}</span>
            </div>
          </div>
        </div>
        <div className="cr-detail-grid">
          <div><span className="cr-detail-k">Categoría</span><span className="cr-detail-v">{pres.categoria}</span></div>
          <div><span className="cr-detail-k">Solicitante</span><span className="cr-detail-v">{pres.by}</span></div>
          <div><span className="cr-detail-k">Localidad</span><span className="cr-detail-v">{pres.localidad}, {pres.provincia}</span></div>
          <div><span className="cr-detail-k">Fecha</span><span className="cr-detail-v">{pres.date}</span></div>
        </div>
        <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.6, margin: "16px 0 0", padding: "0 18px 18px" }}>{pres.descripcion}</p>
      </div>

      <h3 className="cr-h3">Cotizaciones recibidas ({pres.respuestas.length})</h3>
      {pres.respuestas.length === 0 && <p className="cr-empty">Todavía no hay cotizaciones para este pedido de presupuesto.</p>}
      {pres.respuestas.map((r) => (
        <div className="cr-offer" key={r.id}>
          <div className="cr-offer-av" style={{ background: soft, color: accent }}>{r.by.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
          <div className="cr-offer-info">
            <div className="cr-offer-name">{r.by}</div>
            {r.nota && <div className="cr-offer-note">"{r.nota}"</div>}
            {r.validez && <div className="cr-offer-zona">Validez: {r.validez}</div>}
          </div>
          <div className="cr-offer-right">
            <div className="cr-offer-price">{r.precio}</div>
            <a className="cr-btn cr-wpp" href="https://wa.me/" target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a>
          </div>
        </div>
      ))}

      {role === "comercio" && (
        <>
          <h3 className="cr-h3">Enviar cotización</h3>
          <div className="cr-form">
            <div className="cr-form-grid">
              <div className="cr-field"><label>Precio total</label><input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Ej: $12.500.000 + IVA" /></div>
              <div className="cr-field"><label>Validez</label>
                <select value={validez} onChange={(e) => setValidez(e.target.value)}><option>7 días</option><option>15 días</option><option>30 días</option></select>
              </div>
              <div className="cr-field full"><label>Detalle / condiciones</label><input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: Incluye entrega, pago a 30 días" /></div>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="cr-btn cr-btn-primary" style={{ background: accent }} onClick={send}>Enviar cotización <ArrowRight size={15} /></button>
            </div>
          </div>
        </>
      )}
      <p className="cr-hint">Las condiciones finales se acuerdan directamente entre las partes.</p>
    </div>
  );
}

/* ============================ CREAR PRESUPUESTO ============================ */
function CrearPresupuesto({ accent, onCreate }) {
  const [act, setAct] = useState("agricola");
  const cats = [...(PRESUPUESTO_CATS[act] || []), ...(PRESUPUESTO_CATS.general || [])];
  const [f, setF] = useState({ titulo: "", categoria: cats[0] || "", descripcion: "", localidad: "", provincia: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const switchAct = (a) => { setAct(a); const nc = [...(PRESUPUESTO_CATS[a] || []), ...(PRESUPUESTO_CATS.general || [])]; setF({ ...f, categoria: nc[0] || "" }); };
  const ok = f.titulo && f.categoria && f.provincia;
  const al = ACT_LABELS[act] || ACT_LABELS.agricola;
  return (
    <div className="cr-fade">
      <div className="cr-section-head"><h2 className="cr-h2">Pedir Presupuesto</h2></div>
      <div className="cr-form">
        <div className="cr-act-bar">
          {ACTIVIDADES.map((a) => (
            <button key={a.id} className="cr-act-btn" onClick={() => switchAct(a.id)}
              style={act === a.id ? { background: al.badge.bg, color: al.badge.c, borderColor: al.badge.c } : undefined}>
              {a.emoji} {a.label}
            </button>
          ))}
        </div>
        <div className="cr-form-grid">
          <div className="cr-field full"><label>Título del pedido</label><input value={f.titulo} onChange={set("titulo")} placeholder="Ej: Agroquímicos para campaña gruesa 2026" /></div>
          <div className="cr-field"><label>Categoría</label>
            <select value={f.categoria} onChange={set("categoria")}>{cats.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="cr-field">
            <label>Localidad de entrega</label>
            <LocationInput localidad={f.localidad} provincia={f.provincia} accent={accent} placeholder="Tu localidad"
              onLocalidad={(v) => setF({ ...f, localidad: v })} onProvincia={(v) => setF({ ...f, provincia: v })} />
          </div>
          <div className="cr-field full"><label>Descripción detallada</label>
            <textarea value={f.descripcion} onChange={set("descripcion")} rows={3} placeholder="Detallá qué necesitás, cantidades, superficie, marcas preferidas…" style={{ resize: "vertical", fontFamily: "inherit", fontSize: 13.5, padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", width: "100%" }} />
          </div>
        </div>
        <p className="cr-hint">Tu pedido de presupuesto lo verán todos los comercios de la plataforma. Vas a recibir cotizaciones que podés comparar.</p>
        <div style={{ marginTop: 16 }}>
          <button className="cr-new" style={{ background: accent, opacity: ok ? 1 : 0.5 }} disabled={!ok}
            onClick={() => { onCreate({ id: Date.now(), titulo: f.titulo, categoria: f.categoria, actividad: act, descripcion: f.descripcion, localidad: f.localidad, provincia: f.provincia, cp: f.cp, by: ROLES[role]?.user || "—", date: new Date().toISOString().slice(0, 10), respuestas: [] }); setF({ titulo: "", categoria: cats[0] || "", descripcion: "", localidad: "", provincia: "" }); }}>
            <Plus size={17} strokeWidth={2.6} /> Publicar pedido de presupuesto
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ MY JOB CARD (transportista) ============================ */
const OFFER_PILL = {
  aceptada: { t: "Ganada", bg: "#dcfce7", c: "#166534" },
  enviada: { t: "En juego", bg: "#dbeafe", c: "#1d4ed8" },
  rechazada: { t: "No seleccionada", bg: "#f3f4f6", c: "#6b7280" },
};
function MyJobCard({ order, accent, soft, onOpen }) {
  const myOffer = myOffersIn(order)[0];
  const state = myJobState(order);
  const head =
    state === "ganado" ? { t: "Ganado", bg: "#dcfce7", c: "#166534" }
    : state === "enjuego" ? { t: "En juego", bg: "#dbeafe", c: "#1d4ed8" }
    : { t: "No seleccionado", bg: "#f3f4f6", c: "#6b7280" };
  const pill = myOffer ? (OFFER_PILL[myOffer.status] || OFFER_PILL.enviada) : null;

  return (
    <div className="cr-card" onClick={onOpen}>
      <div className="cr-card-main">
        <div className="cr-card-chip" style={{ background: soft }}><Box size={20} color={accent} strokeWidth={2} /></div>
        <div className="cr-card-body">
          <div className="cr-card-titlerow">
            <span className="cr-card-cargo">{order.cargo}</span>
            <span className="cr-badge" style={{ background: head.bg, color: head.c }}>{head.t}</span>
          </div>
          <div className="cr-card-route">
            <MapPin size={14} color="#9ca3af" />
            <span>{order.localidad} → {order.to}{order.km ? ` · ${order.km} km` : ""}</span>
          </div>
          <div className="cr-card-meta">
            <span className="cr-meta-item"><Weight size={14} color="#9ca3af" /> {Number(order.kilos).toLocaleString("es-AR")} kg</span>
            <span className="cr-meta-item"><Truck size={14} color="#9ca3af" /> {order.camiones} camión{order.camiones > 1 ? "es" : ""}</span>
            <span className="cr-meta-item"><Calendar size={14} color="#9ca3af" /> {order.date}</span>
          </div>
          {myOffer && (
            <div className="cr-job-lines">
              <div className="cr-job-line">
                <span className="cr-job-loc">Tu oferta</span>
                <span className="cr-status-pill" style={{ background: pill.bg, color: pill.c }}>{pill.t}</span>
                <span className="cr-job-meta">{myOffer.camiones} cam · {peso(myOffer.price)}/tn</span>
              </div>
            </div>
          )}
        </div>
        <ChevronDown size={20} color="#9ca3af" className="cr-chev" style={{ transform: "rotate(-90deg)" }} />
      </div>
    </div>
  );
}

/* ============================ APP ============================ */
export default function CarretaApp() {
  const [screen, setScreen] = useState("landing"); // landing | panel
  const [role, setRole] = useState(null);
  const [tab, setTab] = useState("pedidos");
  const [selected, setSelected] = useState(null);
  const [selService, setSelService] = useState(null);
  const [selSolicitud, setSelSolicitud] = useState(null);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [solicitudes, setSolicitudes] = useState(INITIAL_SOLICITUDES);
  const [locFilter, setLocFilter] = useState("");
  const [svcType, setSvcType] = useState("Todos");
  const [svcLocFilter, setSvcLocFilter] = useState("");
  const [presupuestos, setPresupuestos] = useState(INITIAL_PRESUPUESTOS);
  const [selPresupuesto, setSelPresupuesto] = useState(null);
  const [actFilter, setActFilter] = useState("ambos");

  const R = role ? ROLES[role] : null;

  const pickRole = (r) => { setRole(r); setTab(ROLES[r].tabs[0].id); setScreen("panel"); clearSel(); };
  const clearSel = () => { setSelected(null); setSelService(null); setSelSolicitud(null); setSelPresupuesto(null); };
  const back = () => {
    if (selected || selService || selSolicitud || selPresupuesto) { clearSel(); return; }
    setScreen("landing"); setRole(null);
  };
  const switchRole = (r) => { setRole(r); setTab(ROLES[r].tabs[0].id); clearSel(); };

  const confirmOffer = (orderId, offerId) => setOrders((os) => os.map((o) =>
    o.id !== orderId ? o : { ...o, offers: o.offers.map((x) => ({ ...x, status: x.id === offerId ? "aceptada" : "rechazada" })) }));
  const sendOffer = (orderId, offer) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, offers: [...o.offers, offer] }));
  const createOrder = (order) => { setOrders((os) => [order, ...os]); setTab("pedidos"); };
  const pauseOrder = (orderId) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, estado: "pausado" }));
  const resumeOrder = (orderId) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, estado: "activo" }));
  const cancelOrder = (orderId) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, estado: "cancelado" }));
  const reportContingencia = (orderId, incidencia) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, incidencia }));
  const resolveContingencia = (orderId, modo) => setOrders((os) => os.map((o) => {
    if (o.id !== orderId) return o;
    if (modo === "mismo") {
      // Devolver al mismo transportista: quitar incidencia, mantener oferta aceptada
      return { ...o, incidencia: null };
    } else {
      // Republicar: quitar incidencia + resetear todas las ofertas → vuelve a Pendiente
      return { ...o, incidencia: null, offers: [] };
    }
  }));
  const reportEntrega = (orderId, entrega) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, entrega }));
  const confirmRecepcion = (orderId) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, recepcion: { fecha: new Date().toISOString().slice(0, 10), by: "María González" } }));
  const calificar = (orderId, quien, calif) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, calificaciones: { ...(o.calificaciones || {}), [quien]: calif } }));
  const editOrder = (orderId, changes) => setOrders((os) => os.map((o) => o.id !== orderId ? o : { ...o, ...changes }));
  const createService = (svc) => { setServices((ss) => [svc, ...ss]); setTab("misservicios"); };
  const createSolicitud = (sol) => { setSolicitudes((ss) => [sol, ...ss]); };
  const respondSolicitud = (solId, resp) => setSolicitudes((ss) => ss.map((s) => s.id !== solId ? s : { ...s, respuestas: [...s.respuestas, resp] }));
  const createPresupuesto = (p) => { setPresupuestos((ps) => [p, ...ps]); };
  const respondPresupuesto = (pId, resp) => setPresupuestos((ps) => ps.map((p) => p.id !== pId ? p : { ...p, respuestas: [...p.respuestas, resp] }));
  const uploadCpe = (orderId, offerId, vehIdx, cpeData) => setOrders((os) => os.map((o) => {
    if (o.id !== orderId) return o;
    return { ...o, offers: o.offers.map((of) => {
      if (of.id !== offerId || !of.vehiculos) return of;
      return { ...of, vehiculos: of.vehiculos.map((v, i) => i === vehIdx ? { ...v, cpe: cpeData } : v) };
    }) };
  }));
  const reassignVehicle = (orderId, offerId, vehIdx, newData) => setOrders((os) => os.map((o) => {
    if (o.id !== orderId) return o;
    return { ...o, offers: o.offers.map((of) => {
      if (of.id !== offerId || !of.vehiculos) return of;
      return { ...of, vehiculos: of.vehiculos.map((v, i) => i === vehIdx ? { ...v, ...newData, cpe: null } : v) };
    }) };
  }));

  const available = useMemo(() => {
    return orders
      .filter((o) => isOpen(o) && !["Finalizado","Cancelado"].includes(orderStatus(o)))
      .filter((o) => actFilter === "ambos" || o.actividad === actFilter)
      .filter((o) => !locFilter || o.localidad.toLowerCase().includes(locFilter.toLowerCase()));
  }, [orders, actFilter, locFilter]);
  // Pedidos activos vs finalizados
  const activeOrders = useMemo(() => orders.filter((o) => !["Finalizado", "Cancelado"].includes(orderStatus(o))), [orders]);
  const productorOrders = activeOrders;
  const historyOrders = useMemo(() => orders.filter((o) => ["Finalizado", "Cancelado"].includes(orderStatus(o))), [orders]);
  const mineHistory = useMemo(() => historyOrders.filter((o) => o.offers.some((of) => of.by === ME_TRANSPORTISTA)), [historyOrders]);
  const mine = useMemo(() => activeOrders.filter((o) => o.offers.some((of) => of.by === ME_TRANSPORTISTA)), [activeOrders]);
  const mineGroups = useMemo(() => {
    const g = { ganado: [], enjuego: [], perdido: [] };
    mine.forEach((o) => g[myJobState(o)].push(o));
    return g;
  }, [mine]);
  const mineBadge = mineGroups.enjuego.length + mineGroups.ganado.length;
  const selectedOrder = orders.find((o) => o.id === selected);
  const selectedSvc = services.find((s) => s.id === selService);
  const selectedSol = solicitudes.find((s) => s.id === selSolicitud);
  const selectedPres = presupuestos.find((p) => p.id === selPresupuesto);
  const hasDetail = selectedOrder || selectedSvc || selectedSol || selectedPres;

  // Solicitudes propias del rol actual
  const mySolicitudes = useMemo(() => solicitudes.filter((s) => s.by === (R ? R.user : "")), [solicitudes, R]);
  // Presupuestos propios del productor
  const myPresupuestos = useMemo(() => presupuestos.filter((p) => p.by === (R ? R.user : "")), [presupuestos, R]);
  // Servicios propios del contratista
  const myServices = useMemo(() => services.filter((s) => s.owner === (ME_TRANSPORTISTA)), [services]);
  // Servicios filtrados para el Productor (tipo + cercanía)
  const filteredServices = useMemo(() => {
    let list = services;
    if (svcType !== "Todos") list = list.filter((s) => s.tipo === svcType);
    if (svcLocFilter) {
      const q = svcLocFilter.toLowerCase();
      list = list.filter((s) =>
        s.localidad.toLowerCase().includes(q) ||
        (s.zonas || []).some((z) => z.localidad.toLowerCase().includes(q))
      );
    }
    return list;
  }, [services, svcType, svcLocFilter]);

  // Exportar historial a CSV/Excel
  const exportarHistorial = (lista, filename) => {
    const rows = [["ID","Actividad","Carga","Origen","Destino","Km","Cantidad","Camiones","Fecha","Productor","Estado","Transportista","Precio"]];
    lista.forEach((o) => {
      const st = orderStatus(o);
      const acc = (o.offers || []).find((of) => of.status === "aceptada");
      rows.push([o.id, o.actividad, o.cargo, o.localidad + " " + o.provincia, o.to, o.km || "", o.kilos, o.camiones, o.date, o.owner, st, acc ? acc.by : "", acc ? acc.price : ""]);
    });
    const csv = rows.map((r) => r.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
  };

  return (
    <div className="cr-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *{ box-sizing:border-box; }
        .cr-app{ font-family:'Plus Jakarta Sans',system-ui,sans-serif; min-height:100vh; color:#1f2937; position:relative; background:#f6f7f8; }
        .cr-fade{ animation:crfade .35s ease; }
        @keyframes crfade{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:none; } }

        /* ---------- LANDING ---------- */
        .cr-landing{ position:relative; min-height:100vh; display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:64px 24px; overflow:hidden; color:#fff; }
        .cr-bg{ position:absolute; inset:0; z-index:0;
          background:radial-gradient(120% 80% at 50% 18%, rgba(120,150,180,0.25), transparent 55%),
          linear-gradient(to bottom,#14253a 0%,#1c2f43 26%,#2e3a39 48%,#574a2a 66%,#3a2f1c 82%,#181308 100%); }
        .cr-overlay{ position:absolute; inset:0; z-index:1;
          background:radial-gradient(110% 90% at 50% 40%, rgba(0,0,0,0.15), rgba(6,10,14,0.78) 100%),
          linear-gradient(to bottom, rgba(8,12,18,0.55), rgba(8,12,18,0.45) 45%, rgba(6,9,12,0.8)); }
        .cr-l-content{ position:relative; z-index:2; width:100%; max-width:920px; display:flex; flex-direction:column; align-items:center; text-align:center; }
        .cr-logo{ display:flex; align-items:center; gap:13px; }
        .cr-logo-chip{ width:48px; height:48px; border-radius:13px; display:grid; place-items:center; background:linear-gradient(140deg,#22c55e,#15803d); box-shadow:0 8px 22px rgba(21,128,61,0.45); }
        .cr-logo-name{ font-size:31px; font-weight:800; letter-spacing:-0.02em; }
        .cr-tagline{ margin-top:22px; font-size:16px; line-height:1.55; color:rgba(255,255,255,0.8); max-width:520px; }
        .cr-stats{ display:flex; gap:54px; margin-top:34px; flex-wrap:wrap; justify-content:center; }
        .cr-stat{ display:flex; flex-direction:column; align-items:center; gap:7px; }
        .cr-stat-val{ font-size:25px; font-weight:800; }
        .cr-stat-lbl{ font-size:13px; color:rgba(255,255,255,0.62); font-weight:500; }
        .cr-howto{ margin-top:46px; font-size:12.5px; font-weight:600; letter-spacing:0.16em; text-transform:uppercase; color:rgba(255,255,255,0.55); }
        .cr-cards{ display:flex; gap:18px; margin-top:22px; width:100%; justify-content:center; flex-wrap:wrap; }
        .cr-lcard{ flex:1 1 220px; max-width:280px; text-align:left; cursor:pointer; background:rgba(15,20,26,0.5);
          backdrop-filter:blur(13px); -webkit-backdrop-filter:blur(13px); border:1px solid rgba(255,255,255,0.10);
          border-radius:18px; padding:26px 28px; transition:transform .25s, border-color .25s, background .25s, box-shadow .25s; }
        .cr-lcard:hover{ transform:translateY(-4px); background:rgba(22,28,35,0.62); border-color:rgba(255,255,255,0.22); box-shadow:0 22px 48px rgba(0,0,0,0.4); }
        .cr-lcard-head{ display:flex; align-items:center; justify-content:space-between; }
        .cr-lcard-chip{ width:48px; height:48px; border-radius:13px; display:grid; place-items:center; }
        .cr-lcard-arrow{ color:rgba(255,255,255,0.5); transition:transform .25s, color .25s; }
        .cr-lcard:hover .cr-lcard-arrow{ transform:translateX(5px); color:rgba(255,255,255,0.9); }
        .cr-lcard-title{ margin-top:16px; font-size:18px; font-weight:700; }
        .cr-lcard-desc{ margin-top:7px; font-size:12.5px; line-height:1.5; color:rgba(255,255,255,0.62); }
        .cr-points{ list-style:none; padding:0; margin:18px 0 0; }
        .cr-point{ display:flex; align-items:center; gap:10px; font-size:13px; color:rgba(255,255,255,0.78); margin-bottom:10px; }
        .cr-dot{ width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .cr-footer{ position:relative; z-index:2; margin-top:48px; font-size:12.5px; color:rgba(255,255,255,0.42); font-weight:500; }
        .cr-login-box{ background:rgba(15,20,26,0.5); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,0.1); border-radius:18px; padding:28px; max-width:340px; margin:28px auto 0; }
        .cr-login-input{ display:block; width:100%; height:42px; padding:0 14px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.15); border-radius:10px; background:rgba(255,255,255,0.08); color:#fff; font-family:inherit; font-size:14px; outline:none; box-sizing:border-box; }
        .cr-login-input:focus{ border-color:rgba(255,255,255,0.4); }
        .cr-login-input::placeholder{ color:rgba(255,255,255,0.35); }
        .cr-login-btn{ display:block; width:100%; height:44px; margin-top:14px; border:none; border-radius:10px; background:#22c55e; color:#fff; font-family:inherit; font-size:15px; font-weight:700; cursor:pointer; }
        .cr-login-btn:hover{ background:#16a34a; }

        /* ---------- PANEL ---------- */
        .cr-header{ background:#fff; border-bottom:1px solid #ececec; }
        .cr-header-top{ display:flex; align-items:center; gap:14px; padding:0 28px; height:64px; }
        .cr-back{ display:grid; place-items:center; width:34px; height:34px; border-radius:9px; background:transparent; border:none; color:#6b7280; cursor:pointer; transition:background .15s; }
        .cr-back:hover{ background:#f3f4f6; }
        .cr-logo-chip2{ width:40px; height:40px; border-radius:11px; display:grid; place-items:center; }
        .cr-title{ font-size:16px; font-weight:700; color:#111827; }
        .cr-sub{ font-size:13px; font-weight:500; color:#9ca3af; margin-left:7px; }
        .cr-avatar{ margin-left:auto; width:40px; height:40px; border-radius:50%; display:grid; place-items:center; font-size:13px; font-weight:700; }
        .cr-tabs{ display:flex; gap:6px; padding:0 28px; }
        .cr-tab{ display:flex; align-items:center; gap:8px; height:46px; padding:0 10px; background:none; border:none; cursor:pointer; font-family:inherit; font-size:14px; font-weight:600; color:#6b7280; border-bottom:2px solid transparent; transition:color .15s; }
        .cr-tab:hover{ color:#374151; }
        .cr-tab-badge{ font-size:11px; font-weight:700; min-width:18px; height:18px; padding:0 5px; border-radius:9px; display:grid; place-items:center; color:#fff; }

        .cr-content{ max-width:920px; margin:0 auto; padding:26px 28px 90px; }
        .cr-section-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
        .cr-h2{ font-size:18px; font-weight:700; color:#111827; }
        .cr-h3{ font-size:15px; font-weight:700; color:#111827; margin:26px 0 14px; }
        .cr-new{ display:flex; align-items:center; gap:7px; height:40px; padding:0 16px; border:none; border-radius:10px; color:#fff; font-family:inherit; font-size:13.5px; font-weight:700; cursor:pointer; transition:filter .15s; }
        .cr-new:hover{ filter:brightness(0.95); }

        .cr-card{ background:#fff; border:1px solid #eef0f2; border-radius:14px; padding:16px 18px; margin-bottom:14px; cursor:pointer; transition:border-color .18s, box-shadow .18s, transform .12s; }
        .cr-card:hover{ border-color:#e2e5e9; box-shadow:0 4px 16px rgba(0,0,0,0.05); transform:translateY(-1px); }
        .cr-card-main{ display:flex; align-items:flex-start; gap:14px; }
        .cr-card-chip{ width:38px; height:38px; border-radius:10px; display:grid; place-items:center; flex-shrink:0; }
        .cr-card-body{ flex:1; min-width:0; }
        .cr-card-titlerow{ display:flex; align-items:center; gap:10px; }
        .cr-card-cargo{ font-size:16px; font-weight:700; color:#1f2937; }
        .cr-detail-cargo{ font-size:20px; font-weight:800; color:#111827; }
        .cr-badge{ font-size:11.5px; font-weight:600; padding:2px 9px; border-radius:20px; }
        .cr-card-route{ display:flex; align-items:center; gap:6px; margin-top:7px; font-size:13.5px; color:#6b7280; flex-wrap:wrap; }
        .cr-cp{ font-size:11px; font-weight:600; color:#6b7280; background:#f3f4f6; padding:2px 7px; border-radius:5px; }
        .cr-card-meta{ display:flex; align-items:center; gap:18px; margin-top:9px; font-size:12.5px; color:#9ca3af; flex-wrap:wrap; }
        .cr-card-desc-line{ margin:8px 0 0; font-size:12.5px; color:#6b7280; line-height:1.45; }
        .cr-meta-item{ display:flex; align-items:center; gap:5px; }
        .cr-offers{ color:#2563eb; font-weight:600; }
        .cr-chev{ flex-shrink:0; margin-top:2px; }

        .cr-breadcrumb{ display:inline-flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-family:inherit; font-size:13.5px; font-weight:600; color:#6b7280; padding:0; margin-bottom:18px; }
        .cr-breadcrumb:hover{ color:#374151; }
        .cr-detail-card{ background:#fff; border:1px solid #eef0f2; border-radius:16px; padding:22px; }
        .cr-detail-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px 24px; margin-top:20px; padding-top:18px; border-top:1px solid #f1f2f4; }
        .cr-detail-k{ display:block; font-size:11px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; }
        .cr-detail-v{ display:block; font-size:14px; font-weight:600; color:#374151; margin-top:3px; }

        .cr-offer{ display:flex; align-items:center; gap:14px; background:#fff; border:1px solid #eef0f2; border-radius:13px; padding:16px 18px; margin-bottom:12px; transition:border-color .15s; }
        .cr-offer.is-acc{ border-color:#bbf7d0; background:#f6fef9; }
        .cr-offer.is-rej{ opacity:0.55; }
        .cr-offer-av{ width:42px; height:42px; border-radius:50%; display:grid; place-items:center; font-weight:700; font-size:13px; flex-shrink:0; }
        .cr-offer-info{ flex:1; min-width:0; }
        .cr-offer-name{ font-size:14.5px; font-weight:700; color:#1f2937; display:flex; align-items:center; gap:9px; flex-wrap:wrap; }
        .cr-offer-zona{ font-size:12.5px; color:#9ca3af; margin-top:2px; }
        .cr-offer-note{ font-size:12.5px; color:#6b7280; margin-top:6px; font-style:italic; }
        .cr-offer-right{ display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }
        .cr-offer-price{ font-size:18px; font-weight:800; color:#111827; white-space:nowrap; }
        .cr-offer-price span{ font-size:11px; font-weight:600; color:#9ca3af; }
        .cr-tag-acc{ display:inline-flex; align-items:center; gap:4px; font-size:11px; font-weight:700; background:#dcfce7; color:#166534; padding:2px 8px; border-radius:20px; }
        .cr-tag-rej{ font-size:11px; font-weight:600; color:#9ca3af; }

        .cr-btn{ display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 16px; border-radius:9px; font-family:inherit; font-size:13px; font-weight:600; cursor:pointer; border:1px solid transparent; transition:filter .15s, background .15s; text-decoration:none; }
        .cr-btn-primary{ color:#fff; }
        .cr-btn-primary:hover{ filter:brightness(0.95); }
        .cr-btn-ghost{ background:#fff; border-color:#e5e7eb; color:#374151; }
        .cr-btn-ghost:hover{ background:#f9fafb; }
        .cr-wpp{ background:#25d366; color:#fff; }
        .cr-wpp:hover{ filter:brightness(0.95); }
        .cr-hint{ font-size:12.5px; color:#9ca3af; margin-top:14px; line-height:1.5; }
        .cr-cp-note{ display:flex; align-items:center; gap:7px; font-size:13px; color:#6b7280; margin:-10px 0 18px; }
        .cr-cp-note strong{ color:#374151; font-weight:700; }
        .cr-saved-tag{ color:#9ca3af; font-weight:600; margin-left:6px; }

        .cr-cpbar{ display:flex; align-items:center; gap:12px; background:#fff; border:1px solid #eef0f2; border-radius:12px; padding:12px 16px; margin-bottom:22px; }
        .cr-cpbar label{ display:flex; align-items:center; gap:7px; font-size:13.5px; font-weight:600; color:#374151; white-space:nowrap; }
        .cr-cpbar input{ flex:1; height:38px; padding:0 12px; border:1px solid #e5e7eb; border-radius:9px; font-family:inherit; font-size:13.5px; outline:none; }
        .cr-cpbar input:focus{ border-color:#93c5fd; }
        .cr-dist{ display:inline-flex; align-items:center; gap:4px; font-weight:700; }
        .cr-radius{ margin-bottom:18px; }
        .cr-radius-lbl{ display:block; font-size:12px; font-weight:600; color:#9ca3af; text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px; }
        .cr-radius-opts{ display:flex; gap:8px; flex-wrap:wrap; }
        .cr-radius-btn{ height:34px; padding:0 14px; border:1px solid #e5e7eb; border-radius:20px; background:#fff; cursor:pointer; font-family:inherit; font-size:13px; font-weight:600; color:#6b7280; transition:all .15s; }
        .cr-radius-btn:hover{ border-color:#d1d5db; }
        .cr-save{ height:38px; padding:0 18px; border:none; border-radius:9px; background:#2563eb; color:#fff; font-family:inherit; font-size:13.5px; font-weight:700; cursor:pointer; }
        .cr-save:hover{ filter:brightness(0.95); }

        .cr-form{ background:#fff; border:1px solid #eef0f2; border-radius:14px; padding:24px; }
        .cr-act-bar{ display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap; }
        .cr-act-btn{ display:flex; align-items:center; gap:6px; height:36px; padding:0 14px; border:1.5px solid #e5e7eb; border-radius:20px; background:#fff; font-family:inherit; font-size:13px; font-weight:600; color:#6b7280; cursor:pointer; transition:all .15s; }
        .cr-act-btn:hover{ border-color:#d1d5db; background:#f9fafb; }
        .cr-loc-input{ display:flex; gap:8px; }
        .cr-loc-text{ flex:1; height:38px; padding:0 12px; border:1px solid #e5e7eb; border-radius:9px; font-family:inherit; font-size:13.5px; outline:none; }
        .cr-loc-text:focus{ border-color:#93c5fd; }
        .cr-loc-prov{ height:38px; padding:0 10px; border:1px solid #e5e7eb; border-radius:9px; font-family:inherit; font-size:13px; font-weight:600; color:#374151; cursor:pointer; background:#fff; }
        .cr-map{ height:240px; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; }
        .cr-map-ph{ min-height:90px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; text-align:center; background:#f9fafb; border:1px dashed #e5e7eb; border-radius:12px; padding:18px; font-size:13px; color:#6b7280; }
        .cr-costo{ background:#f9fafb; border:1px solid #eef0f2; border-radius:12px; padding:14px 16px; }
        .cr-costo-row{ display:flex; align-items:center; justify-content:space-between; font-size:13.5px; color:#374151; padding:4px 0; }
        .cr-costo-row span{ display:flex; align-items:center; gap:7px; }
        .cr-costo-total{ border-top:1px solid #eceef0; margin-top:4px; padding-top:8px; font-size:15px; }
        .cr-costo-total strong{ color:#166534; font-size:17px; }
        .cr-form-grid{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
        .cr-field{ display:flex; flex-direction:column; gap:6px; }
        .cr-field.full{ grid-column:1 / -1; }
        .cr-field label{ font-size:12.5px; font-weight:600; color:#374151; }
        .cr-field input, .cr-field select{ height:40px; padding:0 12px; border:1px solid #e5e7eb; border-radius:9px; font-family:inherit; font-size:13.5px; outline:none; background:#fff; }
        .cr-field input:focus, .cr-field select:focus{ border-color:#86efac; }

        .cr-need{ display:flex; align-items:center; gap:7px; font-size:13px; color:#6b7280; margin:14px 0; }
        .cr-need strong{ color:#374151; }
        .cr-offer-trucks{ display:flex; align-items:center; gap:5px; font-size:12.5px; font-weight:600; margin-top:5px; }
        .cr-offer-dom{ display:flex; align-items:center; gap:16px; font-size:12px; color:#6b7280; margin-top:5px; text-transform:uppercase; letter-spacing:.03em; }
        .cr-offer-dom strong{ color:#374151; font-weight:700; letter-spacing:.06em; }
        .cr-offer-vehs{ margin-top:6px; display:flex; flex-direction:column; gap:4px; padding:8px 0 0; border-top:1px dashed #f1f2f4; }
        .cr-cpe-row{ display:flex; align-items:center; gap:12px; background:#fff; border:1px solid #eef0f2; border-radius:10px; padding:12px 14px; margin-bottom:8px; }
        .cr-cpe-info{ flex:1; display:flex; flex-direction:column; gap:3px; }
        .cr-cpe-dom{ font-size:12.5px; font-weight:700; color:#374151; text-transform:uppercase; letter-spacing:.04em; }
        .cr-cpe-ok{ display:flex; align-items:center; gap:6px; font-size:12px; color:#16a34a; font-weight:600; }
        .cr-cpe-pending{ font-size:12px; color:#9ca3af; font-style:italic; }
        .cr-cpe-actions{ flex-shrink:0; }
        .cr-maps-link{ display:inline-flex; align-items:center; gap:4px; margin-left:8px; font-size:11.5px; font-weight:700; color:#2563eb; text-decoration:none; }
        .cr-maps-link:hover{ text-decoration:underline; }
        .cr-order-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .cr-inc-box{ background:#fef2f2; border:1px solid #fecaca; border-radius:12px; padding:16px; margin:16px 0; }
        .cr-reassign-form{ width:100%; margin-top:10px; padding:14px; background:#fffbeb; border:1px solid #fde68a; border-radius:10px; }
        .cr-dom-chofer{ font-size:11.5px; color:#6b7280; text-transform:none; letter-spacing:0; font-weight:500; }
        .cr-offer-desglose{ display:flex; gap:14px; flex-wrap:wrap; font-size:12px; color:#6b7280; margin-top:6px; padding-top:6px; border-top:1px dashed #e5e7eb; }
        .cr-offer-desglose span{ font-weight:600; }
        .cr-zona-chip{ display:inline-flex; align-items:center; gap:4px; padding:4px 10px; background:#fef3c7; color:#92400e; border-radius:16px; font-size:12px; font-weight:600; }
        .cr-card-zonas{ font-size:11.5px; color:#d97706; margin-top:3px; font-weight:500; }
        .cr-cats-grid{ display:flex; flex-direction:column; gap:6px; }
        .cr-cat-row{ display:flex; align-items:center; gap:10px; }
        .cr-cat-label{ font-size:13px; font-weight:600; color:#374151; min-width:120px; }
        .cr-cat-input{ width:70px; height:34px; text-align:center; border:1px solid #e5e7eb; border-radius:8px; font-family:inherit; font-size:14px; font-weight:700; color:#374151; }
        .cr-cat-input:focus{ outline:none; border-color:#93c5fd; }
        .cr-cat-detalle{ flex:1; height:34px; padding:0 10px; border:1px solid #e5e7eb; border-radius:8px; font-family:inherit; font-size:13px; }
        .cr-vehs-head{ display:flex; align-items:center; justify-content:space-between; margin:16px 0 10px; padding-bottom:6px; border-bottom:1px solid #f1f2f4; font-size:13px; font-weight:700; color:#374151; }
        .cr-veh-row{ display:flex; align-items:flex-end; gap:10px; margin-bottom:8px; }
        .cr-veh-n{ display:flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:50%; font-size:12px; font-weight:700; flex-shrink:0; }

        .cr-job-lines{ margin-top:12px; padding-top:12px; border-top:1px solid #f1f2f4; display:flex; flex-direction:column; gap:8px; }
        .cr-job-line{ display:flex; align-items:center; gap:10px; }
        .cr-job-loc{ font-size:13px; font-weight:600; color:#374151; min-width:120px; }
        .cr-status-pill{ font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; }
        .cr-job-meta{ font-size:12px; color:#9ca3af; margin-left:auto; font-weight:600; white-space:nowrap; }
        .cr-group-h{ display:flex; align-items:center; gap:8px; font-size:12.5px; font-weight:700; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin:0 0 12px; }
        .cr-group-dot{ width:8px; height:8px; border-radius:50%; }

        .cr-puntos{ margin-top:18px; padding-top:18px; border-top:1px solid #f1f2f4; }
        .cr-punto{ display:flex; align-items:center; gap:10px; padding:8px 0; font-size:13.5px; flex-wrap:wrap; }
        .cr-punto-n{ width:22px; height:22px; border-radius:50%; display:grid; place-items:center; font-size:11.5px; font-weight:700; flex-shrink:0; }
        .cr-punto-loc{ font-weight:600; color:#374151; }
        .cr-punto-kg{ color:#6b7280; margin-left:auto; font-weight:600; }

        .cr-puntos-head{ display:flex; align-items:center; justify-content:space-between; margin-top:22px; margin-bottom:4px; font-size:13px; font-weight:700; color:#111827; }
        .cr-total-chip{ font-size:12.5px; font-weight:700; color:#166534; background:#dcfce7; padding:3px 10px; border-radius:20px; }
        .cr-punto-row{ display:flex; align-items:center; gap:10px; margin-bottom:10px; flex-wrap:wrap; }
        .cr-kg-input{ width:110px; height:40px; padding:0 12px; border:1px solid #e5e7eb; border-radius:9px; font-family:inherit; font-size:13.5px; outline:none; }
        .cr-kg-input:focus{ border-color:#86efac; }
        .cr-kg-wrap{ position:relative; }
        .cr-kg-wrap .cr-kg-input{ width:96px; padding-right:30px; }
        .cr-kg-suf{ position:absolute; right:10px; top:50%; transform:translateY(-50%); color:#9ca3af; display:flex; pointer-events:none; }
        .cr-punto-del{ width:34px; height:34px; border-radius:8px; border:1px solid #fecaca; background:#fff; color:#b91c1c; cursor:pointer; display:grid; place-items:center; }
        .cr-punto-del:hover{ background:#fef2f2; }
        .cr-add-punto{ display:inline-flex; align-items:center; gap:6px; background:none; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; padding:6px 0; }

        .cr-punto-block{ background:#fff; border:1px solid #eef0f2; border-radius:14px; padding:16px 18px; margin-bottom:14px; }
        .cr-punto-block-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
        .cr-pb-loc{ display:flex; align-items:center; gap:11px; }
        .cr-pb-title{ font-size:15px; font-weight:700; color:#1f2937; }
        .cr-pb-sub{ font-size:12.5px; color:#9ca3af; margin-top:2px; }
        .cr-pb-body{ margin-top:14px; }

        .cr-picker{ position:relative; }
        .cr-picker-input{ width:100%; height:40px; padding:0 12px; border:1px solid #e5e7eb; border-radius:9px; font-family:inherit; font-size:13.5px; outline:none; background:#fff; }
        .cr-picker-input:focus{ border-color:var(--cr-focus,#86efac); }
        .cr-picker-menu{ position:absolute; top:44px; left:0; right:0; z-index:40; background:#fff; border:1px solid #e5e7eb; border-radius:11px; box-shadow:0 12px 30px rgba(0,0,0,0.12); overflow:hidden; max-height:280px; overflow-y:auto; }
        .cr-picker-opt{ display:flex; align-items:center; gap:10px; width:100%; text-align:left; background:none; border:none; cursor:pointer; padding:10px 13px; font-family:inherit; border-bottom:1px solid #f4f5f6; }
        .cr-picker-opt:last-child{ border-bottom:none; }
        .cr-picker-opt:hover{ background:#f6f7f8; }
        .cr-picker-loc{ font-size:13.5px; font-weight:600; color:#1f2937; }
        .cr-picker-prov{ font-size:12px; color:#9ca3af; flex:1; }

        .cr-tr{ display:flex; align-items:center; gap:14px; background:#fff; border:1px solid #eef0f2; border-radius:12px; padding:14px 18px; margin-bottom:12px; }
        .cr-tr-av{ width:40px; height:40px; border-radius:50%; background:#dcfce7; color:#16a34a; display:grid; place-items:center; font-weight:700; font-size:13px; }
        .cr-tr-name{ font-size:14.5px; font-weight:700; color:#1f2937; }
        .cr-tr-meta{ font-size:12.5px; color:#9ca3af; margin-top:2px; }
        .cr-empty{ text-align:center; color:#9ca3af; font-size:14px; padding:40px 0; }

        .cr-help{ position:fixed; bottom:22px; right:22px; width:42px; height:42px; border-radius:50%; background:#fff; border:1px solid #ececec; box-shadow:0 4px 14px rgba(0,0,0,0.08); display:grid; place-items:center; color:#6b7280; cursor:pointer; z-index:30; }
        .cr-demo{ position:fixed; bottom:22px; left:22px; display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #ececec; border-radius:11px; padding:6px; box-shadow:0 4px 14px rgba(0,0,0,0.07); z-index:30; }
        .cr-demo-lbl{ font-size:10.5px; font-weight:700; color:#9ca3af; text-transform:uppercase; letter-spacing:.06em; padding-left:6px; }
        .cr-demo-btn{ border:none; cursor:pointer; font-family:inherit; font-size:12.5px; font-weight:600; padding:6px 12px; border-radius:8px; background:transparent; color:#6b7280; }

        @media (max-width:680px){ .cr-detail-grid{ grid-template-columns:repeat(2,1fr); } .cr-form-grid{ grid-template-columns:1fr; } }
      `}</style>

      {screen === "landing" && <Landing onPick={pickRole} />}

      {screen === "panel" && R && (
        <>
          <header className="cr-header">
            <div className="cr-header-top">
              <button className="cr-back" aria-label="Volver" onClick={back}><ArrowLeft size={20} /></button>
              <div className="cr-logo-chip2" style={{ background: R.accent }}><R.Icon size={22} color="#fff" strokeWidth={2.2} /></div>
              <div><span className="cr-title">{R.title}</span><span className="cr-sub">· {R.user}</span></div>
              <div className="cr-avatar" style={{ background: R.soft, color: R.accent }}>{R.initials}</div>
            </div>
            {!hasDetail && (
              <div className="cr-tabs">
                {R.tabs.map((t) => {
                  const on = tab === t.id;
                  const badge = t.id === "mispedidos" ? mineBadge : t.id === "solicitudes" && role === "comercio" ? solicitudes.length : t.badge;
                  return (
                    <button key={t.id} className="cr-tab" onClick={() => { setTab(t.id); clearSel(); }}
                      style={on ? { color: R.accent, borderBottomColor: R.accent } : undefined}>
                      <t.icon size={17} color={on ? R.accent : "#9ca3af"} />{t.label}
                      {badge ? <span className="cr-tab-badge" style={{ background: R.accent }}>{badge}</span> : null}
                    </button>
                  );
                })}
              </div>
            )}
          </header>

          {/* DETAIL VIEWS */}
          {selectedOrder && (
            <OrderDetail order={selectedOrder} role={role} accent={R.accent} soft={R.soft}
              onBack={back} onConfirm={confirmOffer} onSendOffer={sendOffer} onUploadCpe={uploadCpe}
              onPause={pauseOrder} onResume={resumeOrder} onCancel={cancelOrder} onReassign={reassignVehicle} onEdit={editOrder} onContingencia={reportContingencia} onResolve={resolveContingencia}
              onEntrega={reportEntrega} onRecepcion={confirmRecepcion} onCalificar={calificar} />
          )}
          {selectedSvc && (
            <ServiceDetail svc={selectedSvc} accent={R.accent} soft={R.soft} onBack={back} />
          )}
          {selectedSol && (
            <SolicitudDetail sol={selectedSol} role={role} accent={R.accent} soft={R.soft}
              onBack={back} onRespond={respondSolicitud} />
          )}
          {selectedPres && (
            <PresupuestoDetail pres={selectedPres} role={role} accent={R.accent} soft={R.soft}
              onBack={back} onRespond={respondPresupuesto} />
          )}

          {!hasDetail && (
            <div className="cr-content">
              {/* ========= PRODUCTOR ========= */}
              {role === "productor" && tab === "pedidos" && (
                <div className="cr-fade">
                  <div className="cr-section-head">
                    <h2 className="cr-h2">Mis Pedidos ({productorOrders.length})</h2>
                    <button className="cr-new" style={{ background: R.accent }} onClick={() => setTab("crear")}><Plus size={17} strokeWidth={2.6} /> Nuevo pedido</button>
                  </div>
                  {productorOrders.map((o) => (<OrderCard key={o.id} order={o} accent={R.accent} soft={R.soft} onOpen={() => setSelected(o.id)} />))}
                </div>
              )}
              {role === "productor" && tab === "historial" && (
                <div className="cr-fade">
                  <div className="cr-section-head">
                    <h2 className="cr-h2">Historial ({historyOrders.length})</h2>
                    {historyOrders.length > 0 && <button className="cr-new" style={{ background: R.accent }} onClick={() => exportarHistorial(historyOrders, "carreta-historial.csv")}>📥 Exportar Excel</button>}
                  </div>
                  <p className="cr-hint" style={{ marginTop: -10, marginBottom: 14 }}>Pedidos finalizados y cancelados.</p>
                  {historyOrders.length === 0 && <p className="cr-empty">No hay pedidos finalizados todavía.</p>}
                  {historyOrders.map((o) => (<OrderCard key={o.id} order={o} accent={R.accent} soft={R.soft} onOpen={() => setSelected(o.id)} />))}
                </div>
              )}
              {role === "productor" && tab === "crear" && <CrearPedido accent={R.accent} onCreate={createOrder} />}
              {role === "productor" && tab === "servicios" && (
                <div className="cr-fade">
                  <div className="cr-section-head"><h2 className="cr-h2">Servicios de Contratistas</h2></div>
                  <p className="cr-hint" style={{ marginTop: -10, marginBottom: 14 }}>Buscá maquinaria disponible para tu campo. Filtrá por tipo y cercanía.</p>

                  {/* Filtro por tipo */}
                  <div className="cr-cpbar">
                    <label><Wrench size={16} color="#d97706" /> Tipo:</label>
                    <select value={svcType} onChange={(e) => setSvcType(e.target.value)}
                      style={{ flex: "0 0 auto", height: 38, borderRadius: 9, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 13.5, fontFamily: "inherit", fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                      <option>Todos</option>
                      {SERVICE_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>

                    <label style={{ marginLeft: 14 }}><MapPin size={16} color="#d97706" /> Localidad:</label>
                    <input value={svcLocFilter} onChange={(e) => setSvcLocFilter(e.target.value)}
                      placeholder="Filtrar por localidad…"
                      style={{ flex: 1, height: 38, borderRadius: 9, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 13.5, fontFamily: "inherit", fontWeight: 600, color: "#374151" }} />
                  </div>

                  {svcLocFilter && (
                    <p className="cr-cp-note">
                      <CheckCircle2 size={14} color="#d97706" />
                      Filtrando servicios en <strong>{svcLocFilter}</strong>
                    </p>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{filteredServices.length} servicio{filteredServices.length !== 1 ? "s" : ""} encontrado{filteredServices.length !== 1 ? "s" : ""}</span>
                  </div>
                  {filteredServices.length === 0 && <p className="cr-empty">No hay servicios que coincidan con tu búsqueda. Probá cambiar el tipo o ampliar el radio.</p>}
                  {filteredServices.map((s) => (<ServiceCard key={s.id} svc={s} accent="#d97706" soft="#fef3c7" onOpen={() => setSelService(s.id)} />))}
                </div>
              )}

              {/* ========= TRANSPORTISTA ========= */}
              {role === "transportista" && tab === "disponibles" && (
                <div className="cr-fade">
                  {/* Filtro de actividad */}
                  <div className="cr-act-bar" style={{ marginBottom: 16 }}>
                    {[{ id: "ambos", label: "Todos" }, ...ACTIVIDADES].map((a) => (
                      <button key={a.id} className="cr-act-btn" onClick={() => setActFilter(a.id)}
                        style={actFilter === a.id ? { background: R.soft, color: R.accent, borderColor: R.accent } : undefined}>
                        {a.emoji || "📦"} {a.label}
                      </button>
                    ))}
                  </div>
                  <div className="cr-cpbar">
                    <label><MapPin size={16} color={R.accent} /> Filtrar por localidad:</label>
                    <input value={locFilter} onChange={(e) => { setLocFilter(e.target.value); ; }}
                      placeholder="Escribí una localidad para filtrar…"
                      style={{ flex: 1, height: 38, borderRadius: 9, border: "1px solid #e5e7eb", padding: "0 12px", fontSize: 13.5, fontFamily: "inherit", fontWeight: 600, color: "#374151" }} />
                    {locFilter && <button className="cr-save" onClick={() => { setLocFilter(""); ; }} style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 12 }}>Limpiar</button>}
                  </div>
                  {locFilter && (
                    <p className="cr-cp-note">
                      <CheckCircle2 size={14} color={R.accent} />
                      Filtrando pedidos con origen en <strong>{locFilter}</strong>
                    </p>
                  )}
                  <div className="cr-section-head"><h2 className="cr-h2">Pedidos Disponibles ({available.length})</h2></div>
                  
                  {available.length ? (
                    available.map((o) => (<OrderCard key={o.id} order={o} accent={R.accent} soft={R.soft} onOpen={() => setSelected(o.id)} />))
                  ) : (
                    <p className="cr-empty">No hay pedidos {locFilter ? `en "${locFilter}"` : "disponibles"} por ahora.{locFilter ? " Probá otro nombre." : ""}</p>
                  )}
                </div>
              )}
              {role === "transportista" && tab === "historial" && (() => {
                const histMine = mineHistory;
                return (
                  <div className="cr-fade">
                    <div className="cr-section-head">
                      <h2 className="cr-h2">Historial ({histMine.length})</h2>
                      {histMine.length > 0 && <button className="cr-new" style={{ background: R.accent }} onClick={() => exportarHistorial(histMine, "carreta-historial-transportista.csv")}>📥 Exportar Excel</button>}
                    </div>
                    <p className="cr-hint" style={{ marginTop: -10, marginBottom: 14 }}>Viajes finalizados y cancelados.</p>
                    {histMine.length === 0 && <p className="cr-empty">No hay viajes finalizados todavía.</p>}
                    {histMine.map((o) => (<MyJobCard key={o.id} order={o} accent={R.accent} soft={R.soft} onOpen={() => setSelected(o.id)} />))}
                  </div>
                );
              })()}
              {role === "transportista" && tab === "mispedidos" && (
                <div className="cr-fade">
                  <div className="cr-section-head"><h2 className="cr-h2">Mis Pedidos ({mine.length})</h2></div>
                  {!mine.length && <p className="cr-empty">Todavía no ofertaste en ningún pedido.</p>}
                  {[
                    { key: "ganado", label: "Confirmados", dot: "#22c55e" },
                    { key: "enjuego", label: "En juego", dot: "#3b82f6" },
                    { key: "perdido", label: "No seleccionados", dot: "#9ca3af" },
                  ].map(({ key, label, dot }) => (
                    mineGroups[key].length > 0 && (
                      <div key={key} style={{ marginBottom: 22 }}>
                        <h4 className="cr-group-h"><span className="cr-group-dot" style={{ background: dot }} />{label} ({mineGroups[key].length})</h4>
                        {mineGroups[key].map((o) => (
                          <MyJobCard key={o.id} order={o} accent={R.accent} soft={R.soft} onOpen={() => setSelected(o.id)}  />
                        ))}
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* ========= CONTRATISTA ========= */}
              {role === "contratista" && tab === "misservicios" && (
                <div className="cr-fade">
                  <div className="cr-section-head">
                    <h2 className="cr-h2">Mis Servicios ({myServices.length})</h2>
                    <button className="cr-new" style={{ background: R.accent }} onClick={() => setTab("crearservicio")}><Plus size={17} strokeWidth={2.6} /> Publicar</button>
                  </div>
                  {myServices.length === 0 && <p className="cr-empty">Todavía no publicaste ningún servicio.</p>}
                  {myServices.map((s) => (<ServiceCard key={s.id} svc={s} accent={R.accent} soft={R.soft} onOpen={() => setSelService(s.id)} />))}
                </div>
              )}
              {role === "contratista" && tab === "crearservicio" && <CrearServicio accent={R.accent} onCreate={createService} />}

              {/* ========= COMERCIO ========= */}
              {role === "comercio" && tab === "solicitudes" && (
                <div className="cr-fade">
                  <div className="cr-section-head"><h2 className="cr-h2">Solicitudes de repuestos e insumos ({solicitudes.length})</h2></div>
                  <p className="cr-hint" style={{ marginTop: -10, marginBottom: 18 }}>Solicitudes publicadas por productores, transportistas y contratistas. Respondé con tu precio y disponibilidad.</p>
                  {solicitudes.map((s) => (<SolicitudCard key={s.id} sol={s} accent={R.accent} soft={R.soft} onOpen={() => setSelSolicitud(s.id)} />))}
                </div>
              )}

              {/* ========= SOLICITUDES (para Productor, Transportista, Contratista) ========= */}
              {role !== "comercio" && tab === "solicitudes" && (
                <div className="cr-fade">
                  <div className="cr-section-head"><h2 className="cr-h2">Solicitud de Repuesto ({mySolicitudes.length})</h2></div>
                  <p className="cr-hint" style={{ marginTop: -10, marginBottom: 12 }}>Pedí repuestos, insumos o lo que necesites. Los comercios de la plataforma van a ver tu solicitud y responder.</p>
                  <CrearSolicitud accent={R.accent} role={role} onCreate={createSolicitud} />
                  <div style={{ marginTop: 22 }}>
                    {mySolicitudes.map((s) => (<SolicitudCard key={s.id} sol={s} accent={R.accent} soft={R.soft} onOpen={() => setSelSolicitud(s.id)} />))}
                  </div>
                </div>
              )}

              {/* ========= PRESUPUESTOS (productor: pedir + ver los propios) ========= */}
              {role === "productor" && tab === "presupuestos" && (
                <div className="cr-fade">
                  <div className="cr-section-head"><h2 className="cr-h2">Mis Presupuestos ({myPresupuestos.length})</h2></div>
                  <p className="cr-hint" style={{ marginTop: -10, marginBottom: 12 }}>Pedí cotizaciones formales a los proveedores de la plataforma. Podés comparar las respuestas.</p>
                  <CrearPresupuesto accent={R.accent} onCreate={createPresupuesto} />
                  <div style={{ marginTop: 22 }}>
                    {myPresupuestos.map((p) => (<PresupuestoCard key={p.id} pres={p} accent={R.accent} soft={R.soft} onOpen={() => setSelPresupuesto(p.id)} />))}
                  </div>
                </div>
              )}

              {/* ========= PRESUPUESTOS (comercio: ve todos y cotiza) ========= */}
              {role === "comercio" && tab === "presupuestos" && (
                <div className="cr-fade">
                  <div className="cr-section-head"><h2 className="cr-h2">Pedidos de Presupuesto ({presupuestos.length})</h2></div>
                  <p className="cr-hint" style={{ marginTop: -10, marginBottom: 18 }}>Pedidos de cotización publicados por productores. Enviá tu presupuesto con precio, condiciones y validez.</p>
                  {presupuestos.map((p) => (<PresupuestoCard key={p.id} pres={p} accent={R.accent} soft={R.soft} onOpen={() => setSelPresupuesto(p.id)} />))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <button className="cr-help" aria-label="Ayuda"><HelpCircle size={20} /></button>

      {screen === "panel" && (
        <div className="cr-demo">
          <span className="cr-demo-lbl">Vista</span>
          {["productor", "transportista", "contratista", "comercio"].map((r) => (
            <button key={r} className="cr-demo-btn" onClick={() => switchRole(r)}
              style={role === r ? { background: ROLES[r].soft, color: ROLES[r].accent } : undefined}>
              {ROLES[r].title.replace("Panel del ", "").replace("Panel de ", "")}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

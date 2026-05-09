import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Truck,
  Package,
  MapPin,
  ArrowLeft,
  CheckCircle,
  Phone,
  Mail,
  Calendar,
  Weight,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  User,
  Clock,
} from "lucide-react";
import { useApp, Pedido } from "../context/AppContext";

const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800 border-yellow-200",
  con_ofertas: "bg-blue-100 text-blue-800 border-blue-200",
  confirmado: "bg-green-100 text-green-800 border-green-200",
  en_camino: "bg-purple-100 text-purple-800 border-purple-200",
};

const statusLabels: Record<string, string> = {
  pendiente: "Pendiente",
  con_ofertas: "Con Ofertas",
  confirmado: "Confirmado",
  en_camino: "En Camino",
};

const TRANSPORTISTA_NOMBRE = "Carlos Méndez";
const TRANSPORTISTA_PHONE = "+54 9 11 3421-7890";
const TRANSPORTISTA_EMAIL = "carlos.mendez@transporte.com";

type Tab = "disponibles" | "mispedidos";

export default function Transportista() {
  const navigate = useNavigate();
  const { pedidos, enviarOferta } = useApp();
  const [tab, setTab] = useState<Tab>("disponibles");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [ofertaModal, setOfertaModal] = useState<Pedido | null>(null);
  const [ofertaForm, setOfertaForm] = useState({
    vehiculo: "Semi-remolque",
    precio: "",
    mensaje: "",
  });
  const [ofertaEnviada, setOfertaEnviada] = useState<Set<string>>(new Set());
  const [formSent, setFormSent] = useState(false);

  // Filter: orders the transporter can see
  const disponibles = pedidos.filter(
    (p) => p.status === "pendiente" || p.status === "con_ofertas"
  );

  // My pedidos: orders where I sent an offer
  const misOfertas = pedidos.filter((p) =>
    p.ofertas.some((o) => o.transportistaNombre === TRANSPORTISTA_NOMBRE)
  );

  const handleEnviarOferta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ofertaModal || !ofertaForm.precio) return;
    enviarOferta({
      orderId: ofertaModal.id,
      transportistaNombre: TRANSPORTISTA_NOMBRE,
      transportistaPhone: TRANSPORTISTA_PHONE,
      transportistaEmail: TRANSPORTISTA_EMAIL,
      vehiculo: ofertaForm.vehiculo,
      precio: ofertaForm.precio,
      mensaje: ofertaForm.mensaje,
    });
    setOfertaEnviada((prev) => new Set([...prev, ofertaModal.id]));
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setOfertaModal(null);
      setOfertaForm({ vehiculo: "Semi-remolque", precio: "", mensaje: "" });
      setTab("mispedidos");
    }, 1800);
  };

  const yaEnvie = (pedidoId: string) =>
    ofertaEnviada.has(pedidoId) ||
    pedidos
      .find((p) => p.id === pedidoId)
      ?.ofertas.some((o) => o.transportistaNombre === TRANSPORTISTA_NOMBRE);

  const tabs = [
    { id: "disponibles" as Tab, label: "Pedidos Disponibles", icon: <Package size={16} /> },
    { id: "mispedidos" as Tab, label: "Mis Pedidos", icon: <Truck size={16} /> },
  ];

  const renderOrderCard = (pedido: Pedido, showProducerOnConfirm = false) => {
    const isExpanded = expandedOrder === pedido.id;
    const miOferta = pedido.ofertas.find(
      (o) => o.transportistaNombre === TRANSPORTISTA_NOMBRE
    );
    const fueConfirmado =
      pedido.status === "confirmado" &&
      pedido.ofertaConfirmadaId === miOferta?.id;

    return (
      <div
        key={pedido.id}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpandedOrder(isExpanded ? null : pedido.id)}
        >
          <div className="flex items-start gap-3">
            <div className="bg-blue-50 rounded-xl p-2.5 flex-shrink-0">
              <Package size={18} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900">
                  {pedido.producto}
                </span>
                {fueConfirmado && (
                  <span className="text-xs bg-green-100 text-green-800 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                    ✓ Te eligieron
                  </span>
                )}
                {!fueConfirmado && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      statusColors[pedido.status]
                    }`}
                  >
                    {statusLabels[pedido.status]}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin size={12} />
                <span className="truncate">
                  {pedido.origen} → {pedido.destino}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Weight size={11} /> {pedido.peso}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {pedido.fecha}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronUp size={18} className="text-gray-400" />
              ) : (
                <ChevronDown size={18} className="text-gray-400" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-100 px-4 pb-4">
            {pedido.descripcion && (
              <p className="text-sm text-gray-600 pt-3">{pedido.descripcion}</p>
            )}

            {/* Producer data - visible when confirmed */}
            {fueConfirmado && (
              <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User size={15} className="text-green-600" />
                  <span className="font-semibold text-green-800 text-sm">
                    Datos del Productor
                  </span>
                </div>
                <p className="font-semibold text-gray-900">
                  {pedido.productorNombre}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  {pedido.productorUbicacion}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <a
                    href={`tel:${pedido.productorPhone}`}
                    className="flex items-center gap-1.5 bg-white border border-green-300 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100 transition-colors"
                  >
                    <Phone size={13} />
                    {pedido.productorPhone}
                  </a>
                  <a
                    href={`mailto:${pedido.productorEmail}`}
                    className="flex items-center gap-1.5 bg-white border border-green-300 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100 transition-colors"
                  >
                    <Mail size={13} />
                    {pedido.productorEmail}
                  </a>
                </div>
              </div>
            )}

            {/* My offer summary */}
            {miOferta && !fueConfirmado && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs font-medium text-blue-700 mb-1 flex items-center gap-1">
                  <Clock size={11} /> Tu oferta enviada
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {miOferta.precio}
                </p>
                <p className="text-xs text-gray-500">{miOferta.vehiculo}</p>
                {pedido.status === "confirmado" && !fueConfirmado && (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    El productor eligió otro transportista.
                  </p>
                )}
              </div>
            )}

            {/* Action button for disponibles */}
            {tab === "disponibles" && !yaEnvie(pedido.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOfertaModal(pedido);
                }}
                className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send size={14} /> Enviar oferta
              </button>
            )}
            {tab === "disponibles" && yaEnvie(pedido.id) && !miOferta && (
              <div className="mt-3 flex items-center justify-center gap-2 text-green-600 text-sm py-2">
                <CheckCircle size={15} />
                Oferta enviada
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="bg-blue-500 rounded-lg p-1.5">
            <Truck size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-900">
              Panel del Transportista
            </span>
            <span className="hidden sm:inline text-gray-400 text-sm ml-2">
              · Carlos Méndez
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-700 font-semibold text-sm">CM</span>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}
              {t.label}
              {t.id === "mispedidos" && misOfertas.length > 0 && (
                <span className="bg-blue-100 text-blue-600 text-xs px-1.5 py-0.5 rounded-full">
                  {misOfertas.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* === DISPONIBLES TAB === */}
        {tab === "disponibles" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 font-semibold">
                Pedidos Disponibles ({disponibles.length})
              </h2>
            </div>
            {disponibles.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center">
                <Package size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500">
                  No hay pedidos disponibles en este momento.
                </p>
              </div>
            )}
            {disponibles.map((p) => renderOrderCard(p))}
          </div>
        )}

        {/* === MIS PEDIDOS TAB === */}
        {tab === "mispedidos" && (
          <div className="space-y-4">
            <h2 className="text-gray-900 font-semibold">
              Mis Pedidos ({misOfertas.length})
            </h2>
            {misOfertas.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center">
                <Truck size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500">
                  Todavía no enviaste ofertas.
                </p>
                <button
                  onClick={() => setTab("disponibles")}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Ver pedidos disponibles
                </button>
              </div>
            )}
            {misOfertas.map((p) => renderOrderCard(p, true))}
          </div>
        )}
      </main>

      {/* Oferta modal */}
      {ofertaModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            {formSent ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle size={28} className="text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">¡Oferta enviada!</p>
                <p className="text-gray-500 text-sm mt-1 text-center">
                  El productor verá tu propuesta y podrá confirmarte.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900">
                    Enviar Oferta
                  </h3>
                  <button
                    onClick={() => setOfertaModal(null)}
                    className="p-1 rounded-lg hover:bg-gray-100"
                  >
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {ofertaModal.producto} · {ofertaModal.origen} →{" "}
                  {ofertaModal.destino}
                </p>
                <form onSubmit={handleEnviarOferta} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de vehículo
                    </label>
                    <select
                      value={ofertaForm.vehiculo}
                      onChange={(e) =>
                        setOfertaForm((f) => ({
                          ...f,
                          vehiculo: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                    >
                      <option>Semi-remolque</option>
                      <option>Camión</option>
                      <option>Camión Refrigerado</option>
                      <option>Camión Volcador</option>
                      <option>Camioneta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio propuesto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: $90.000"
                      value={ofertaForm.precio}
                      onChange={(e) =>
                        setOfertaForm((f) => ({
                          ...f,
                          precio: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mensaje (opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Disponibilidad, condiciones, etc."
                      value={ofertaForm.mensaje}
                      onChange={(e) =>
                        setOfertaForm((f) => ({
                          ...f,
                          mensaje: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setOfertaModal(null)}
                      className="flex-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Wheat,
  Plus,
  Package,
  Truck,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  Weight,
  MessageSquare,
} from "lucide-react";
import { useApp, Pedido, Oferta } from "../context/AppContext";

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

type Tab = "pedidos" | "crear" | "transportistas";

export default function Productor() {
  const navigate = useNavigate();
  const { pedidos, transportistas, crearPedido, confirmarTransportista } =
    useApp();
  const [tab, setTab] = useState<Tab>("pedidos");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [confirmadoModal, setConfirmadoModal] = useState<{
    pedido: Pedido;
    oferta: Oferta;
  } | null>(null);

  // Form state
  const [form, setForm] = useState({
    productorNombre: "María González",
    productorPhone: "+54 9 11 5555-1234",
    productorEmail: "maria.gonzalez@campo.com",
    productorUbicacion: "Junín, Buenos Aires",
    origen: "",
    destino: "",
    producto: "",
    peso: "",
    fecha: "",
    descripcion: "",
  });
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origen || !form.destino || !form.producto || !form.peso || !form.fecha)
      return;
    crearPedido(form);
    setFormSent(true);
    setForm((f) => ({ ...f, origen: "", destino: "", producto: "", peso: "", fecha: "", descripcion: "" }));
    setTimeout(() => {
      setFormSent(false);
      setTab("pedidos");
    }, 2000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "pedidos", label: "Mis Pedidos", icon: <Package size={16} /> },
    { id: "crear", label: "Crear Pedido", icon: <Plus size={16} /> },
    { id: "transportistas", label: "Transportistas", icon: <Truck size={16} /> },
  ];

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
          <div className="bg-green-500 rounded-lg p-1.5">
            <Wheat size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <span className="font-semibold text-gray-900">Panel del Productor</span>
            <span className="hidden sm:inline text-gray-400 text-sm ml-2">
              · María González
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-semibold text-sm">MG</span>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 pb-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* === PEDIDOS TAB === */}
        {tab === "pedidos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 font-semibold">
                Mis Pedidos ({pedidos.length})
              </h2>
              <button
                onClick={() => setTab("crear")}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={15} /> Nuevo pedido
              </button>
            </div>

            {pedidos.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 flex flex-col items-center text-center">
                <Package size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500">Todavía no tenés pedidos.</p>
                <button
                  onClick={() => setTab("crear")}
                  className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Crear primer pedido
                </button>
              </div>
            )}

            {pedidos.map((pedido) => {
              const ofertaConfirmada = pedido.ofertas.find(
                (o) => o.id === pedido.ofertaConfirmadaId
              );
              const isExpanded = expandedOrder === pedido.id;

              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  {/* Order header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : pedido.id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-green-50 rounded-xl p-2.5 flex-shrink-0">
                        <Package size={18} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900">
                            {pedido.producto}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                              statusColors[pedido.status]
                            }`}
                          >
                            {statusLabels[pedido.status]}
                          </span>
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
                          {pedido.ofertas.length > 0 && (
                            <span className="text-blue-500 font-medium">
                              {pedido.ofertas.length} oferta
                              {pedido.ofertas.length > 1 ? "s" : ""}
                            </span>
                          )}
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

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-4 pb-4">
                      {pedido.descripcion && (
                        <p className="text-sm text-gray-600 pt-3 pb-1">
                          {pedido.descripcion}
                        </p>
                      )}

                      {/* Confirmed transporter contact */}
                      {pedido.status === "confirmado" && ofertaConfirmada && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={16} className="text-green-600" />
                            <span className="font-semibold text-green-800 text-sm">
                              Transportista Confirmado
                            </span>
                          </div>
                          <p className="font-semibold text-gray-900">
                            {ofertaConfirmada.transportistaNombre}
                          </p>
                          <p className="text-sm text-gray-600">
                            {ofertaConfirmada.vehiculo} · {ofertaConfirmada.precio}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-3">
                            <a
                              href={`tel:${ofertaConfirmada.transportistaPhone}`}
                              className="flex items-center gap-1.5 bg-white border border-green-300 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100 transition-colors"
                            >
                              <Phone size={13} />
                              {ofertaConfirmada.transportistaPhone}
                            </a>
                            <a
                              href={`mailto:${ofertaConfirmada.transportistaEmail}`}
                              className="flex items-center gap-1.5 bg-white border border-green-300 text-green-700 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100 transition-colors"
                            >
                              <Mail size={13} />
                              {ofertaConfirmada.transportistaEmail}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Offers list */}
                      {pedido.status !== "confirmado" && pedido.ofertas.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Ofertas recibidas:
                          </p>
                          <div className="space-y-2">
                            {pedido.ofertas.map((oferta) => (
                              <div
                                key={oferta.id}
                                className="border border-gray-200 rounded-xl p-3 flex items-center gap-3"
                              >
                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                  <Truck size={16} className="text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm">
                                    {oferta.transportistaNombre}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {oferta.vehiculo} · {oferta.precio}
                                  </p>
                                  {oferta.mensaje && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                                      "{oferta.mensaje}"
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    setConfirmadoModal({ pedido, oferta })
                                  }
                                  className="flex-shrink-0 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                >
                                  Confirmar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {pedido.status === "pendiente" && pedido.ofertas.length === 0 && (
                        <p className="mt-3 text-sm text-gray-400 italic">
                          Esperando ofertas de transportistas...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* === CREAR PEDIDO TAB === */}
        {tab === "crear" && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-5">
                Nuevo Pedido de Flete
              </h2>
              {formSent ? (
                <div className="flex flex-col items-center py-10">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-gray-900">
                    ¡Pedido publicado!
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Los transportistas ya pueden ver tu pedido.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Origen *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Pergamino, Buenos Aires"
                        value={form.origen}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, origen: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destino *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Puerto Rosario, Santa Fe"
                        value={form.destino}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, destino: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Producto *
                      </label>
                      <select
                        required
                        value={form.producto}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, producto: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                      >
                        <option value="">Seleccioná el producto</option>
                        <option>Soja</option>
                        <option>Maíz</option>
                        <option>Trigo</option>
                        <option>Girasol</option>
                        <option>Sorgo</option>
                        <option>Cebada</option>
                        <option>Frutas y Verduras</option>
                        <option>Ganado</option>
                        <option>Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peso / Volumen *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: 20 toneladas"
                        value={form.peso}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, peso: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de retiro *
                      </label>
                      <input
                        type="date"
                        required
                        value={form.fecha}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, fecha: e.target.value }))
                        }
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción adicional
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Aclaraciones, condiciones especiales, urgencia..."
                      value={form.descripcion}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          descripcion: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 resize-none"
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
                    >
                      Publicar Pedido
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* === TRANSPORTISTAS TAB === */}
        {tab === "transportistas" && (
          <div className="space-y-4">
            <h2 className="text-gray-900 font-semibold">
              Transportistas Disponibles ({transportistas.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {transportistas.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-green-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-semibold text-sm">
                        {t.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{t.nombre}</p>
                      <p className="text-sm text-gray-500">{t.vehiculo}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star
                          size={12}
                          className="text-yellow-400 fill-yellow-400"
                        />
                        <span className="text-xs text-gray-600">
                          {t.calificacion} · {t.viajes} viajes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs">{t.zona}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Weight size={13} className="text-gray-400 flex-shrink-0" />
                      <span className="text-xs">Capacidad: {t.capacidad}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <a
                      href={`tel:${t.telefono}`}
                      className="flex items-center gap-1 flex-1 justify-center border border-gray-200 text-gray-600 hover:bg-gray-50 px-2 py-1.5 rounded-lg text-xs transition-colors"
                    >
                      <Phone size={12} /> {t.telefono}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Confirm modal */}
      {confirmadoModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Confirmar Transportista
              </h3>
              <button
                onClick={() => setConfirmadoModal(null)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-medium text-gray-900">
                {confirmadoModal.oferta.transportistaNombre}
              </p>
              <p className="text-sm text-gray-500">
                {confirmadoModal.oferta.vehiculo}
              </p>
              <p className="text-lg font-bold text-green-600 mt-1">
                {confirmadoModal.oferta.precio}
              </p>
              {confirmadoModal.oferta.mensaje && (
                <div className="flex items-start gap-1.5 mt-2">
                  <MessageSquare
                    size={13}
                    className="text-gray-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-gray-500">
                    "{confirmadoModal.oferta.mensaje}"
                  </p>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Al confirmar, podrás ver los datos de contacto del transportista y
              coordinar el retiro de tu carga.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmadoModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  confirmarTransportista(
                    confirmadoModal.pedido.id,
                    confirmadoModal.oferta.id
                  );
                  setConfirmadoModal(null);
                  setExpandedOrder(confirmadoModal.pedido.id);
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useNavigate } from "react-router";
import { Truck, Wheat, ArrowRight, Package, MapPin } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1765961423093-e3532918328a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjB0cnVjayUyMGhhcnZlc3QlMjB0cmFuc3BvcnQlMjBmaWVsZHxlbnwxfHx8fDE3NzgwMDE4MzF8MA&ixlib=rb-4.1.0&q=80&w=1080')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-4xl">
        {/* Logo / Title */}
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-green-500 rounded-xl p-2.5">
            <Truck className="text-white" size={28} />
          </div>
          <span className="text-white text-3xl font-bold tracking-tight">
            AgroCarga
          </span>
        </div>
        <p className="text-white/70 text-center mb-12 max-w-md">
          Conectamos productores con transportistas de todo el país de forma
          rápida y segura.
        </p>

        {/* Stats */}
        <div className="flex gap-8 mb-14">
          {[
            { icon: Package, label: "Pedidos activos", value: "1.240+" },
            { icon: Truck, label: "Transportistas", value: "380+" },
            { icon: MapPin, label: "Provincias", value: "23" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center">
              <Icon size={20} className="text-green-400 mb-1" />
              <span className="text-white font-bold text-xl">{value}</span>
              <span className="text-white/50 text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* Role cards */}
        <p className="text-white/60 mb-5 uppercase tracking-widest text-xs">
          ¿Cómo querés ingresar?
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
          {/* Productor */}
          <button
            onClick={() => navigate("/productor")}
            className="group bg-white/10 backdrop-blur-md border border-white/20 hover:bg-green-600/80 hover:border-green-400 rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-green-500/20 group-hover:bg-white/20 rounded-xl p-3 transition-colors">
                <Wheat className="text-green-400 group-hover:text-white" size={28} />
              </div>
              <ArrowRight
                className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all"
                size={20}
              />
            </div>
            <h2 className="text-white font-bold text-xl mb-1">Soy Productor</h2>
            <p className="text-white/60 group-hover:text-white/80 text-sm transition-colors">
              Creá pedidos de flete, elegí el mejor transportista y coordiná
              tus envíos.
            </p>
            <ul className="mt-4 space-y-1">
              {[
                "Publicar pedidos de carga",
                "Ver y comparar ofertas",
                "Confirmar transportista",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-white/50 group-hover:text-white/70">
                  <span className="w-1 h-1 rounded-full bg-green-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </button>

          {/* Transportista */}
          <button
            onClick={() => navigate("/transportista")}
            className="group bg-white/10 backdrop-blur-md border border-white/20 hover:bg-blue-600/80 hover:border-blue-400 rounded-2xl p-6 text-left transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-500/20 group-hover:bg-white/20 rounded-xl p-3 transition-colors">
                <Truck className="text-blue-400 group-hover:text-white" size={28} />
              </div>
              <ArrowRight
                className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all"
                size={20}
              />
            </div>
            <h2 className="text-white font-bold text-xl mb-1">Soy Transportista</h2>
            <p className="text-white/60 group-hover:text-white/80 text-sm transition-colors">
              Explorá pedidos disponibles, enviá tu oferta y gestioná tus
              viajes confirmados.
            </p>
            <ul className="mt-4 space-y-1">
              {[
                "Ver pedidos en tu zona",
                "Enviar ofertas de precio",
                "Acceder a datos del productor",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-white/50 group-hover:text-white/70">
                  <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </button>
        </div>

        <p className="text-white/30 mt-8 text-xs">
          Plataforma de logística agropecuaria · Argentina
        </p>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, ReactNode } from "react";

export type OrderStatus =
  | "pendiente"
  | "con_ofertas"
  | "confirmado"
  | "en_camino";

export interface Oferta {
  id: string;
  orderId: string;
  transportistaNombre: string;
  transportistaPhone: string;
  transportistaEmail: string;
  vehiculo: string;
  precio: string;
  mensaje: string;
}

export interface Pedido {
  id: string;
  productorNombre: string;
  productorPhone: string;
  productorEmail: string;
  productorUbicacion: string;
  origen: string;
  destino: string;
  producto: string;
  peso: string;
  fecha: string;
  descripcion: string;
  status: OrderStatus;
  ofertas: Oferta[];
  ofertaConfirmadaId?: string;
}

export interface Transportista {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  vehiculo: string;
  capacidad: string;
  zona: string;
  calificacion: number;
  viajes: number;
}

interface AppContextType {
  pedidos: Pedido[];
  transportistas: Transportista[];
  crearPedido: (p: Omit<Pedido, "id" | "status" | "ofertas">) => void;
  enviarOferta: (o: Omit<Oferta, "id">) => void;
  confirmarTransportista: (pedidoId: string, ofertaId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const TRANSPORTISTAS_MOCK: Transportista[] = [
  {
    id: "t1",
    nombre: "Carlos Méndez",
    telefono: "+54 9 11 3421-7890",
    email: "carlos.mendez@transporte.com",
    vehiculo: "Camión Refrigerado",
    capacidad: "10 toneladas",
    zona: "Buenos Aires - Córdoba",
    calificacion: 4.8,
    viajes: 142,
  },
  {
    id: "t2",
    nombre: "Lucía Fernández",
    telefono: "+54 9 351 4567-890",
    email: "lucia.fernandez@flete.com",
    vehiculo: "Camioneta Pick-up",
    capacidad: "2 toneladas",
    zona: "Santa Fe - Entre Ríos",
    calificacion: 4.6,
    viajes: 87,
  },
  {
    id: "t3",
    nombre: "Roberto Álvarez",
    telefono: "+54 9 261 7890-123",
    email: "roberto.alvarez@logistica.com",
    vehiculo: "Semi-remolque",
    capacidad: "25 toneladas",
    zona: "Mendoza - San Juan",
    calificacion: 4.9,
    viajes: 310,
  },
  {
    id: "t4",
    nombre: "Martina López",
    telefono: "+54 9 299 5678-901",
    email: "martina.lopez@carga.com",
    vehiculo: "Camión Volcador",
    capacidad: "15 toneladas",
    zona: "Neuquén - Río Negro",
    calificacion: 4.5,
    viajes: 64,
  },
];

const PEDIDOS_MOCK: Pedido[] = [
  {
    id: "p1",
    productorNombre: "Juan Gómez",
    productorPhone: "+54 9 11 9876-5432",
    productorEmail: "juan.gomez@campo.com",
    productorUbicacion: "Pergamino, Buenos Aires",
    origen: "Pergamino, BA",
    destino: "Puerto Rosario, SF",
    producto: "Soja",
    peso: "22 toneladas",
    fecha: "2026-05-12",
    descripcion: "Carga de soja lista para traslado al puerto. Urgente.",
    status: "con_ofertas",
    ofertas: [
      {
        id: "o1",
        orderId: "p1",
        transportistaNombre: "Carlos Méndez",
        transportistaPhone: "+54 9 11 3421-7890",
        transportistaEmail: "carlos.mendez@transporte.com",
        vehiculo: "Semi-remolque",
        precio: "$85.000",
        mensaje: "Disponible para salir el lunes 12.",
      },
    ],
  },
  {
    id: "p2",
    productorNombre: "Ana Ruiz",
    productorPhone: "+54 9 341 1234-567",
    productorEmail: "ana.ruiz@chacra.com",
    productorUbicacion: "Rafaela, Santa Fe",
    origen: "Rafaela, SF",
    destino: "Buenos Aires, CABA",
    producto: "Maíz",
    peso: "18 toneladas",
    fecha: "2026-05-15",
    descripcion: "Maíz seco para distribución.",
    status: "pendiente",
    ofertas: [],
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>(PEDIDOS_MOCK);
  const transportistas = TRANSPORTISTAS_MOCK;

  const crearPedido = (p: Omit<Pedido, "id" | "status" | "ofertas">) => {
    const nuevo: Pedido = {
      ...p,
      id: `p${Date.now()}`,
      status: "pendiente",
      ofertas: [],
    };
    setPedidos((prev) => [nuevo, ...prev]);
  };

  const enviarOferta = (o: Omit<Oferta, "id">) => {
    setPedidos((prev) =>
      prev.map((p) => {
        if (p.id !== o.orderId) return p;
        const nuevaOferta: Oferta = { ...o, id: `of${Date.now()}` };
        return {
          ...p,
          status: "con_ofertas",
          ofertas: [...p.ofertas, nuevaOferta],
        };
      })
    );
  };

  const confirmarTransportista = (pedidoId: string, ofertaId: string) => {
    setPedidos((prev) =>
      prev.map((p) => {
        if (p.id !== pedidoId) return p;
        return { ...p, status: "confirmado", ofertaConfirmadaId: ofertaId };
      })
    );
  };

  return (
    <AppContext.Provider
      value={{ pedidos, transportistas, crearPedido, enviarOferta, confirmarTransportista }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}

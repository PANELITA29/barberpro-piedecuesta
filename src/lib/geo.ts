import type { Profile, Servicio } from "@/types/database";

export interface Barberia {
  id: string;
  nombre: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  latitud: number;
  longitud: number;
  telefono: string;
  rating: number;
  total_resenas: number;
  foto_url: string;
  horario: string;
  parqueadero: boolean;
  barberos_ids: string[];
}

export interface BarberoProfile extends Profile {
  especialidad: string;
  experiencia_anos: number;
  verificado: boolean;
  biografia: string;
  foto_url: string;
  barberia_id: string;
  servicios_ofrecidos: Servicio[];
}

export interface BarrioPiedecuesta {
  id: string;
  nombre: string;
  latitud: number;
  longitud: number;
}

// UUIDs estables compatibles con Supabase (v4) — no cambiar sin migrar BD
export const BARBERO_IDS = {
  carlos: "e7249fb1-3896-4c15-a69f-8d9d25b56fbf",
  andres: "8dd0cb28-140c-4cc0-a408-26d60c5dabf6",
  mateo: "bdc11a99-83d7-47de-8eac-17575513b131",
} as const;

export const SERVICIO_IDS = {
  carlos1: "1c2073a6-7043-4615-a111-e03843cee7af",
  carlos2: "e4fb1341-9e15-4973-867d-721296b66af6",
  carlos3: "b282003f-63ec-42b0-815f-766a7736be28",
  andres1: "e0165765-6eba-4f30-b81b-6022d8f87370",
  andres2: "9cf1fedc-a348-4551-9cae-dbcc6886e87f",
  andres3: "45162310-a09f-4d29-81c5-0951d837d7ae",
  mateo1: "eb2b1dea-4109-4fbd-bf39-688c3952b9d1",
  mateo2: "a1cff0f9-432c-43bb-b9e7-b1a1997fefda",
  mateo3: "618fd465-c561-4e9c-9caa-0de2ebacbe59",
} as const;

export const BARRIOS_PIEDECUESTA: BarrioPiedecuesta[] = [
  { id: "centro", nombre: "Centro Histórico / Parque Principal", latitud: 6.9885, longitud: -73.0495 },
  { id: "junin", nombre: "Junín", latitud: 6.9920, longitud: -73.0450 },
  { id: "chakarita", nombre: "Chakarita", latitud: 6.9930, longitud: -73.0528 },
  { id: "san_cristobal", nombre: "San Cristóbal", latitud: 6.9830, longitud: -73.0540 },
  { id: "cabecera", nombre: "Cabecera del Llano", latitud: 6.9950, longitud: -73.0420 },
  { id: "paseo_puente", nombre: "Paseo del Puente", latitud: 6.9965, longitud: -73.0560 },
  { id: "barro_blanco", nombre: "Barro Blanco", latitud: 6.9850, longitud: -73.0400 },
];

// Cálculo de distancia mediante fórmula Haversine (en km)
export function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatearDistancia(distanciaKm: number): string {
  if (distanciaKm < 1) {
    const metros = Math.round(distanciaKm * 1000);
    return `A ${metros} m de ti`;
  }
  return `A ${distanciaKm.toFixed(1)} km de ti`;
}

// Catálogo enriquecido de barberías reales registradas en Piedecuesta con fotos reales
export const BARBERIAS_REGISTRADAS: Barberia[] = [
  {
    id: "barberia-cartagena",
    nombre: "Barbería Cartagena",
    direccion: "Calle 3 AN # 4-20, cerca a Parque Temático, Piedecuesta",
    barrio: "Paseo del Puente",
    ciudad: "Piedecuesta",
    latitud: 6.9965,
    longitud: -73.0560,
    telefono: "315 889 4433",
    rating: 4.9,
    total_resenas: 195,
    foto_url: "/images/local_cartagena.jpg",
    horario: "Lun a Sáb: 8:00 AM — 8:30 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.carlos],
  },
  {
    id: "barberia-finnescuts",
    nombre: "Finnes Cuts (Fresh Barbershop)",
    direccion: "Calle 2 # 2-30, Sector Chakarita / Norte, Piedecuesta",
    barrio: "Chakarita",
    ciudad: "Piedecuesta",
    latitud: 6.9930,
    longitud: -73.0528,
    telefono: "317 220 1199",
    rating: 4.9,
    total_resenas: 230,
    foto_url: "/images/local_finnescuts.jpg",
    horario: "Lun a Sáb: 9:00 AM — 9:00 PM • Dom: 10:00 AM — 4:00 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.mateo],
  },
  {
    id: "barberia-elegant",
    nombre: "Elegant Barbershop",
    direccion: "Carrera 9 # 3-85, frente a Escuela Normal Superior, Piedecuesta",
    barrio: "Junín",
    ciudad: "Piedecuesta",
    latitud: 6.9935,
    longitud: -73.0468,
    telefono: "316 443 2211",
    rating: 4.8,
    total_resenas: 145,
    foto_url: "/images/local_elegant.jpg",
    horario: "Lun a Sáb: 8:30 AM — 8:00 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.andres],
  },
  {
    id: "barberia-urban-victory",
    nombre: "The Urban Barber Victory",
    direccion: "Carrera 9 # 6-40, Barrio Junín / Centro, Piedecuesta",
    barrio: "Junín",
    ciudad: "Piedecuesta",
    latitud: 6.9902,
    longitud: -73.0440,
    telefono: "320 112 3344",
    rating: 4.9,
    total_resenas: 260,
    foto_url: "/images/local_urbanvictory.jpg",
    horario: "Lun a Sáb: 9:00 AM — 9:00 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.mateo],
  },
  {
    id: "barberia-sede-centro",
    nombre: "BarberPro — Sede Centro & Parque Principal",
    direccion: "Carrera 7 # 8-42, Centro Histórico (a 1 cuadra del Parque Principal)",
    barrio: "Centro Histórico",
    ciudad: "Piedecuesta",
    latitud: 6.9888,
    longitud: -73.0492,
    telefono: "315 123 4567",
    rating: 4.9,
    total_resenas: 312,
    foto_url: "/images/local_piedecuesta.jpg",
    horario: "Lun a Sáb: 8:00 AM — 8:00 PM • Dom: 9:00 AM — 3:00 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.carlos, BARBERO_IDS.andres],
  },
  {
    id: "barberia-lanacion",
    nombre: "Barbería La Nación",
    direccion: "Calle 10 # 9-90, Centro Histórico, Piedecuesta",
    barrio: "Centro Histórico",
    ciudad: "Piedecuesta",
    latitud: 6.9875,
    longitud: -73.0498,
    telefono: "318 456 7890",
    rating: 5.0,
    total_resenas: 245,
    foto_url: "/images/local_lanacion.jpg",
    horario: "Lun a Sáb: 8:30 AM — 8:00 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.carlos],
  },
  {
    id: "barberia-dondecarlos",
    nombre: "Barbería Donde Carlos",
    direccion: "Calle 10 # 10-85, Centro, Piedecuesta",
    barrio: "Centro Histórico",
    ciudad: "Piedecuesta",
    latitud: 6.9870,
    longitud: -73.0515,
    telefono: "317 654 3210",
    rating: 4.5,
    total_resenas: 180,
    foto_url: "/images/local_dondecarlos.jpg",
    horario: "Lun a Sáb: 8:00 AM — 8:00 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.carlos],
  },
  {
    id: "barberia-warner",
    nombre: "Warner Barber",
    direccion: "Calle 13 # 7-45, Centro, Piedecuesta",
    barrio: "Centro Histórico",
    ciudad: "Piedecuesta",
    latitud: 6.9840,
    longitud: -73.0475,
    telefono: "312 987 1122",
    rating: 4.8,
    total_resenas: 142,
    foto_url: "/images/local_warner.jpg",
    horario: "Lun a Sáb: 9:00 AM — 8:30 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.andres],
  },
  {
    id: "barberia-sede-sancristobal",
    nombre: "BarberPro — Sede VIP San Cristóbal",
    direccion: "Calle 10 # 14-25, Sector San Cristóbal / Cabecera, Piedecuesta",
    barrio: "San Cristóbal",
    ciudad: "Piedecuesta",
    latitud: 6.9835,
    longitud: -73.0538,
    telefono: "316 789 0123",
    rating: 4.8,
    total_resenas: 198,
    foto_url: "/images/local_san_cristobal.jpg",
    horario: "Lun a Sáb: 9:00 AM — 9:00 PM • Dom: 10:00 AM — 5:00 PM",
    parqueadero: true,
    barberos_ids: [BARBERO_IDS.mateo],
  },
];

// Perfiles de Barberos Verificados con sus credenciales de seguridad y especialidades
export const BARBEROS_VERIFICADOS: BarberoProfile[] = [
  {
    id: BARBERO_IDS.carlos,
    nombre: "Carlos Mendoza",
    telefono: "315 123 4567",
    rol: "barbero",
    especialidad: "Master Fade & Diseños Artísticos",
    experiencia_anos: 8,
    verificado: true,
    biografia: "Especialista en degradados de alta precisión (Skin Fade, Mid Fade), texturizados con tijera y cortes modernos.",
    foto_url: "/images/barbero_carlos.jpg",
    barberia_id: "barberia-sede-centro",
    created_at: new Date().toISOString(),
    servicios_ofrecidos: [
      {
        id: SERVICIO_IDS.carlos1,
        nombre: "Corte Clásico & Skin Fade",
        descripcion: "Degradado ultra limpio a tijera y máquina con navaja, acabado mate y peinado.",
        precio: 18000,
        duracion_min: 30,
        categoria: "Corte",
        activo: true,
        imagen_url: "/images/corte_clasico.jpg",
        barbero_id: BARBERO_IDS.carlos,
        created_at: new Date().toISOString(),
      },
      {
        id: SERVICIO_IDS.carlos2,
        nombre: "Diseño Freestyle & Líneas Artísticas",
        descripcion: "Corte degradado con diseño geométrico o líneas tribales personalizadas a navaja.",
        precio: 22000,
        duracion_min: 40,
        categoria: "Corte",
        activo: true,
        imagen_url: "/images/corte_clasico.jpg",
        barbero_id: BARBERO_IDS.carlos,
        created_at: new Date().toISOString(),
      },
      {
        id: SERVICIO_IDS.carlos3,
        nombre: "Combo Full VIP (Corte + Barba + Cejas)",
        descripcion: "Renovación total: Skin fade, barba esculpida, diseño de cejas y mascarilla black.",
        precio: 28000,
        duracion_min: 50,
        categoria: "Combo",
        activo: true,
        imagen_url: "/images/combo_full_vip.jpg",
        barbero_id: BARBERO_IDS.carlos,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: BARBERO_IDS.andres,
    nombre: "Andrés Silva",
    telefono: "315 987 6543",
    rol: "barbero",
    especialidad: "Afeitado Tradicional & Barba VIP",
    experiencia_anos: 6,
    verificado: true,
    biografia: "Maestro en rituales de toalla caliente, perfilado clásico con navaja de barbero e hidratación profunda de barba.",
    foto_url: "/images/barbero_andres.jpg",
    barberia_id: "barberia-sede-centro",
    created_at: new Date().toISOString(),
    servicios_ofrecidos: [
      {
        id: SERVICIO_IDS.andres1,
        nombre: "Perfilado de Barba & Toalla Caliente",
        descripcion: "Delineado con navaja, exfoliación facial, aceites botánicos y toalla caliente aromática.",
        precio: 14000,
        duracion_min: 25,
        categoria: "Barba",
        activo: true,
        imagen_url: "/images/perfilado_barba.jpg",
        barbero_id: BARBERO_IDS.andres,
        created_at: new Date().toISOString(),
      },
      {
        id: SERVICIO_IDS.andres2,
        nombre: "Afeitado Clásico a Navaja de Cabeza o Barba",
        descripcion: "Afeitado total con espuma caliente, doble pasada a navaja y bálsamo refrescante.",
        precio: 16000,
        duracion_min: 30,
        categoria: "Barba",
        activo: true,
        imagen_url: "/images/perfilado_barba.jpg",
        barbero_id: BARBERO_IDS.andres,
        created_at: new Date().toISOString(),
      },
      {
        id: SERVICIO_IDS.andres3,
        nombre: "Combo Barbero Clásico (Corte Tradicional + Barba)",
        descripcion: "Corte clásico tijera/peine + ritual completo de barba con toalla caliente.",
        precio: 26000,
        duracion_min: 45,
        categoria: "Combo",
        activo: true,
        imagen_url: "/images/combo_full_vip.jpg",
        barbero_id: BARBERO_IDS.andres,
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: BARBERO_IDS.mateo,
    nombre: "Mateo Gómez",
    telefono: "316 789 0123",
    rol: "barbero",
    especialidad: "Estilista Integral, Depilación & Color",
    experiencia_anos: 5,
    verificado: true,
    biografia: "Especialista en cortes juveniles, depilación con cera facial/pecho, mascarillas desintoxicantes y tratamientos capilares.",
    foto_url: "/images/barbero_mateo.jpg",
    barberia_id: "barberia-sede-sancristobal",
    created_at: new Date().toISOString(),
    servicios_ofrecidos: [
      {
        id: SERVICIO_IDS.mateo1,
        nombre: "Corte Urbano Taper Fade & Texturizado",
        descripcion: "Estilo moderno juvenil con degradado sutil en patillas y nuca, textura y styling.",
        precio: 18000,
        duracion_min: 30,
        categoria: "Corte",
        activo: true,
        imagen_url: "/images/corte_clasico.jpg",
        barbero_id: BARBERO_IDS.mateo,
        created_at: new Date().toISOString(),
      },
      {
        id: SERVICIO_IDS.mateo2,
        nombre: "Depilación Facial con Cera & Black Mask",
        descripcion: "Depilación estética de nariz, orejas, entrecejo y aplicación de mascarilla de carbón activado.",
        precio: 15000,
        duracion_min: 25,
        categoria: "Depilacion",
        activo: true,
        imagen_url: "/images/perfilado_barba.jpg",
        barbero_id: BARBERO_IDS.mateo,
        created_at: new Date().toISOString(),
      },
      {
        id: SERVICIO_IDS.mateo3,
        nombre: "Depilación de Pecho o Espalda Masculina",
        descripcion: "Depilación con cera hipoalergénica tibia para pecho o espalda completa e hidratación.",
        precio: 25000,
        duracion_min: 40,
        categoria: "Depilacion",
        activo: true,
        imagen_url: "/images/combo_full_vip.jpg",
        barbero_id: BARBERO_IDS.mateo,
        created_at: new Date().toISOString(),
      },
    ],
  },
];

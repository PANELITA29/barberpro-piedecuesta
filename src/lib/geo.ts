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

// Barrios principales de Piedecuesta para simular o seleccionar ubicación
export const BARRIOS_PIEDECUESTA: BarrioPiedecuesta[] = [
  { id: "centro", nombre: "Centro Histórico / Parque Principal", latitud: 6.9885, longitud: -73.0495 },
  { id: "junin", nombre: "Junín", latitud: 6.9920, longitud: -73.0450 },
  { id: "san_cristobal", nombre: "San Cristóbal", latitud: 6.9830, longitud: -73.0540 },
  { id: "cabecera", nombre: "Cabecera del Llano", latitud: 6.9950, longitud: -73.0420 },
  { id: "paseo_puente", nombre: "Paseo del Puente", latitud: 6.9790, longitud: -73.0580 },
  { id: "barro_blanco", nombre: "Barro Blanco", latitud: 6.9850, longitud: -73.0400 },
];

// Cálculo de distancia mediante fórmula Haversine (en metros o kilómetros)
export function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
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

// Catálogo enriquecido de barberías registradas en Piedecuesta
export const BARBERIAS_REGISTRADAS: Barberia[] = [
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
    barberos_ids: ["barbero-carlos", "barbero-andres"],
  },
  {
    id: "barberia-sede-sancristobal",
    nombre: "BarberPro — Sede VIP San Cristóbal",
    direccion: "Calle 10 # 14-25, Sector San Cristóbal / Cabecera",
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
    barberos_ids: ["barbero-mateo"],
  },
];

// Perfiles de Barberos Verificados con sus credenciales de seguridad y especialidades
export const BARBEROS_VERIFICADOS: BarberoProfile[] = [
  {
    id: "barbero-carlos",
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
        id: "serv-carlos-1",
        nombre: "Corte Clásico & Skin Fade",
        descripcion: "Degradado ultra limpio a tijera y máquina con navaja, acabado mate y peinado.",
        precio: 18000,
        duracion_min: 30,
        categoria: "Corte",
        activo: true,
        imagen_url: "/images/corte_clasico.jpg",
        barbero_id: "barbero-carlos",
        created_at: new Date().toISOString(),
      },
      {
        id: "serv-carlos-2",
        nombre: "Diseño Freestyle & Líneas Artísticas",
        descripcion: "Corte degradado con diseño geométrico o líneas tribales personalizadas a navaja.",
        precio: 22000,
        duracion_min: 40,
        categoria: "Corte",
        activo: true,
        imagen_url: "/images/corte_clasico.jpg",
        barbero_id: "barbero-carlos",
        created_at: new Date().toISOString(),
      },
      {
        id: "serv-carlos-3",
        nombre: "Combo Full VIP (Corte + Barba + Cejas)",
        descripcion: "Renovación total: Skin fade, barba esculpida, diseño de cejas y mascarilla black.",
        precio: 28000,
        duracion_min: 50,
        categoria: "Combo",
        activo: true,
        imagen_url: "/images/combo_full_vip.jpg",
        barbero_id: "barbero-carlos",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "barbero-andres",
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
        id: "serv-andres-1",
        nombre: "Perfilado de Barba & Toalla Caliente",
        descripcion: "Delineado con navaja, exfoliación facial, aceites botánicos y toalla caliente aromática.",
        precio: 14000,
        duracion_min: 25,
        categoria: "Barba",
        activo: true,
        imagen_url: "/images/perfilado_barba.jpg",
        barbero_id: "barbero-andres",
        created_at: new Date().toISOString(),
      },
      {
        id: "serv-andres-2",
        nombre: "Afeitado Clásico a Navaja de Cabeza o Barba",
        descripcion: "Afeitado total con espuma caliente, doble pasada a navaja y bálsamo refrescante.",
        precio: 16000,
        duracion_min: 30,
        categoria: "Barba",
        activo: true,
        imagen_url: "/images/perfilado_barba.jpg",
        barbero_id: "barbero-andres",
        created_at: new Date().toISOString(),
      },
      {
        id: "serv-andres-3",
        nombre: "Combo Barbero Clásico (Corte Tradicional + Barba)",
        descripcion: "Corte clásico tijera/peine + ritual completo de barba con toalla caliente.",
        precio: 26000,
        duracion_min: 45,
        categoria: "Combo",
        activo: true,
        imagen_url: "/images/combo_full_vip.jpg",
        barbero_id: "barbero-andres",
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: "barbero-mateo",
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
        id: "serv-mateo-1",
        nombre: "Corte Urbano Taper Fade & Texturizado",
        descripcion: "Estilo moderno juvenil con degradado sutil en patillas y nuca, textura y styling.",
        precio: 18000,
        duracion_min: 30,
        categoria: "Corte",
        activo: true,
        imagen_url: "/images/corte_clasico.jpg",
        barbero_id: "barbero-mateo",
        created_at: new Date().toISOString(),
      },
      {
        id: "serv-mateo-2",
        nombre: "Depilación Facial con Cera & Black Mask",
        descripcion: "Depilación estética de nariz, orejas, entrecejo y aplicación de mascarilla de carbón activado.",
        precio: 15000,
        duracion_min: 25,
        categoria: "Depilacion",
        activo: true,
        imagen_url: "/images/perfilado_barba.jpg",
        barbero_id: "barbero-mateo",
        created_at: new Date().toISOString(),
      },
      {
        id: "serv-mateo-3",
        nombre: "Depilación de Pecho o Espalda Masculina",
        descripcion: "Depilación con cera hipoalergénica tibia para pecho o espalda completa e hidratación.",
        precio: 25000,
        duracion_min: 40,
        categoria: "Depilacion",
        activo: true,
        imagen_url: "/images/combo_full_vip.jpg",
        barbero_id: "barbero-mateo",
        created_at: new Date().toISOString(),
      },
    ],
  },
];

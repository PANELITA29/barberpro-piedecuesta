export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'cliente' | 'barbero' | 'admin';
export type ReservaEstado = 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
export type MetodoPago = 'efectivo' | 'nequi' | 'tarjeta' | 'transferencia';
export type EstadoPago = 'pendiente' | 'pagado' | 'fallido';

export interface Profile {
  id: string;
  nombre: string;
  telefono: string | null;
  rol: UserRole;
  avatar_url?: string | null;
  created_at: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  barbero_id: string | null;
  activo: boolean;
  categoria?: string | null;
  imagen_url?: string | null;
  created_at: string;
}

export interface Reserva {
  id: string;
  cliente_id: string;
  barbero_id: string;
  servicio_id: string;
  fecha_hora: string;
  estado: ReservaEstado;
  total: number;
  notas: string | null;
  created_at: string;
  // Relaciones
  servicios?: Servicio | null;
  cliente?: Profile | null;
  barbero?: Profile | null;
  pagos?: Pago | null;
}

export interface Pago {
  id: string;
  reserva_id: string;
  monto: number;
  metodo: MetodoPago;
  estado_pago: EstadoPago;
  referencia?: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id?: string;
          nombre: string;
          telefono?: string | null;
          rol?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          telefono?: string | null;
          rol?: UserRole;
          avatar_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      servicios: {
        Row: Servicio;
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          precio: number;
          duracion_min?: number;
          barbero_id?: string | null;
          activo?: boolean;
          categoria?: string | null;
          imagen_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          precio?: number;
          duracion_min?: number;
          barbero_id?: string | null;
          activo?: boolean;
          categoria?: string | null;
          imagen_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reservas: {
        Row: Reserva;
        Insert: {
          id?: string;
          cliente_id: string;
          barbero_id: string;
          servicio_id: string;
          fecha_hora: string;
          estado?: ReservaEstado;
          total: number;
          notas?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cliente_id?: string;
          barbero_id?: string;
          servicio_id?: string;
          fecha_hora?: string;
          estado?: ReservaEstado;
          total?: number;
          notas?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pagos: {
        Row: Pago;
        Insert: {
          id?: string;
          reserva_id: string;
          monto: number;
          metodo: MetodoPago;
          estado_pago?: EstadoPago;
          referencia?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reserva_id?: string;
          monto?: number;
          metodo?: MetodoPago;
          estado_pago?: EstadoPago;
          referencia?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      rol: UserRole;
      reserva_estado: ReservaEstado;
      metodo_pago: MetodoPago;
      estado_pago: EstadoPago;
    };
    CompositeTypes: Record<string, never>;
  };
}

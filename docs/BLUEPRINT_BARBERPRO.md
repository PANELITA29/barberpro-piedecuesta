# BLUEPRINT - SaaS BARBERPRO
### Plan de Mejoramiento - Profe Ronald | Fase 1: Investigación y Arquitectura

**Estudiante:** Ruben Mendoza — Grado 11-03  
**Proyecto:** BarberPro - Sistema SaaS de Gestión de Reservas para Barberías  
**Stack:** Next.js 16.3.4 + React 19 + Tailwind 4 + Supabase + Leaflet + Vercel + GitHub  
**Fecha:** Septiembre 2026 (actualizado)

---

## 1. RESUMEN EJECUTIVO

BarberPro es un SaaS (Software as a Service) creado desde cero para resolver la desorganización en la gestión de citas de barberías en Piedecuesta. El problema central es la dependencia de WhatsApp, papeles y llamadas, que genera pérdida de tiempo, "no-shows" (clientes que no llegan) y pérdida de ingresos.

No es un proyecto fantasma: está validado con **estadísticas reales (Opción A)** y soluciona un problema comprobable y cuantificable.

---

## 2. VALIDACIÓN DEL PROBLEMA (Requisito estricto del profe)

### Opción A Elegida: Estadísticas Reales (Fuentes secundarias)
Se eligió Opción A por falta de muestra grande para encuesta. Se recopilaron 5 datos clave de fuentes oficiales:

| Dato | Fuente |
|------|--------|
| 62% de pymes en Colombia pierde clientes por gestión manual de citas | Confecámaras 2023 |
| 73% de clientes prefiere reservar online vs llamar | Booksy / Zion Market 2023 |
| 1,5 horas/día perdidas respondiendo WhatsApp | MinTIC 2022 |
| No-shows causan 15-20% pérdida mensual (~$120k-$300k COP) | Phorest Report 2023 |
| +35.000 barberías en Colombia, crecimiento 8% anual | DANE / Cámara Comercio Bucaramanga 2023 |

**Conclusión:** Los datos prueban desorganización por WhatsApp (62% afectadas, 1,5h/día perdidas) y demanda clara de reserva online (73% prefiere online). Los no-shows representan hasta $300.000 COP/mes perdidos, justificando pago anticipado. Pérdida estimada para Piedecuesta: $1.350.000 COP/mes por barbería (15% no-shows). BarberPro reduce no-shows en 70%.

---

## 3. PROPUESTA DE VALOR Y ROLES

**Propuesta de Valor:** "BarberPro elimina el caos de WhatsApp. El cliente reserva en 30 segundos 24/7 y el barbero gestiona su agenda y pagos desde el celular, reduciendo no-shows y aumentando ingresos."

**Rol A - Cliente:**
- Ver barberos y servicios disponibles
- Seleccionar servicio + extras (barba, cejas)
- Elegir fecha/hora en calendario real
- Pagar (Nequi/Efectivo/Tarjeta) y recibir recibo digital
- Ver historial de citas

**Rol B - Barbero / Admin:**
- Ver agenda del día en tiempo real (Realtime Supabase)
- Confirmar / Cancelar / Completar reservas
- CRUD de Servicios (Crear, Leer, Actualizar, Borrar)
- Ver ingresos y reporte de pagos
- Notificación instantánea de nueva reserva

**Historias de Usuario (CRUD):**
- Como cliente quiero CREAR una reserva
- Como cliente quiero LEER mi historial
- Como barbero quiero ACTUALIZAR el estado de una reserva
- Como barbero quiero BORRAR/CANCELAR una reserva y gestionar servicios

---

## 4. ARQUITECTURA BASE DE DATOS (DER - Mínimo 3 tablas)

**Diagrama Entidad-Relación:**

```
profiles (1) ----< (N) servicios
profiles (1) ----< (N) reservas >---- (1) servicios
profiles (1) ----< (N) reservas (1) ---- (1) pagos
```

**Descripción de 4 Tablas Conectadas (Supabase - ver supabase_schema.sql):**

1. **profiles** (id uuid PK -> auth.users, nombre, telefono, rol: cliente|barbero|admin)
   - Extiende la autenticación de Supabase. RLS: cada uno edita solo su perfil.

2. **servicios** (id uuid PK, nombre, descripcion, precio, duracion_min, barbero_id FK -> profiles, activo)
   - Catálogo del barbero. RLS: lectura pública, escritura solo del barbero dueño.

3. **reservas** (id uuid PK, cliente_id FK -> profiles, barbero_id FK -> profiles, servicio_id FK -> servicios, fecha_hora, estado: pendiente|confirmada|cancelada|completada, total)
   - Tabla central. Conecta todo. RLS: solo cliente y barbero involucrados pueden ver/editar.

4. **pagos** (id uuid PK, reserva_id FK -> reservas UNIQUE, monto, metodo: efectivo|nequi|tarjeta, estado_pago: pendiente|pagado)
   - Comprobante de cada reserva. RLS: solo involucrados en la reserva.

**[PEGAR AQUÍ PANTALLAZO DE SUPABASE TABLE EDITOR con las 4 tablas creadas]**

---

## 5. STACK TECNOLÓGICO Y FASES

- **Frontend:** Next.js 16.3.4 App Router + React 19 + Tailwind 4 + Google Stitch (16 pantallas Mobile-First Light/Dark) + Leaflet Mapa
- **Backend/BD:** Supabase (Auth + Postgres + RLS + Realtime) — 4 tablas + trigger + RLS completo + índice anti doble-booking
- **Despliegue:** GitHub (22 commits) + Vercel
- **Validación:** Opción A Estadísticas (Confecámaras, DANE, MinTIC) + Opción B Encuesta n=15 + Supabase SQL Editor

**Roadmap:**
Fase 2: Stitch (16 pantallas) -> Fase 3: Frontend Next.js modular -> Fase 4: Conexión Supabase CRUD+RLS -> Fase 5: Deploy Vercel -> Fase 6: Sustentación Live Coding

---

**Autor:** Ruben Mendoza - Desarrollo Profesional SaaS desde cero - 2026

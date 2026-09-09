# FASE 2 - PROMPTS GOOGLE STITCH - BarberPro
# Proyecto Stitch: projects/8682772906196520136 - BarberPro SaaS - Piedecuesta
# https://stitch.withgoogle.com/projects/8682772906196520136

# INSTRUCCIONES:
# 1. Entra a https://stitch.withgoogle.com/projects/8682772906196520136
# 2. Pega cada prompt en "Generate screen" -> Mobile -> Light/Dark auto
# 3. Genera en lotes de 4. Stitch te da 4 variantes por prompt.

---

## PROMPT 1: Login / Registro Cliente (3 pantallas en 1 prompt)
Mobile-first barber shop SaaS login screen. Split into two tabs: "Cliente" and "Barbero". Clean dark header with gold scissors icon and "BARBERPRO" logo. Form fields: email, password, with amber CTA button "Ingresar". Below: "¿No tienes cuenta? Regístrate" and "¿Olvidaste tu contraseña?". Secondary screen variation: Registration form with fields Nombre, Teléfono, Email, Contraseña, Rol selector (Cliente/Barbero). Third variation: Forgot password with email input and "Enviar enlace". Colors: black #111827, amber #F59E0B, white. Rounded 12px cards, premium barbershop aesthetic, light and dark mode.

## PROMPT 2: Home Cliente - Catálogo de Barberos y Servicios
Mobile barber discovery home screen. Top: search bar + location "Piedecuesta". Horizontal chips: "Todos", "Corte", "Barba", "Combo". Section "Barberos destacados" with horizontal scroll cards: avatar, name, rating 4.9, specialty. Section "Servicios populares" vertical list: card with image (fade), service name "Corte Clásico", duration 30 min, price "$15.000 COP", amber "Reservar" button. Bottom nav: Inicio, Reservas, Perfil. Premium, clean, light/dark.

## PROMPT 3: Detalle Servicio + Extras
Mobile service detail screen for barbershop SaaS. Top image of barber cutting hair with back button and favorite heart. Below: service title "Corte Clásico + Barba", price "$25.000", duration "45 min", rating. Description text. Section "Agrega extras" with checkboxes: Barba (+$8.000), Cejas (+$5.000), Mascarilla (+$7.000) with running total at bottom "$25.000 -> $38.000". Large amber CTA "Continuar - Elegir horario". Light/dark.

## PROMPT 4: Calendario y Selección de Hora (CORE)
Mobile calendar booking screen. Header: "Elige fecha y hora" with selected barber avatar. Calendar strip horizontal: Lun 2, Mar 3, Mié 4 (selected amber), Jue 5, Vie 6. Below: "Mañana" slots: 8:00, 8:30, 9:00 (available), 9:30 (ocupado gray), "Tarde" 14:00, 14:30 (selected amber), 15:00. Legend: disponible, seleccionado, ocupado. Bottom sticky: summary "Mié 4 Sep - 14:30 - Corte Clásico" and CTA "Confirmar reserva". Light/dark, Tailwind style.

## PROMPT 5: Checkout y Pago
Mobile checkout screen. Order summary card: Service "Corte Clásico" $15.000 + "Barba" $8.000 = Total $23.000. Section "Método de pago" with radio cards: Nequi (with logo, selected amber border), Efectivo, Tarjeta. Input for Nequi number if selected. Section "Notas" text field. Bottom: total "$23.000 COP" and large amber button "Pagar y Reservar". Secure badge. Light/dark.

## PROMPT 6: Recibo / Confirmación
Mobile success receipt screen. Big green check circle animation. Title "¡Reserva Confirmada!" Subtitle "Miércoles 4 Sep - 14:30". Receipt card with dashed border: Reserva #BP-2026-001, Barbero: Carlos, Servicio: Corte Clásico + Barba, Total: $23.000 Pagado con Nequi. QR code placeholder. Buttons: "Ver mis reservas" (primary amber) and "Volver al inicio" (outline). Light/dark.

## PROMPT 7: Mis Citas - Historial Cliente
Mobile "Mis Reservas" screen with tabs: Próximas (2), Pasadas (4), Canceladas (1). Card for upcoming: left amber vertical bar, date "Mié 4 Sep 14:30", service "Corte Clásico", barber "Carlos", status badge "Confirmada" green, buttons "Reprogramar | Cancelar". Past card: gray, status "Completada", button "Reservar de nuevo" and "Calificar". Empty state illustration if no bookings. Light/dark.

## PROMPT 8: Perfil Cliente
Mobile profile screen. Top header with avatar, name "Juanda", email, phone, edit pencil. Stats row: 12 Cortes, 4.8 Rating given. Menu list: Mis pagos, Métodos de pago, Notificaciones (toggle), Ayuda, Cerrar sesión (red). Version footer. Light/dark.

## PROMPT 9: Dashboard Barbero - Agenda del Día (ROL B CORE)
Mobile barber dashboard. Header: "Hola, Carlos ✂️" + date "Mié 4 Sep" + earnings "$156.000 hoy". Tabs: Hoy (8), Pendientes (3, amber dot), Completadas. Timeline vertical of appointments: 08:00 - Juan - Corte - $15k - Confirmada (green), 09:00 - Pedro - Barba - $8k - Pendiente (amber) with Accept/Reject buttons, 10:30 - Ocupado gray. Floating action button "+ Bloquear hora". Bottom nav barbero: Agenda, Servicios, Ingresos, Perfil. Light/dark.

## PROMPT 10: Detalle Reserva Barbero (Confirmar/Rechazar)
Mobile appointment detail for barber. Client card: avatar "Juanda", phone, "Cliente frecuente". Service details: Corte Clásico 30min $15k, Extras Barba $8k, Total $23k Nequi (Pagado). Date Mié 4 Sep 14:30. Notes: "Por favor puntual". Action buttons: large green "Confirmar" and outline red "Rechazar" with reason modal. Status history timeline. Light/dark.

## PROMPT 11: Gestión Servicios CRUD - Lista
Mobile services management for barber. Header "Mis Servicios" + "+ Nuevo" amber button. Search bar. List cards: "Corte Clásico" $15k 30min Active toggle ON, "Barba Premium" $12k 20min, "Combo Full" $25k 60min. Each card has edit (pencil) and delete (trash) icons. Swipe to delete. Inactive gray state. Light/dark.

## PROMPT 12: Gestión Servicios CRUD - Form Crear/Editar
Mobile create/edit service form. Image upload placeholder. Fields: Nombre (Corte Clásico), Descripción textarea, Precio $ (15.000), Duración min (30) dropdown, Categoría, Activo toggle. Buttons: "Guardar" amber and "Cancelar". Validation hints. Light/dark.

## PROMPT 13: Ingresos / Reportes Barbero
Mobile earnings dashboard. Top card: "Esta semana $680.000" with +12% green. Chart placeholder (bar chart Mon-Sun). Filters: Hoy, Semana, Mes. List of recent payments: Juanda $23k Nequi Pagado, Pedro $15k Efectivo Pendiente. Button "Exportar reporte". Light/dark.

## PROMPT 14: Perfil Barbero + Disponibilidad
Mobile barber profile + availability. Avatar, name "Carlos - Master Barber", specialty, rating 4.9 (127 reviews). Bio. Section "Horario": Lun-Vie 8am-7pm, Sáb 8am-5pm, Dom cerrado with edit. Section "Servicios que ofreces" chips. Contact: phone, Instagram. Light/dark.

## PROMPT 15: Empty States & Onboarding
Mobile onboarding 3 slides: Slide 1 "Reserva en 30 segundos" illustration phone + scissors, Slide 2 "Paga seguro con Nequi" illustration, Slide 3 "Barberos verificados en Piedecuesta". Dots + "Siguiente" amber + "Saltar". Plus empty states: No reservations, No barbers found. Light/dark.

## PROMPT 16: Dark/Light Toggle & Design System Reference
Mobile design system screen showing BarberPro tokens: Colors primary #111827 black, accent #F59E0B amber, success #10B981, error #EF4444. Typography Inter/Bricolage, rounded 12px, spacing 4px. Components: buttons primary/outline/ghost, cards, badges, toggles. Light and dark side-by-side. For profe to see system.

---
## NOTA PARA EL PROFE RONALD:
Todas las pantallas son Mobile-First (390px), con versión Light y Dark generada por Stitch. Demuestran flujo completo Cliente y Barbero con CRUD.

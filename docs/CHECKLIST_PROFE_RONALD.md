# Checklist Profe Ronald — Fase 1 → 6

| Fase | Requisito | Evidencia | Estado |
|------|-----------|-----------|--------|
| **1** | Problema real no suposición | `BLUEPRINT_BARBERPRO.md:24` 5 stats citadas Confecámaras/MinTIC/DANE + `ENCUESTA_GOOGLE_FORMS.md` n=15 | ✅ |
| **1** | Propuesta valor + 2 roles | `README.md:8` + `BLUEPRINT:36` + `page.tsx:58` hero | ✅ |
| **1** | DER 3 tablas | `supabase_schema.sql:6-58` 4 tablas + `docs/capturas/tablas_supabase.png` (tomar captura) | ✅ (falta captura) |
| **1** | PDF Blueprint | `docs/generar_pdf_opcionA.py` / `generar_pdf.py` → `BLUEPRINT_BARBERPRO_Ronald.pdf` | ⏳ pip install reportlab + run |
| **2** | Stitch 16 pantallas | `STITCH_PROMPTS_FASE2.md` + `docs/capturas/stitch.png` | ✅ prompts, ⏳ captura grid |
| **3** | Frontend modular | `src/app/page.tsx`, `auth/login`, `cliente/dashboard`, `barbero/dashboard`, `barbero/servicios` + 6 components booking | ✅ |
| **4** | Supabase CRUD+RLS+Realtime | `supabase_schema.sql` + `useAuth.ts` + `supabase/client|server|middleware` + `barbero/dashboard:72` Realtime | ✅ |
| **5** | Git 8 commits | 22 commits `git log` | ✅ Supera |
| **5** | Vercel deploy | `VERCEL_DEPLOY.md` + `next.config.ts` + `.env.example` | ⏳ hacer deploy |
| **6** | Live Coding | `globals.css:8` color, `supabase_schema.sql` add column, RLS edit | ✅ Ready |

## Para entregar HOY
1. [ ] Ejecutar `supabase_schema.sql` en Supabase prod `lxegusogwngjqxeksmcw`
2. [ ] Tomar captura Table Editor 4 tablas → `docs/capturas/tablas_supabase.png`
3. [ ] Tomar captura Stitch grid 16 pantallas → `docs/capturas/stitch.png`
4. [ ] `pip install reportlab && python docs/generar_pdf_opcionA.py` → verifica `BLUEPRINT_BARBERPRO_Ronald.pdf` 6 páginas
5. [ ] (Opcional) `python docs/generar_pdf.py` → Opción B
6. [ ] Vercel deploy con `VERCEL_DEPLOY.md` → copiar URL en README
7. [ ] Ensayar Live Coding 3 cambios (color, campo, RLS)
8. [ ] Entregar `INFORME_ENTREGA_FINAL.md` + PDF + URL Vercel

# Onofri & Difulvio

MVP inicial de una web moderna para el centro odontologico con:

- Home visual y dinamica
- Formulario de solicitud de turno
- Apertura de WhatsApp con mensaje prearmado
- Persistencia preparada para Supabase
- Panel admin inicial
- Capa de analiticas preparada para GTM / GA4 / Google Ads

## Ejecutar

1. Instalar dependencias con `npm install`
2. Duplicar `.env.example` a `.env.local`
3. Completar variables
4. Ejecutar `npm run dev`

## Supabase

Crear las tablas usando `supabase/schema.sql`.

Si no se configuran las variables de Supabase, la app funciona en modo demo:

- El formulario valida y arma WhatsApp
- El guardado responde en modo mock
- El panel admin muestra estadisticas de ejemplo

## Siguientes pasos sugeridos

- Conectar Supabase y activar RLS
- Agregar autenticacion real al admin
- Reemplazar textos e imagenes demo por contenido final
- Integrar GTM, GA4 y conversiones de Google Ads

# ElectroBolívar (demo)

Fictional home-appliance store — portfolio project. Next.js + Prisma/Postgres + Vercel Blob.

- **Cliente**: catálogo con filtro por categoría, detalle de producto (galería + video opcional) y pedido armado a mano que se envía por WhatsApp.
- **Administrador**: sin contraseña real (es un demo) — CRUD de productos con subida de fotos, y configuración del número de WhatsApp de contacto.
- **Restablecer demo**: botón en la pantalla inicial (y cron diario) que borra todo y vuelve a cargar el catálogo base.

## Desarrollo local

```bash
npm install
npx prisma migrate dev
npm run dev
```

Necesita `DATABASE_URL` / `DATABASE_URL_UNPOOLED` (Postgres) y, para subir fotos, `BLOB_READ_WRITE_TOKEN` — ver `.env.example`.

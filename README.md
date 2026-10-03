# MercadoBolívar (demo)

Fictional home-appliance store — portfolio project. Next.js + Prisma/Postgres + Vercel Blob.

- **Cliente**: catálogo con filtro por categoría, detalle de producto (galería + video opcional), cuenta de usuario (email/contraseña o Google) y pedido armado a mano que se envía por WhatsApp.
- **Administrador**: sin contraseña real (es un demo) — CRUD de productos con subida de fotos, y configuración del número de WhatsApp de contacto.
- **Restablecer demo**: botón en la pantalla inicial (y cron diario) que borra todo y vuelve a cargar el catálogo base.

## Desarrollo local

```bash
npm install
npx prisma migrate dev
npm run dev
```

Necesita `DATABASE_URL` / `DATABASE_URL_UNPOOLED` (Postgres), `NEXTAUTH_SECRET` / `NEXTAUTH_URL` para el login, y para subir fotos `BLOB_READ_WRITE_TOKEN` — ver `.env.example`. El login con Google (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) es opcional: sin esas variables el botón simplemente no aparece y el login por email/contraseña sigue funcionando.

"Pagar con Mercado Pago" en el carrito necesita `MP_ACCESS_TOKEN` (ver `.env.example`): con una credencial de prueba (`TEST-...`) redirige automáticamente al checkout sandbox, donde se puede pagar con las [tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards) de Mercado Pago sin mover dinero real. Sin esa variable, el botón muestra un error al tocarlo. MODO y "Otra tarjeta" no tienen pasarela real: siguen siendo una simulación.

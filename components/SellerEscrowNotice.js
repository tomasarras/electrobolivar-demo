export default function SellerEscrowNotice({ onDismiss }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <p className="font-semibold text-ink">🛡️ Sistema de seguridad en envíos a domicilio</p>
      <p className="mt-2 text-sm text-ink-soft">
        En BolivarMarket buscamos que cada compra sea más segura, tanto para el comprador como para el vendedor.
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">¿Cómo funciona?</p>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
        <li>Compra realizada: el vendedor recibe una notificación cuando alguien compra su producto.</li>
        <li>Pedido en camino: cuando el vendedor despacha el producto, se notifica que el pedido está en camino.</li>
        <li>Producto entregado: al entregar el producto, el vendedor debe marcar la opción «Ya entregado» en BolivarMarket.</li>
        <li>Confirmación del comprador: el comprador recibe una notificación y puede confirmar que recibió el producto o informar que no lo recibió.</li>
        <li>
          Plazo de confirmación: una vez entregado el producto, si el comprador no responde al mensaje dentro de las
          48 horas, el pago se deposita automáticamente al vendedor, descontando la comisión del 5% de BolivarMarket.
        </li>
        <li>Calificación: el comprador puede calificar su experiencia para ayudar a construir la reputación de los vendedores.</li>
      </ol>
      <p className="mt-3 text-sm font-semibold text-ink">💰 ¿Cómo se distribuye el pago?</p>
      <p className="mt-2 text-sm text-ink-soft">
        El vendedor recibe el 95% del importe de la venta y BolivarMarket retiene el 5% correspondiente a su comisión.
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        ⚠️ <strong className="text-ink">Importante:</strong> si el comprador informa que no recibió el producto, se
        deberá revisar el reclamo antes de liberar el pago.
      </p>
      <p className="mt-3 text-sm text-ink-soft">Nuestro objetivo es brindar más confianza y transparencia en cada operación.</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:brightness-110"
      >
        Entendido
      </button>
    </div>
  );
}

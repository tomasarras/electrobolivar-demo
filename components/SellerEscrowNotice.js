export default function SellerEscrowNotice({ onDismiss }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <p className="font-semibold text-ink">🔒 Sistema de seguridad en envíos a domicilio</p>
      <p className="mt-2 text-sm text-ink-soft">
        En BolivarMarket trabajamos para brindar mayor seguridad y confianza en cada compra, protegiendo tanto a
        compradores como a vendedores.
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">🚚 ¿Cómo funciona?</p>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
        <li>Compra realizada: el vendedor recibe una notificación cuando se concreta una compra.</li>
        <li>Pedido en camino: cuando despacha el producto, el vendedor puede actualizar el estado del pedido.</li>
        <li>Producto entregado: al entregar el pedido, el vendedor debe marcar la opción «Ya entregado».</li>
        <li>
          Confirmación de recepción: el comprador recibe una notificación y puede confirmar que recibió el producto o
          informar que todavía no lo recibió.
        </li>
        <li>
          Calificación: una vez realizada la compra, el comprador puede calificar su experiencia y contribuir a la
          reputación del vendedor.
        </li>
      </ol>
      <p className="mt-3 text-sm font-semibold text-ink">💰 Pagos y comisión</p>
      <p className="mt-2 text-sm text-ink-soft">
        BolivarMarket cobra una comisión del 5&nbsp;% por cada venta realizada a través de la plataforma. El vendedor
        recibe el 95&nbsp;% restante, de acuerdo con las condiciones de pago establecidas.
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        🛡️ <strong className="text-ink">Importante:</strong> el vendedor debe marcar «Ya entregado» únicamente
        cuando haya entregado el producto al comprador. Si el comprador informa que no recibió su pedido, la
        situación deberá revisarse para determinar cómo proceder con el pago.
      </p>
      <p className="mt-3 text-sm text-ink-soft">
        En BolivarMarket, la confianza se construye con cada compra, entrega y buena experiencia.
      </p>
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

export default function SellerEscrowNotice({ onDismiss }) {
  return (
    <div className="rounded-md border border-line bg-panel p-4">
      <p className="font-semibold text-ink">🔒 Sistema de seguridad para envíos a domicilio</p>
      <p className="mt-2 text-sm text-ink-soft">
        Cuando un comprador realiza una compra, el dinero queda retenido temporalmente en BolivarMarket.
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">📦 ¿Cómo funciona?</p>
      <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-ink-soft">
        <li>El vendedor recibe la notificación de la venta y, al seleccionar «Enviar producto», comienza el plazo de 48 horas.</li>
        <li>
          El comprador recibe una notificación indicando que su pedido está en camino y puede seleccionar una de estas opciones:
          <ul className="mt-1 space-y-0.5 pl-4">
            <li>✅ Recibí el producto.</li>
            <li>❌ No recibí el producto.</li>
          </ul>
        </li>
        <li>Si el comprador confirma que recibió el producto, se inicia la liberación del dinero: el 95&nbsp;% se deposita al vendedor y el 5&nbsp;% corresponde a la comisión de BolivarMarket.</li>
        <li>Si el comprador indica que no recibió el producto, se suspende la liberación del dinero y se revisa la situación para determinar si corresponde cancelar la compra y realizar el reembolso.</li>
        <li>Si el comprador no responde dentro de las 48 horas, el sistema libera automáticamente el dinero al vendedor, siempre que se cumplan las condiciones de entrega y no existan reclamos pendientes.</li>
      </ol>
      <p className="mt-3 text-sm text-ink-soft">
        🛡️ <strong className="text-ink">Importante:</strong> este sistema busca brindar mayor seguridad y confianza tanto a compradores como a vendedores. La retención y liberación del dinero están sujetas a las condiciones del servicio de pagos de BolivarMarket.
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

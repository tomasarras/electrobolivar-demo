CREATE TABLE "DeliveryPhoto" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "buyerId" TEXT,
    "buyerName" TEXT,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryPhoto_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DeliveryPhoto" ADD CONSTRAINT "DeliveryPhoto_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DeliveryPhoto" ADD CONSTRAINT "DeliveryPhoto_orderItemId_fkey"
  FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DeliveryPhoto" ADD CONSTRAINT "DeliveryPhoto_buyerId_fkey"
  FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "DeliveryPhoto_productId_idx" ON "DeliveryPhoto"("productId");
CREATE INDEX "DeliveryPhoto_orderItemId_idx" ON "DeliveryPhoto"("orderItemId");

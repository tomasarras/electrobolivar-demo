ALTER TABLE "OrderItem" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pendiente';
ALTER TABLE "OrderItem" ADD COLUMN "shippedAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "deliveredAt" TIMESTAMP(3);
ALTER TABLE "OrderItem" ADD COLUMN "cancelledAt" TIMESTAMP(3);

-- Existing rows predate this feature — treat them as already settled so the
-- new escrow flow only governs orders placed from now on.
UPDATE "OrderItem" SET "status" = 'entregado', "deliveredAt" = NOW() WHERE "status" = 'pendiente';

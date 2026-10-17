ALTER TABLE "Notification" ADD COLUMN "orderId" TEXT;

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

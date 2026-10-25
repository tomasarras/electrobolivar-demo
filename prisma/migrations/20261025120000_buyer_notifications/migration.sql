-- AlterTable
ALTER TABLE "Notification" ALTER COLUMN "sellerId" DROP NOT NULL;
ALTER TABLE "Notification" ADD COLUMN "buyerId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

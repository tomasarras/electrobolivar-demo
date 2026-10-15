CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "productName" TEXT,
    "name" TEXT,
    "body" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Message" ADD CONSTRAINT "Message_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

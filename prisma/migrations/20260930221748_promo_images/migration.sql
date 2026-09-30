-- CreateTable
CREATE TABLE "PromoImage" (
    "id" TEXT NOT NULL,
    "mobileUrl" TEXT NOT NULL,
    "desktopUrl" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoImage_pkey" PRIMARY KEY ("id")
);

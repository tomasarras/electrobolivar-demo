-- Add favoriteCount field (global favorite counter, not tied to user accounts)
ALTER TABLE "Product" ADD COLUMN "favoriteCount" INTEGER NOT NULL DEFAULT 0;

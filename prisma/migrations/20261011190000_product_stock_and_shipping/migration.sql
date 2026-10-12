-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN     "shipping" BOOLEAN NOT NULL DEFAULT true;

-- Backfill stock from the old boolean: in-stock products get a nominal
-- quantity since the real count was never tracked before this column existed.
UPDATE "Product" SET "stock" = CASE WHEN "inStock" THEN 10 ELSE 0 END;

ALTER TABLE "Product" DROP COLUMN "inStock";

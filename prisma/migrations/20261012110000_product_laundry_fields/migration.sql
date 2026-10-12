-- Add laundryBrand/laundryColor fields (category "lavado" / Electro)
ALTER TABLE "Product" ADD COLUMN "laundryBrand" TEXT;
ALTER TABLE "Product" ADD COLUMN "laundryColor" TEXT;

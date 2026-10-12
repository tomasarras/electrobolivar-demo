-- Add homeColor/homeBrand/homeSaleFormat fields (category "climatizacion" / Hogar)
ALTER TABLE "Product" ADD COLUMN "homeColor" TEXT;
ALTER TABLE "Product" ADD COLUMN "homeBrand" TEXT;
ALTER TABLE "Product" ADD COLUMN "homeSaleFormat" TEXT;

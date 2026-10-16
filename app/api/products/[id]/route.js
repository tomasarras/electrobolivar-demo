import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeProduct, validateProductInput, ProductError } from "@/lib/products";

const PRODUCT_INCLUDE = { images: true, specs: true };

export async function GET(request, { params }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const data = await request.json();
  try {
    const input = validateProductInput(data);
    await prisma.productImage.deleteMany({ where: { productId: id } });
    if (input.specs !== undefined) await prisma.productSpec.deleteMany({ where: { productId: id } });
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: input.name,
        category: input.category,
        price: input.price,
        currency: input.currency,
        installments: input.installments,
        condition: input.condition,
        stock: input.stock,
        shipping: input.shipping,
        freeShippingMinAmount: input.freeShippingMinAmount,
        scheduleDays: input.scheduleDays,
        scheduleHours: input.scheduleHours,
        scheduleHours2: input.scheduleHours2,
        location: input.location,
        vehicleCategory: input.vehicleCategory,
        vehicleYear: input.vehicleYear,
        vehicleKm: input.vehicleKm,
        vehicleBrand: input.vehicleBrand,
        vehicleModel: input.vehicleModel,
        vehicleColor: input.vehicleColor,
        propertyOperation: input.propertyOperation,
        propertyCoveredArea: input.propertyCoveredArea,
        propertyTotalArea: input.propertyTotalArea,
        propertyBedrooms: input.propertyBedrooms,
        propertyRooms: input.propertyRooms,
        propertyBathrooms: input.propertyBathrooms,
        propertyTotalUnits: input.propertyTotalUnits,
        propertyLocation: input.propertyLocation,
        phoneBrand: input.phoneBrand,
        phoneModel: input.phoneModel,
        phoneStorage: input.phoneStorage,
        phoneRam: input.phoneRam,
        phoneNetwork: input.phoneNetwork,
        phoneColor: input.phoneColor,
        phoneCamera: input.phoneCamera,
        clothingAccessories: input.clothingAccessories,
        clothingGender: input.clothingGender,
        clothingSize: input.clothingSize,
        clothingBrand: input.clothingBrand,
        clothingColor: input.clothingColor,
        clothingFit: input.clothingFit,
        clothingAge: input.clothingAge,
        clothingMaterial: input.clothingMaterial,
        clothingSleeve: input.clothingSleeve,
        clothingNeckline: input.clothingNeckline,
        beautyCategory: input.beautyCategory,
        beautyBrand: input.beautyBrand,
        homeColor: input.homeColor,
        homeBrand: input.homeBrand,
        homeSaleFormat: input.homeSaleFormat,
        laundryBrand: input.laundryBrand,
        laundryColor: input.laundryColor,
        techCategory: input.techCategory,
        techBrand: input.techBrand,
        techColor: input.techColor,
        description: input.description,
        videoUrl: input.videoUrl,
        images: { create: input.images.map((url, order) => ({ url, order })) },
        ...(input.specs !== undefined
          ? { specs: { create: input.specs.map((s, order) => ({ label: s.label, value: s.value, order })) } }
          : {}),
      },
      include: PRODUCT_INCLUDE,
    });
    return NextResponse.json(serializeProduct(product));
  } catch (err) {
    if (err instanceof ProductError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

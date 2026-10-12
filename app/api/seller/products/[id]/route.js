import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct, validateProductInput, ProductError } from "@/lib/products";

const PRODUCT_INCLUDE = { images: true, specs: true };

async function requireOwnedProduct(id) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };

  const seller = await prisma.seller.findUnique({ where: { userId: session.user.id } });
  if (!seller) return { error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { error: NextResponse.json({ error: "Producto no encontrado" }, { status: 404 }) };
  if (product.sellerId !== seller.id) {
    return { error: NextResponse.json({ error: "Este producto no es tuyo" }, { status: 403 }) };
  }
  return { seller, product };
}

export async function GET(request, { params }) {
  const { id } = await params;
  const { error } = await requireOwnedProduct(id);
  if (error) return error;

  const product = await prisma.product.findUnique({ where: { id }, include: PRODUCT_INCLUDE });
  return NextResponse.json(serializeProduct(product));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { error } = await requireOwnedProduct(id);
  if (error) return error;

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
  const { error } = await requireOwnedProduct(id);
  if (error) return error;

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

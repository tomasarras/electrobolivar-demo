import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProduct, validateProductInput, ProductError } from "@/lib/products";

const PRODUCT_INCLUDE = { images: true, specs: true };

async function requireSeller() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.seller.findUnique({ where: { userId: session.user.id } });
}

export async function GET() {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { sellerId: seller.id },
    include: PRODUCT_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products.map(serializeProduct));
}

export async function POST(request) {
  const seller = await requireSeller();
  if (!seller) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const data = await request.json();
  try {
    const input = validateProductInput(data);
    const product = await prisma.product.create({
      data: {
        name: input.name,
        category: input.category,
        price: input.price,
        currency: input.currency,
        installments: input.installments,
        discountPct: input.discountPct,
        discountPeriod: input.discountPeriod,
        warrantyValue: input.warrantyValue,
        warrantyUnit: input.warrantyUnit,
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
        propertyCategory: input.propertyCategory,
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
        clothingCategory: input.clothingCategory,
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
        homeCategory: input.homeCategory,
        homeColor: input.homeColor,
        homeBrand: input.homeBrand,
        homeSaleFormat: input.homeSaleFormat,
        laundryCategory: input.laundryCategory,
        laundryBrand: input.laundryBrand,
        laundryColor: input.laundryColor,
        techCategory: input.techCategory,
        techBrand: input.techBrand,
        techColor: input.techColor,
        toolsCategory: input.toolsCategory,
        description: input.description,
        videoUrl: input.videoUrl,
        sellerId: seller.id,
        images: { create: input.images.map((url, order) => ({ url, order })) },
        ...(input.specs !== undefined
          ? { specs: { create: input.specs.map((s, order) => ({ label: s.label, value: s.value, order })) } }
          : {}),
      },
      include: PRODUCT_INCLUDE,
    });
    return NextResponse.json(serializeProduct(product), { status: 201 });
  } catch (err) {
    if (err instanceof ProductError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

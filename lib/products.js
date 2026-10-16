import { CATEGORIES } from "@/lib/categories";

export class ProductError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    currency: product.currency || "ARS",
    installments: product.installments,
    condition: product.condition || "nuevo",
    stock: product.stock,
    shipping: product.shipping,
    freeShippingMinAmount: product.freeShippingMinAmount,
    scheduleDays: product.scheduleDays,
    scheduleHours: product.scheduleHours,
    scheduleHours2: product.scheduleHours2,
    location: product.location,
    vehicleCategory: product.vehicleCategory,
    vehicleYear: product.vehicleYear,
    vehicleKm: product.vehicleKm,
    vehicleBrand: product.vehicleBrand,
    vehicleModel: product.vehicleModel,
    vehicleColor: product.vehicleColor,
    propertyOperation: product.propertyOperation,
    propertyCoveredArea: product.propertyCoveredArea,
    propertyTotalArea: product.propertyTotalArea,
    propertyBedrooms: product.propertyBedrooms,
    propertyRooms: product.propertyRooms,
    propertyBathrooms: product.propertyBathrooms,
    propertyTotalUnits: product.propertyTotalUnits,
    propertyLocation: product.propertyLocation,
    phoneBrand: product.phoneBrand,
    phoneModel: product.phoneModel,
    phoneStorage: product.phoneStorage,
    phoneRam: product.phoneRam,
    phoneNetwork: product.phoneNetwork,
    phoneColor: product.phoneColor,
    phoneCamera: product.phoneCamera,
    clothingCategory: product.clothingCategory,
    clothingAccessories: product.clothingAccessories,
    clothingGender: product.clothingGender,
    clothingSize: product.clothingSize,
    clothingBrand: product.clothingBrand,
    clothingColor: product.clothingColor,
    clothingFit: product.clothingFit,
    clothingAge: product.clothingAge,
    clothingMaterial: product.clothingMaterial,
    clothingSleeve: product.clothingSleeve,
    clothingNeckline: product.clothingNeckline,
    beautyCategory: product.beautyCategory,
    beautyBrand: product.beautyBrand,
    homeCategory: product.homeCategory,
    homeColor: product.homeColor,
    homeBrand: product.homeBrand,
    homeSaleFormat: product.homeSaleFormat,
    laundryCategory: product.laundryCategory,
    laundryBrand: product.laundryBrand,
    laundryColor: product.laundryColor,
    techCategory: product.techCategory,
    techBrand: product.techBrand,
    techColor: product.techColor,
    favoriteCount: product.favoriteCount ?? 0,
    description: product.description,
    videoUrl: product.videoUrl,
    sellerId: product.sellerId || null,
    seller: product.seller ? { storeName: product.seller.storeName } : null,
    images: (product.images || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ id: img.id, url: img.url })),
    specs: (product.specs || [])
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((spec) => ({ id: spec.id, label: spec.label, value: spec.value })),
    createdAt: product.createdAt,
  };
}

const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

const VEHICLE_CATEGORIES = ["Auto", "Moto", "Avión", "Helicóptero", "Lancha", "Otros"];

const BEAUTY_CATEGORIES = [
  "Artefactos para el cabello",
  "Barbería",
  "Higiene personal",
  "Artículos de peluquería",
  "Maquillaje",
  "Perfumería",
];

const HOME_SALE_FORMATS = ["Unidad", "Pack"];

const HOME_CATEGORIES = [
  "Living comedor",
  "Cocina y bazar",
  "Vajilla",
  "Decoración",
  "Dormitorio",
  "Muebles guardado",
  "Colchones",
  "Almohadas",
  "Iluminación",
  "Acolchados",
  "Arte",
  "Cajas y canastos",
  "Espejos",
  "Almohadones",
  "Alfombras",
  "Camas",
  "Muebles de jardín",
  "Velas y difusores",
  "Jarrones y floreros",
];

const CLOTHING_CATEGORIES = [
  "Remeras",
  "Pantalones",
  "Camperas y abrigos",
  "Buzos y sweaters",
  "Camisas",
  "Vestidos",
  "Polleras",
  "Shorts y bermudas",
  "Ropa interior",
  "Pijamas",
  "Trajes de baño",
  "Ropa deportiva",
  "Calzado",
  "Carteras y bolsos",
  "Cinturones",
  "Gorras y sombreros",
  "Medias",
  "Accesorios",
];

const LAUNDRY_CATEGORIES = [
  "Heladeras y freezers",
  "Televisores",
  "Peq. electros cocina",
  "Peq. electros hogar",
  "Cocinas",
  "Lavarropas",
  "Aire acondicionado",
  "Termotanques y calefones",
  "Reproductores portátiles",
  "Hornos, anafes y campanas",
  "Purificadores",
  "Microondas",
  "Freidoras de aire",
  "Equipos de audio",
  "Streaming",
  "Cavas",
  "Lavavajillas",
];

const TECH_CATEGORIES = [
  "Celulares",
  "Auriculares",
  "Smartwatches",
  "Notebooks",
  "Computadoras",
  "Consolas y videojuegos",
  "Monitores",
  "Mouses y teclados",
  "Componentes PC",
  "Cámaras",
  "Drones",
  "Parlantes",
  "Impresoras",
  "Accesorios para celular",
  "Tablets",
  "Conectividad",
  "Proyectores",
];

function parseOptionalNonNegativeInt(value, errorMessage) {
  if (!value && value !== 0) return null;
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 0) throw new ProductError(errorMessage, 400);
  return n;
}

export function validateProductInput(data) {
  const name = (data.name || "").trim();
  if (!name) throw new ProductError("Falta el nombre del producto", 400);
  const location = (data.location || "").trim();
  if (!location) throw new ProductError("Falta la ciudad o zona del producto", 400);
  const category = CATEGORY_SLUGS.includes(data.category) ? data.category : CATEGORY_SLUGS[0];
  const price = Number(data.price);
  if (!Number.isFinite(price) || price < 0) throw new ProductError("El precio no es válido", 400);
  const stock = Math.trunc(Number(data.stock));
  if (!Number.isFinite(stock) || stock < 0) throw new ProductError("El stock no es válido", 400);
  const shipping = data.shipping !== false;
  let freeShippingMinAmount = null;
  if (shipping && (data.freeShippingMinAmount || data.freeShippingMinAmount === 0)) {
    const amount = Math.trunc(Number(data.freeShippingMinAmount));
    if (!Number.isFinite(amount) || amount < 0) throw new ProductError("El monto de envío gratis no es válido", 400);
    freeShippingMinAmount = amount;
  }
  const vehicleYear = parseOptionalNonNegativeInt(data.vehicleYear, "El año no es válido");
  const vehicleKm = parseOptionalNonNegativeInt(data.vehicleKm, "El kilometraje no es válido");
  const propertyCoveredArea = parseOptionalNonNegativeInt(data.propertyCoveredArea, "La superficie cubierta no es válida");
  const propertyTotalArea = parseOptionalNonNegativeInt(data.propertyTotalArea, "La superficie total no es válida");
  const propertyBedrooms = parseOptionalNonNegativeInt(data.propertyBedrooms, "Los dormitorios no son válidos");
  const propertyRooms = parseOptionalNonNegativeInt(data.propertyRooms, "Los ambientes no son válidos");
  const propertyBathrooms = parseOptionalNonNegativeInt(data.propertyBathrooms, "Los baños no son válidos");
  const propertyTotalUnits = parseOptionalNonNegativeInt(data.propertyTotalUnits, "Las unidades totales no son válidas");
  const images = Array.isArray(data.images) ? data.images.filter(Boolean) : [];
  // The product form no longer offers a "Características" editor — specs are
  // only ever touched when a caller explicitly sends an array, so an edit
  // made from the form doesn't wipe out specs a product already has.
  const specs = Array.isArray(data.specs)
    ? data.specs
        .map((s) => ({ label: String(s?.label || "").trim(), value: String(s?.value || "").trim() }))
        .filter((s) => s.label && s.value)
    : undefined;
  return {
    name,
    category,
    price: Math.round(price),
    currency: data.currency === "USD" ? "USD" : "ARS",
    installments: data.installments ? String(data.installments).trim() : null,
    condition: data.condition === "usado" ? "usado" : "nuevo",
    stock,
    shipping,
    freeShippingMinAmount,
    scheduleDays: data.scheduleDays ? String(data.scheduleDays).trim() : null,
    scheduleHours: data.scheduleHours ? String(data.scheduleHours).trim() : null,
    scheduleHours2: data.scheduleHours2 ? String(data.scheduleHours2).trim() : null,
    location,
    vehicleCategory: VEHICLE_CATEGORIES.includes(data.vehicleCategory) ? data.vehicleCategory : null,
    vehicleYear,
    vehicleKm,
    vehicleBrand: data.vehicleBrand ? String(data.vehicleBrand).trim() : null,
    vehicleModel: data.vehicleModel ? String(data.vehicleModel).trim() : null,
    vehicleColor: data.vehicleColor ? String(data.vehicleColor).trim() : null,
    propertyOperation: data.propertyOperation === "alquiler" || data.propertyOperation === "venta" ? data.propertyOperation : null,
    propertyCoveredArea,
    propertyTotalArea,
    propertyBedrooms,
    propertyRooms,
    propertyBathrooms,
    propertyTotalUnits,
    propertyLocation: data.propertyLocation ? String(data.propertyLocation).trim() : null,
    phoneBrand: data.phoneBrand ? String(data.phoneBrand).trim() : null,
    phoneModel: data.phoneModel ? String(data.phoneModel).trim() : null,
    phoneStorage: data.phoneStorage ? String(data.phoneStorage).trim() : null,
    phoneRam: data.phoneRam ? String(data.phoneRam).trim() : null,
    phoneNetwork: data.phoneNetwork ? String(data.phoneNetwork).trim() : null,
    phoneColor: data.phoneColor ? String(data.phoneColor).trim() : null,
    phoneCamera: data.phoneCamera ? String(data.phoneCamera).trim() : null,
    clothingCategory: CLOTHING_CATEGORIES.includes(data.clothingCategory) ? data.clothingCategory : null,
    clothingAccessories: data.clothingAccessories ? String(data.clothingAccessories).trim() : null,
    clothingGender: data.clothingGender ? String(data.clothingGender).trim() : null,
    clothingSize: data.clothingSize ? String(data.clothingSize).trim() : null,
    clothingBrand: data.clothingBrand ? String(data.clothingBrand).trim() : null,
    clothingColor: data.clothingColor ? String(data.clothingColor).trim() : null,
    clothingFit: data.clothingFit ? String(data.clothingFit).trim() : null,
    clothingAge: data.clothingAge ? String(data.clothingAge).trim() : null,
    clothingMaterial: data.clothingMaterial ? String(data.clothingMaterial).trim() : null,
    clothingSleeve: data.clothingSleeve ? String(data.clothingSleeve).trim() : null,
    clothingNeckline: data.clothingNeckline ? String(data.clothingNeckline).trim() : null,
    beautyCategory: BEAUTY_CATEGORIES.includes(data.beautyCategory) ? data.beautyCategory : null,
    beautyBrand: data.beautyBrand ? String(data.beautyBrand).trim() : null,
    homeCategory: HOME_CATEGORIES.includes(data.homeCategory) ? data.homeCategory : null,
    homeColor: data.homeColor ? String(data.homeColor).trim() : null,
    homeBrand: data.homeBrand ? String(data.homeBrand).trim() : null,
    homeSaleFormat: HOME_SALE_FORMATS.includes(data.homeSaleFormat) ? data.homeSaleFormat : null,
    laundryCategory: LAUNDRY_CATEGORIES.includes(data.laundryCategory) ? data.laundryCategory : null,
    laundryBrand: data.laundryBrand ? String(data.laundryBrand).trim() : null,
    laundryColor: data.laundryColor ? String(data.laundryColor).trim() : null,
    techCategory: TECH_CATEGORIES.includes(data.techCategory) ? data.techCategory : null,
    techBrand: data.techBrand ? String(data.techBrand).trim() : null,
    techColor: data.techColor ? String(data.techColor).trim() : null,
    description: data.description ? String(data.description).trim() : null,
    videoUrl: data.videoUrl ? String(data.videoUrl).trim() : null,
    images,
    specs,
  };
}

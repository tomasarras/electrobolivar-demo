"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Loader2, X, Film, Plus, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const MAX_IMAGES = 4;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const NO_SHIPPING_CATEGORIES = ["vehiculos", "inmobiliaria"];
const NO_STOCK_CATEGORIES = ["vehiculos", "inmobiliaria"];

export default function ProductForm({ product, basePath = "/api/products", redirectTo = "/admin/productos" }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name || "");
  const [category, setCategory] = useState(product?.category || CATEGORIES[0].slug);
  const [price, setPrice] = useState(product?.price || "");
  const [currency, setCurrency] = useState(product?.currency || "ARS");
  const [installments, setInstallments] = useState(product?.installments || "");
  const [condition, setCondition] = useState(product?.condition || "nuevo");
  const [stock, setStock] = useState(product?.stock ?? 0);
  const [shipping, setShipping] = useState(product?.shipping !== false);
  const [freeShippingMode, setFreeShippingMode] = useState(
    product?.freeShippingMinAmount === 0 ? "always" : product?.freeShippingMinAmount > 0 ? "threshold" : "none"
  );
  const [freeShippingAmount, setFreeShippingAmount] = useState(
    product?.freeShippingMinAmount > 0 ? product.freeShippingMinAmount : ""
  );
  const [location, setLocation] = useState(product?.location || "");
  const [scheduleDays, setScheduleDays] = useState(product?.scheduleDays || "");
  const [scheduleHours, setScheduleHours] = useState(product?.scheduleHours || "");
  const [scheduleHours2, setScheduleHours2] = useState(product?.scheduleHours2 || "");
  const [showSecondSchedule, setShowSecondSchedule] = useState(Boolean(product?.scheduleHours2));
  const [vehicleCategory, setVehicleCategory] = useState(product?.vehicleCategory || "");
  const [vehicleYear, setVehicleYear] = useState(product?.vehicleYear || "");
  const [vehicleKm, setVehicleKm] = useState(product?.vehicleKm ?? "");
  const [vehicleBrand, setVehicleBrand] = useState(product?.vehicleBrand || "");
  const [vehicleModel, setVehicleModel] = useState(product?.vehicleModel || "");
  const [vehicleColor, setVehicleColor] = useState(product?.vehicleColor || "");
  const [propertyOperation, setPropertyOperation] = useState(product?.propertyOperation || "venta");
  const [propertyCoveredArea, setPropertyCoveredArea] = useState(product?.propertyCoveredArea ?? "");
  const [propertyTotalArea, setPropertyTotalArea] = useState(product?.propertyTotalArea ?? "");
  const [propertyBedrooms, setPropertyBedrooms] = useState(product?.propertyBedrooms ?? "");
  const [propertyRooms, setPropertyRooms] = useState(product?.propertyRooms ?? "");
  const [propertyBathrooms, setPropertyBathrooms] = useState(product?.propertyBathrooms ?? "");
  const [propertyTotalUnits, setPropertyTotalUnits] = useState(product?.propertyTotalUnits ?? "");
  const [propertyLocation, setPropertyLocation] = useState(product?.propertyLocation || "");
  const [phoneBrand, setPhoneBrand] = useState(product?.phoneBrand || "");
  const [phoneModel, setPhoneModel] = useState(product?.phoneModel || "");
  const [phoneStorage, setPhoneStorage] = useState(product?.phoneStorage || "");
  const [phoneRam, setPhoneRam] = useState(product?.phoneRam || "");
  const [phoneNetwork, setPhoneNetwork] = useState(product?.phoneNetwork || "");
  const [phoneColor, setPhoneColor] = useState(product?.phoneColor || "");
  const [phoneCamera, setPhoneCamera] = useState(product?.phoneCamera || "");
  const [clothingCategory, setClothingCategory] = useState(product?.clothingCategory || "");
  const [clothingAccessories, setClothingAccessories] = useState(product?.clothingAccessories || "");
  const [clothingGender, setClothingGender] = useState(product?.clothingGender || "");
  const [clothingSize, setClothingSize] = useState(product?.clothingSize || "");
  const [clothingBrand, setClothingBrand] = useState(product?.clothingBrand || "");
  const [clothingColor, setClothingColor] = useState(product?.clothingColor || "");
  const [clothingFit, setClothingFit] = useState(product?.clothingFit || "");
  const [clothingAge, setClothingAge] = useState(product?.clothingAge || "");
  const [clothingMaterial, setClothingMaterial] = useState(product?.clothingMaterial || "");
  const [clothingSleeve, setClothingSleeve] = useState(product?.clothingSleeve || "");
  const [clothingNeckline, setClothingNeckline] = useState(product?.clothingNeckline || "");
  const [beautyCategory, setBeautyCategory] = useState(product?.beautyCategory || "");
  const [beautyBrand, setBeautyBrand] = useState(product?.beautyBrand || "");
  const [homeCategory, setHomeCategory] = useState(product?.homeCategory || "");
  const [homeColor, setHomeColor] = useState(product?.homeColor || "");
  const [homeBrand, setHomeBrand] = useState(product?.homeBrand || "");
  const [homeSaleFormat, setHomeSaleFormat] = useState(product?.homeSaleFormat || "");
  const [laundryCategory, setLaundryCategory] = useState(product?.laundryCategory || "");
  const [laundryBrand, setLaundryBrand] = useState(product?.laundryBrand || "");
  const [laundryColor, setLaundryColor] = useState(product?.laundryColor || "");
  const [techCategory, setTechCategory] = useState(product?.techCategory || "");
  const [techBrand, setTechBrand] = useState(product?.techBrand || "");
  const [techColor, setTechColor] = useState(product?.techColor || "");
  const [toolsCategory, setToolsCategory] = useState(product?.toolsCategory || "");
  const [videoUrl, setVideoUrl] = useState(product?.videoUrl || "");
  const [description, setDescription] = useState(product?.description || "");
  const [images, setImages] = useState((product?.images || []).map((img) => img.url));
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        if (images.length >= MAX_IMAGES) break;
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo subir la imagen");
        setImages((prev) => [...prev, data.url]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleVideoFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      setError("El video no puede pesar más de 50MB.");
      return;
    }
    setUploadingVideo(true);
    setError("");
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/video-upload",
      });
      setVideoUrl(blob.url);
    } catch (err) {
      setError(err.message || "No se pudo subir el video");
    } finally {
      setUploadingVideo(false);
    }
  }

  function removeVideo() {
    setVideoUrl("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!location.trim()) {
      setError("La ciudad o zona es obligatoria.");
      return;
    }
    setSaving(true);
    try {
      const noShippingCategory = NO_SHIPPING_CATEGORIES.includes(category);
      const effectiveShipping = noShippingCategory ? false : shipping;
      const payload = {
        name: name.trim(),
        category,
        price: Number(price),
        currency,
        installments: installments.trim(),
        condition,
        stock: NO_STOCK_CATEGORIES.includes(category) ? 1 : Number(stock),
        shipping: effectiveShipping,
        freeShippingMinAmount:
          effectiveShipping && freeShippingMode === "always"
            ? 0
            : effectiveShipping && freeShippingMode === "threshold"
              ? Number(freeShippingAmount)
              : null,
        location: location.trim(),
        scheduleDays: scheduleDays.trim(),
        scheduleHours: scheduleHours.trim(),
        scheduleHours2: showSecondSchedule ? scheduleHours2.trim() : "",
        vehicleCategory: category === "vehiculos" ? vehicleCategory : "",
        vehicleYear: category === "vehiculos" && vehicleYear !== "" ? Number(vehicleYear) : null,
        vehicleKm: category === "vehiculos" && vehicleKm !== "" ? Number(vehicleKm) : null,
        vehicleBrand: category === "vehiculos" ? vehicleBrand.trim() : "",
        vehicleModel: category === "vehiculos" ? vehicleModel.trim() : "",
        vehicleColor: category === "vehiculos" ? vehicleColor.trim() : "",
        propertyOperation: category === "inmobiliaria" ? propertyOperation : null,
        propertyCoveredArea: category === "inmobiliaria" && propertyCoveredArea !== "" ? Number(propertyCoveredArea) : null,
        propertyTotalArea: category === "inmobiliaria" && propertyTotalArea !== "" ? Number(propertyTotalArea) : null,
        propertyBedrooms: category === "inmobiliaria" && propertyBedrooms !== "" ? Number(propertyBedrooms) : null,
        propertyRooms: category === "inmobiliaria" && propertyRooms !== "" ? Number(propertyRooms) : null,
        propertyBathrooms: category === "inmobiliaria" && propertyBathrooms !== "" ? Number(propertyBathrooms) : null,
        propertyTotalUnits: category === "inmobiliaria" && propertyTotalUnits !== "" ? Number(propertyTotalUnits) : null,
        propertyLocation: category === "inmobiliaria" ? propertyLocation.trim() : "",
        phoneBrand: category === "cocina" && techCategory === "Celulares" ? phoneBrand.trim() : "",
        phoneModel: category === "cocina" && techCategory === "Celulares" ? phoneModel.trim() : "",
        phoneStorage: category === "cocina" && techCategory === "Celulares" ? phoneStorage.trim() : "",
        phoneRam: category === "cocina" && techCategory === "Celulares" ? phoneRam.trim() : "",
        phoneNetwork: category === "cocina" && techCategory === "Celulares" ? phoneNetwork.trim() : "",
        phoneColor: category === "cocina" && techCategory === "Celulares" ? phoneColor.trim() : "",
        phoneCamera: category === "cocina" && techCategory === "Celulares" ? phoneCamera.trim() : "",
        clothingCategory: category === "ropa" ? clothingCategory : "",
        clothingAccessories: category === "ropa" ? clothingAccessories.trim() : "",
        clothingGender: category === "ropa" ? clothingGender : "",
        clothingSize: category === "ropa" ? clothingSize.trim() : "",
        clothingBrand: category === "ropa" ? clothingBrand.trim() : "",
        clothingColor: category === "ropa" ? clothingColor.trim() : "",
        clothingFit: category === "ropa" ? clothingFit : "",
        clothingAge: category === "ropa" ? clothingAge.trim() : "",
        clothingMaterial: category === "ropa" ? clothingMaterial.trim() : "",
        clothingSleeve: category === "ropa" ? clothingSleeve : "",
        clothingNeckline: category === "ropa" ? clothingNeckline : "",
        beautyCategory: category === "pequenos" ? beautyCategory : "",
        beautyBrand: category === "pequenos" ? beautyBrand.trim() : "",
        homeCategory: category === "climatizacion" ? homeCategory : "",
        homeColor: category === "climatizacion" ? homeColor.trim() : "",
        homeBrand: category === "climatizacion" ? homeBrand.trim() : "",
        homeSaleFormat: category === "climatizacion" ? homeSaleFormat : "",
        laundryCategory: category === "lavado" ? laundryCategory : "",
        laundryBrand: category === "lavado" ? laundryBrand.trim() : "",
        laundryColor: category === "lavado" ? laundryColor.trim() : "",
        techCategory: category === "cocina" ? techCategory : "",
        techBrand: category === "cocina" && techCategory !== "Celulares" ? techBrand.trim() : "",
        techColor: category === "cocina" && techCategory !== "Celulares" ? techColor.trim() : "",
        toolsCategory: category === "herramientas" ? toolsCategory : "",
        videoUrl: videoUrl.trim(),
        description: description.trim(),
        images,
      };
      const res = await fetch(isEdit ? `${basePath}/${product.id}` : basePath, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el producto");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("¿Borrar este producto? Esta acción no se puede deshacer.")) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`${basePath}/${product.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo borrar el producto");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <Field label="Nombre">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Heladera No Frost 320L"
          className="input"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Categoría">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Precio">
          <div className="grid grid-cols-[1fr_5.5rem] gap-2">
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="input"
              required
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </Field>
      </div>

      <Field label="Cuotas (opcional)">
        <input
          value={installments}
          onChange={(e) => setInstallments(e.target.value)}
          placeholder="12 cuotas sin interés"
          className="input"
        />
      </Field>

      <Field label="Ciudad o zona">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Bolívar"
          required
          className="input"
        />
      </Field>

      {category === "cocina" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría (opcional)">
            <select value={techCategory} onChange={(e) => setTechCategory(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Celulares">Celulares</option>
              <option value="Auriculares">Auriculares</option>
              <option value="Smartwatches">Smartwatches</option>
              <option value="Notebooks">Notebooks</option>
              <option value="Computadoras">Computadoras</option>
              <option value="Consolas y videojuegos">Consolas y videojuegos</option>
              <option value="Monitores">Monitores</option>
              <option value="Mouses y teclados">Mouses y teclados</option>
              <option value="Componentes PC">Componentes PC</option>
              <option value="Cámaras">Cámaras</option>
              <option value="Drones">Drones</option>
              <option value="Parlantes">Parlantes</option>
              <option value="Impresoras">Impresoras</option>
              <option value="Accesorios para celular">Accesorios para celular</option>
              <option value="Tablets">Tablets</option>
              <option value="Conectividad">Conectividad</option>
              <option value="Proyectores">Proyectores</option>
            </select>
          </Field>
          {techCategory === "Celulares" ? (
            <>
              <Field label="Marca (opcional)">
                <input
                  value={phoneBrand}
                  onChange={(e) => setPhoneBrand(e.target.value)}
                  placeholder="Samsung"
                  className="input"
                />
              </Field>
              <Field label="Modelo (opcional)">
                <input
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  placeholder="Galaxy S23"
                  className="input"
                />
              </Field>
              <Field label="Memoria interna (opcional)">
                <input
                  value={phoneStorage}
                  onChange={(e) => setPhoneStorage(e.target.value)}
                  placeholder="128GB"
                  className="input"
                />
              </Field>
              <Field label="Memoria RAM (opcional)">
                <input
                  value={phoneRam}
                  onChange={(e) => setPhoneRam(e.target.value)}
                  placeholder="8GB"
                  className="input"
                />
              </Field>
              <Field label="Red móvil (opcional)">
                <select value={phoneNetwork} onChange={(e) => setPhoneNetwork(e.target.value)} className="input">
                  <option value="">Sin especificar</option>
                  <option value="4G">4G</option>
                  <option value="5G">5G</option>
                  <option value="Solo WiFi">Solo WiFi</option>
                </select>
              </Field>
              <Field label="Color (opcional)">
                <input
                  value={phoneColor}
                  onChange={(e) => setPhoneColor(e.target.value)}
                  placeholder="Negro"
                  className="input"
                />
              </Field>
              <Field label="Cámara (opcional)">
                <input
                  value={phoneCamera}
                  onChange={(e) => setPhoneCamera(e.target.value)}
                  placeholder="50MP + 12MP"
                  className="input"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Marca (opcional)">
                <input
                  value={techBrand}
                  onChange={(e) => setTechBrand(e.target.value)}
                  placeholder="Logitech"
                  className="input"
                />
              </Field>
              <Field label="Color (opcional)">
                <input
                  value={techColor}
                  onChange={(e) => setTechColor(e.target.value)}
                  placeholder="Negro"
                  className="input"
                />
              </Field>
            </>
          )}
        </div>
      )}

      {category === "vehiculos" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría (opcional)">
            <select value={vehicleCategory} onChange={(e) => setVehicleCategory(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Autos">Autos</option>
              <option value="Camionetas">Camionetas</option>
              <option value="Camiones">Camiones</option>
              <option value="Colectivos">Colectivos</option>
              <option value="Maquinaria agrícola">Maquinaria agrícola</option>
              <option value="Maquinaria vial">Maquinaria vial</option>
              <option value="Motorhomes">Motorhomes</option>
              <option value="Motos">Motos</option>
              <option value="Náutica">Náutica</option>
              <option value="Planes de ahorro">Planes de ahorro</option>
              <option value="Semirremolques">Semirremolques</option>
              <option value="Chocados">Chocados</option>
              <option value="Colección">Colección</option>
            </select>
          </Field>
          <Field label="Marca (opcional)">
            <input
              value={vehicleBrand}
              onChange={(e) => setVehicleBrand(e.target.value)}
              placeholder="Toyota"
              className="input"
            />
          </Field>
          <Field label="Modelo (opcional)">
            <input
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              placeholder="Corolla"
              className="input"
            />
          </Field>
          <Field label="Año (opcional)">
            <input
              type="number"
              min="0"
              value={vehicleYear}
              onChange={(e) => setVehicleYear(e.target.value)}
              placeholder="2020"
              className="input"
            />
          </Field>
          <Field label="Kilómetros (opcional)">
            <input
              type="number"
              min="0"
              value={vehicleKm}
              onChange={(e) => setVehicleKm(e.target.value)}
              placeholder="45000"
              className="input"
            />
          </Field>
          <Field label="Color (opcional)">
            <input
              value={vehicleColor}
              onChange={(e) => setVehicleColor(e.target.value)}
              placeholder="Gris"
              className="input"
            />
          </Field>
        </div>
      )}

      {category === "inmobiliaria" && (
        <>
          <Field label="Ubicación (opcional)">
            <input
              value={propertyLocation}
              onChange={(e) => setPropertyLocation(e.target.value)}
              placeholder="Av. San Martín 450, Bolívar"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
          <Field label="¿Alquiler o venta?">
            <select value={propertyOperation} onChange={(e) => setPropertyOperation(e.target.value)} className="input">
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </Field>
          <Field label="Ambientes (opcional)">
            <input
              type="number"
              min="0"
              value={propertyRooms}
              onChange={(e) => setPropertyRooms(e.target.value)}
              placeholder="3"
              className="input"
            />
          </Field>
          <Field label="Dormitorios (opcional)">
            <input
              type="number"
              min="0"
              value={propertyBedrooms}
              onChange={(e) => setPropertyBedrooms(e.target.value)}
              placeholder="2"
              className="input"
            />
          </Field>
          <Field label="Baños (opcional)">
            <input
              type="number"
              min="0"
              value={propertyBathrooms}
              onChange={(e) => setPropertyBathrooms(e.target.value)}
              placeholder="1"
              className="input"
            />
          </Field>
          <Field label="Superficie cubierta en m² (opcional)">
            <input
              type="number"
              min="0"
              value={propertyCoveredArea}
              onChange={(e) => setPropertyCoveredArea(e.target.value)}
              placeholder="80"
              className="input"
            />
          </Field>
          <Field label="Superficie total en m² (opcional)">
            <input
              type="number"
              min="0"
              value={propertyTotalArea}
              onChange={(e) => setPropertyTotalArea(e.target.value)}
              placeholder="120"
              className="input"
            />
          </Field>
          <Field label="Unidades totales (opcional)">
            <input
              type="number"
              min="0"
              value={propertyTotalUnits}
              onChange={(e) => setPropertyTotalUnits(e.target.value)}
              placeholder="1"
              className="input"
            />
          </Field>
          </div>
        </>
      )}

      {category === "ropa" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría (opcional)">
            <select value={clothingCategory} onChange={(e) => setClothingCategory(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Remeras">Remeras</option>
              <option value="Pantalones">Pantalones</option>
              <option value="Camperas y abrigos">Camperas y abrigos</option>
              <option value="Buzos y sweaters">Buzos y sweaters</option>
              <option value="Camisas">Camisas</option>
              <option value="Vestidos">Vestidos</option>
              <option value="Polleras">Polleras</option>
              <option value="Shorts y bermudas">Shorts y bermudas</option>
              <option value="Ropa interior">Ropa interior</option>
              <option value="Pijamas">Pijamas</option>
              <option value="Trajes de baño">Trajes de baño</option>
              <option value="Ropa deportiva">Ropa deportiva</option>
              <option value="Calzado">Calzado</option>
              <option value="Carteras y bolsos">Carteras y bolsos</option>
              <option value="Cinturones">Cinturones</option>
              <option value="Gorras y sombreros">Gorras y sombreros</option>
              <option value="Medias">Medias</option>
              <option value="Accesorios">Accesorios</option>
            </select>
          </Field>
          <Field label="Accesorios (opcional)">
            <input
              value={clothingAccessories}
              onChange={(e) => setClothingAccessories(e.target.value)}
              placeholder="Cinturón, gorra"
              className="input"
            />
          </Field>
          <Field label="Género (opcional)">
            <select value={clothingGender} onChange={(e) => setClothingGender(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
              <option value="Niños">Niños</option>
              <option value="Bebés">Bebés</option>
            </select>
          </Field>
          <Field label="Talle (opcional)">
            <input
              value={clothingSize}
              onChange={(e) => setClothingSize(e.target.value)}
              placeholder="M"
              className="input"
            />
          </Field>
          <Field label="Marca (opcional)">
            <input
              value={clothingBrand}
              onChange={(e) => setClothingBrand(e.target.value)}
              placeholder="Nike"
              className="input"
            />
          </Field>
          <Field label="Color (opcional)">
            <input
              value={clothingColor}
              onChange={(e) => setClothingColor(e.target.value)}
              placeholder="Negro"
              className="input"
            />
          </Field>
          <Field label="Forma del calce (opcional)">
            <select value={clothingFit} onChange={(e) => setClothingFit(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Ajustado">Ajustado</option>
              <option value="Regular">Regular</option>
              <option value="Holgado">Holgado</option>
              <option value="Oversize">Oversize</option>
            </select>
          </Field>
          <Field label="Edad (opcional)">
            <input
              value={clothingAge}
              onChange={(e) => setClothingAge(e.target.value)}
              placeholder="Adulto"
              className="input"
            />
          </Field>
          <Field label="Material principal (opcional)">
            <input
              value={clothingMaterial}
              onChange={(e) => setClothingMaterial(e.target.value)}
              placeholder="Algodón"
              className="input"
            />
          </Field>
          <Field label="Tipo de manga (opcional)">
            <select value={clothingSleeve} onChange={(e) => setClothingSleeve(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Manga larga">Manga larga</option>
              <option value="Manga corta">Manga corta</option>
              <option value="3/4">3/4</option>
              <option value="Sin manga">Sin manga</option>
            </select>
          </Field>
          <Field label="Tipo de cuello (opcional)">
            <select value={clothingNeckline} onChange={(e) => setClothingNeckline(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Redondo">Redondo</option>
              <option value="V">V</option>
              <option value="Camisero">Camisero</option>
              <option value="Polo">Polo</option>
              <option value="Tortuga">Tortuga</option>
              <option value="Sin cuello">Sin cuello</option>
            </select>
          </Field>
        </div>
      )}

      {category === "pequenos" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría (opcional)">
            <select value={beautyCategory} onChange={(e) => setBeautyCategory(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Artefactos para el cabello">Artefactos para el cabello</option>
              <option value="Barbería">Barbería</option>
              <option value="Higiene personal">Higiene personal</option>
              <option value="Artículos de peluquería">Artículos de peluquería</option>
              <option value="Maquillaje">Maquillaje</option>
              <option value="Perfumería">Perfumería</option>
            </select>
          </Field>
          <Field label="Marca (opcional)">
            <input
              value={beautyBrand}
              onChange={(e) => setBeautyBrand(e.target.value)}
              placeholder="Philips"
              className="input"
            />
          </Field>
        </div>
      )}

      {category === "climatizacion" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría (opcional)">
            <select value={homeCategory} onChange={(e) => setHomeCategory(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Living comedor">Living comedor</option>
              <option value="Cocina y bazar">Cocina y bazar</option>
              <option value="Vajilla">Vajilla</option>
              <option value="Decoración">Decoración</option>
              <option value="Dormitorio">Dormitorio</option>
              <option value="Muebles guardado">Muebles guardado</option>
              <option value="Colchones">Colchones</option>
              <option value="Almohadas">Almohadas</option>
              <option value="Iluminación">Iluminación</option>
              <option value="Acolchados">Acolchados</option>
              <option value="Arte">Arte</option>
              <option value="Cajas y canastos">Cajas y canastos</option>
              <option value="Espejos">Espejos</option>
              <option value="Almohadones">Almohadones</option>
              <option value="Alfombras">Alfombras</option>
              <option value="Camas">Camas</option>
              <option value="Muebles de jardín">Muebles de jardín</option>
              <option value="Velas y difusores">Velas y difusores</option>
              <option value="Jarrones y floreros">Jarrones y floreros</option>
            </select>
          </Field>
          <Field label="Color (opcional)">
            <input
              value={homeColor}
              onChange={(e) => setHomeColor(e.target.value)}
              placeholder="Blanco"
              className="input"
            />
          </Field>
          <Field label="Marca (opcional)">
            <input
              value={homeBrand}
              onChange={(e) => setHomeBrand(e.target.value)}
              placeholder="Surrey"
              className="input"
            />
          </Field>
          <Field label="Formato de venta (opcional)">
            <select value={homeSaleFormat} onChange={(e) => setHomeSaleFormat(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Unidad">Unidad</option>
              <option value="Pack">Pack</option>
            </select>
          </Field>
        </div>
      )}

      {category === "lavado" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría (opcional)">
            <select value={laundryCategory} onChange={(e) => setLaundryCategory(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Heladeras y freezers">Heladeras y freezers</option>
              <option value="Televisores">Televisores</option>
              <option value="Peq. electros cocina">Peq. electros cocina</option>
              <option value="Peq. electros hogar">Peq. electros hogar</option>
              <option value="Cocinas">Cocinas</option>
              <option value="Lavarropas">Lavarropas</option>
              <option value="Aire acondicionado">Aire acondicionado</option>
              <option value="Termotanques y calefones">Termotanques y calefones</option>
              <option value="Reproductores portátiles">Reproductores portátiles</option>
              <option value="Hornos, anafes y campanas">Hornos, anafes y campanas</option>
              <option value="Purificadores">Purificadores</option>
              <option value="Microondas">Microondas</option>
              <option value="Freidoras de aire">Freidoras de aire</option>
              <option value="Equipos de audio">Equipos de audio</option>
              <option value="Streaming">Streaming</option>
              <option value="Cavas">Cavas</option>
              <option value="Lavavajillas">Lavavajillas</option>
            </select>
          </Field>
          <Field label="Marca (opcional)">
            <input
              value={laundryBrand}
              onChange={(e) => setLaundryBrand(e.target.value)}
              placeholder="Whirlpool"
              className="input"
            />
          </Field>
          <Field label="Color (opcional)">
            <input
              value={laundryColor}
              onChange={(e) => setLaundryColor(e.target.value)}
              placeholder="Blanco"
              className="input"
            />
          </Field>
        </div>
      )}

      {category === "herramientas" && (
        <div className="grid grid-cols-2 gap-4">
          <Field label="Categoría (opcional)">
            <select value={toolsCategory} onChange={(e) => setToolsCategory(e.target.value)} className="input">
              <option value="">Sin especificar</option>
              <option value="Htas. eléctricas">Htas. eléctricas</option>
              <option value="Htas. jardín">Htas. jardín</option>
              <option value="Htas. manuales">Htas. manuales</option>
              <option value="Htas. medición">Htas. medición</option>
              <option value="Acc. herramientas">Acc. herramientas</option>
              <option value="Baños y sanitarios">Baños y sanitarios</option>
              <option value="Electricidad">Electricidad</option>
              <option value="Pinturería">Pinturería</option>
              <option value="Plomería">Plomería</option>
              <option value="Materiales de obras">Materiales de obras</option>
              <option value="Aberturas">Aberturas</option>
              <option value="Acc. construcción">Acc. construcción</option>
              <option value="Pisos y revestimientos">Pisos y revestimientos</option>
              <option value="Mobiliario cocinas">Mobiliario cocinas</option>
              <option value="Maquinaria construcción">Maquinaria construcción</option>
              <option value="Cajas y organizadores">Cajas y organizadores</option>
              <option value="Htas. industriales">Htas. industriales</option>
              <option value="Htas. neumáticas">Htas. neumáticas</option>
            </select>
          </Field>
        </div>
      )}

      <div className={`grid gap-4 ${NO_STOCK_CATEGORIES.includes(category) ? "grid-cols-1" : "grid-cols-2"}`}>
        <Field label="Estado">
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input">
            <option value="nuevo">Nuevo</option>
            <option value="usado">Usado</option>
          </select>
        </Field>
        {!NO_STOCK_CATEGORIES.includes(category) && (
          <Field label="Stock disponible">
            <input
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              className="input"
              required
            />
          </Field>
        )}
      </div>

      {!NO_SHIPPING_CATEGORIES.includes(category) && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field label="¿Hace envíos?">
              <select value={shipping ? "true" : "false"} onChange={(e) => setShipping(e.target.value === "true")} className="input">
                <option value="true">Sí, hace envíos</option>
                <option value="false">No, solo retiro en el local</option>
              </select>
            </Field>
            {shipping && (
              <Field label="Envío gratis">
                <select
                  value={freeShippingMode}
                  onChange={(e) => setFreeShippingMode(e.target.value)}
                  className="input"
                >
                  <option value="none">No ofrece envío gratis</option>
                  <option value="always">Siempre gratis</option>
                  <option value="threshold">Gratis a partir de un monto</option>
                </select>
              </Field>
            )}
          </div>

          {shipping && freeShippingMode === "threshold" && (
            <Field label="Envío gratis en compras desde (ARS)">
              <input
                type="number"
                min="0"
                value={freeShippingAmount}
                onChange={(e) => setFreeShippingAmount(e.target.value)}
                placeholder="10000"
                className="input"
                required
              />
            </Field>
          )}

          {shipping && freeShippingMode !== "none" && (
            <p className="text-xs text-steel">
              Aclaración: el envío gratis aplica dentro de un radio de 4&nbsp;km. Si el pedido es para otra ciudad, el envío
              puede tener un costo adicional a coordinar con el comprador.
            </p>
          )}
        </>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Días de atención (opcional)">
          <input
            value={scheduleDays}
            onChange={(e) => setScheduleDays(e.target.value)}
            placeholder="Lunes a viernes"
            className="input"
          />
        </Field>
        <Field label={showSecondSchedule ? "Horario mañana (opcional)" : "Horario (opcional)"}>
          <input
            value={scheduleHours}
            onChange={(e) => setScheduleHours(e.target.value)}
            placeholder="9 a 13hs"
            className="input"
          />
        </Field>
      </div>

      {showSecondSchedule ? (
        <Field label="Horario tarde (opcional)">
          <div className="flex gap-2">
            <input
              value={scheduleHours2}
              onChange={(e) => setScheduleHours2(e.target.value)}
              placeholder="16 a 20hs"
              className="input"
            />
            <button
              type="button"
              onClick={() => {
                setShowSecondSchedule(false);
                setScheduleHours2("");
              }}
              className="shrink-0 rounded-md border border-line px-2 text-ink-soft hover:border-steel hover:text-danger"
            >
              <X size={14} />
            </button>
          </div>
        </Field>
      ) : (
        <button
          type="button"
          onClick={() => setShowSecondSchedule(true)}
          className="flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
        >
          <Plus size={14} />
          Agregar otro horario (ej. mañana y tarde)
        </button>
      )}

      <Field label={`Fotos (hasta ${MAX_IMAGES})`}>
        <input type="file" accept="image/*" multiple onChange={handleFiles} disabled={uploading || images.length >= MAX_IMAGES} />
        {uploading && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-steel">
            <Loader2 size={12} className="animate-spin" /> Subiendo…
          </p>
        )}
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative h-16 w-16">
                <Image src={url} alt="" fill className="rounded border border-line object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-white hover:brightness-95"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Field>

      <Field label="Video (opcional, hasta 50MB)">
        <input type="file" accept="video/*" onChange={handleVideoFile} disabled={uploadingVideo} />
        {uploadingVideo && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-steel">
            <Loader2 size={12} className="animate-spin" /> Subiendo…
          </p>
        )}
        {videoUrl && !uploadingVideo && (
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-soft">
            <Film size={16} />
            <span>Video cargado</span>
            <button type="button" onClick={removeVideo} className="text-danger hover:underline">
              Quitar
            </button>
          </div>
        )}
      </Field>

      <Field label="Descripción breve">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="input resize-y"
          placeholder="Motivo por el que un cliente lo elegiría"
        />
      </Field>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:brightness-110 disabled:opacity-60"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {isEdit ? "Guardar cambios" : "Agregar producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push(redirectTo)}
          className="rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-steel"
        >
          Cancelar
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto flex items-center gap-2 rounded-md border border-line px-5 py-2.5 text-sm font-semibold text-danger hover:border-danger disabled:opacity-60"
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Borrar producto
          </button>
        )}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid var(--line);
          background: var(--panel);
          color: var(--ink);
          padding: 0.55rem 0.65rem;
          font-size: 0.9rem;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-steel">{label}</label>
      {children}
    </div>
  );
}

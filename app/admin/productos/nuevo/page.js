import ProductForm from "@/components/ProductForm";

export default function NuevoProductoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Nuevo producto</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useState, useEffect } from 'react';
import { ListHeader } from '@/components/ListHeader';

import { productsService, Product, CreateProductDTO } from '@/services/products';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);

    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState<CreateProductDTO>({
        sku: '',
        name: '',
        price: 0,
        description: '',
        category: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await productsService.getAll();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productsService.create(formData);
            setShowForm(false);
            setFormData({ sku: '', name: '', price: 0, description: '', category: '' });
            fetchProducts();
        } catch (error) {
            console.error('Failed to create product', error);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <ListHeader
                title="PRODUCTOS"
                onAdd={() => setShowForm(!showForm)}
                addButtonLabel="AGREGAR ELEMENTO"
                viewName="Todo"
                count={products.length}
                unitLabel="elementos"
            />

            <div className="px-4">
                {showForm && (
                    <Card className="mb-4 animate-in slide-in-from-top-4">
                        <h3 className="text-lg font-bold mb-4">Nuevo Producto</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                            <Input
                                label="SKU"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                            />
                            <Input
                                label="Nombre"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <Input
                                label="Precio"
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            />
                            <Input
                                label="Descripción"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                            <Input
                                label="Categoría"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            />
                            <div className="col-span-2 flex justify-end mt-4">
                                <Button type="submit">Guardar</Button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Empty State */}
                {products.length === 0 && !showForm && (
                    <div className="bg-white rounded border border-gray-200 min-h-[400px]">
                        {/* Table Header */}
                        <div className="flex border-b border-gray-200 bg-white text-xs text-gray-400 font-bold uppercase">
                            <div className="p-3 w-10 border-r border-gray-100"><input type="checkbox" disabled /></div>
                            <div className="p-3 w-24 border-r border-gray-100">SKU</div>
                            <div className="p-3 flex-1 border-r border-gray-100">Nombre</div>
                            <div className="p-3 flex-1 border-r border-gray-100">Descripción</div>
                            <div className="p-3 w-24 border-r border-gray-100">Precio, C$</div>
                            <div className="p-3 w-24 border-r border-gray-100">Grupo</div>
                            <div className="p-3 w-16 border-r border-gray-100">Unit</div>
                            <div className="p-3 w-24 border-r border-gray-100">Oferta Especial</div>
                            <div className="p-3 w-24 border-r border-gray-100">Precio Mayor</div>
                            <div className="p-3 w-24">Imagen</div>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {products.length === 0 ? (
                                <div className="p-4">
                                    <p className="text-red-400 text-sm">Lamentablemente, no hay elementos con estos parámetros.</p>
                                </div>
                            ) : (
                                products.map((product) => (
                                    <div key={product.id} className="flex hover:bg-gray-50/50 transition-colors text-sm items-center">
                                        <div className="p-3 w-10 border-r border-gray-100"><input type="checkbox" /></div>
                                        <div className="p-3 w-24 border-r border-gray-100 font-medium text-blue-600">{product.sku}</div>
                                        <div className="p-3 flex-1 border-r border-gray-100 font-medium">{product.name}</div>
                                        <div className="p-3 flex-1 border-r border-gray-100 text-gray-500 truncate">{product.description}</div>
                                        <div className="p-3 w-24 border-r border-gray-100">
                                            {product.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price) : '-'}
                                        </div>
                                        <div className="p-3 w-24 border-r border-gray-100 text-gray-500">{product.category || '-'}</div>
                                        <div className="p-3 w-16 border-r border-gray-100 text-gray-500">{product.unit || 'unit'}</div>
                                        <div className="p-3 w-24 border-r border-gray-100 text-gray-500">-</div>
                                        <div className="p-3 w-24 border-r border-gray-100 text-gray-500">-</div>
                                        <div className="p-3 w-24"><div className="w-8 h-8 bg-gray-100 rounded"></div></div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

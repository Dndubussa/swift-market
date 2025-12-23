import { useState } from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

export default function ProductInventoryTable({ products, onBulkAction }) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      setSelectedProducts(products?.map(p => p?.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev?.includes(productId)) {
        return prev?.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedProducts = [...products]?.sort((a, b) => {
    const aValue = a?.[sortConfig?.key];
    const bValue = b?.[sortConfig?.key];
    
    if (sortConfig?.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'text-error bg-error/10' };
    if (stock < 10) return { label: 'Low Stock', color: 'text-warning bg-warning/10' };
    return { label: 'In Stock', color: 'text-success bg-success/10' };
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
      {/* Header with Bulk Actions */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-heading font-semibold text-foreground">Product Inventory</h3>
            {selectedProducts?.length > 0 && (
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {selectedProducts?.length} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedProducts?.length > 0 && (
              <>
                <button
                  onClick={() => onBulkAction('edit', selectedProducts)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <Icon name="PencilIcon" size={16} />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => onBulkAction('delete', selectedProducts)}
                  className="px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors duration-200 flex items-center gap-2 text-sm"
                >
                  <Icon name="TrashIcon" size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}
            <Link
              href="/vendor-store-management/add-product"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 flex items-center gap-2 text-sm shadow-card"
            >
              <Icon name="PlusIcon" size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts?.length === products?.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Product</th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-primary"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-2">
                  Price
                  <Icon name="ChevronUpDownIcon" size={16} />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-primary"
                onClick={() => handleSort('stock')}
              >
                <div className="flex items-center gap-2">
                  Stock
                  <Icon name="ChevronUpDownIcon" size={16} />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Category</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedProducts?.map((product) => {
              const stockStatus = getStockStatus(product?.stock);
              return (
                <tr key={product?.id} className="hover:bg-muted/30 transition-colors duration-200">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts?.includes(product?.id)}
                      onChange={() => handleSelectProduct(product?.id)}
                      className="w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <AppImage
                          src={product?.image}
                          alt={product?.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{product?.name}</p>
                        <p className="text-xs text-muted-foreground">SKU: {product?.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground font-medium">{product?.price}</td>
                  <td className="px-4 py-3 text-foreground">{product?.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus?.color}`}>
                      {stockStatus?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">{product?.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/vendor-store-management/edit-product/${product?.id}`}
                        className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                        aria-label="Edit product"
                      >
                        <Icon name="PencilIcon" size={18} className="text-muted-foreground" />
                      </Link>
                      <button
                        onClick={() => onBulkAction('delete', [product?.id])}
                        className="p-2 hover:bg-error/10 rounded-lg transition-colors duration-200"
                        aria-label="Delete product"
                      >
                        <Icon name="TrashIcon" size={18} className="text-error" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-border">
        {sortedProducts?.map((product) => {
          const stockStatus = getStockStatus(product?.stock);
          return (
            <div key={product?.id} className="p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedProducts?.includes(product?.id)}
                  onChange={() => handleSelectProduct(product?.id)}
                  className="mt-1 w-4 h-4 rounded border-input focus:ring-2 focus:ring-ring"
                />
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <AppImage
                    src={product?.image}
                    alt={product?.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground mb-1">{product?.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">SKU: {product?.sku}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-foreground">{product?.price}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus?.color}`}>
                      {stockStatus?.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{product?.category}</span>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/vendor-store-management/edit-product/${product?.id}`}
                        className="p-2 hover:bg-muted rounded-lg transition-colors duration-200"
                      >
                        <Icon name="PencilIcon" size={16} className="text-muted-foreground" />
                      </Link>
                      <button
                        onClick={() => onBulkAction('delete', [product?.id])}
                        className="p-2 hover:bg-error/10 rounded-lg transition-colors duration-200"
                      >
                        <Icon name="TrashIcon" size={16} className="text-error" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

ProductInventoryTable.propTypes = {
  products: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      name: PropTypes?.string?.isRequired,
      sku: PropTypes?.string?.isRequired,
      price: PropTypes?.string?.isRequired,
      stock: PropTypes?.number?.isRequired,
      category: PropTypes?.string?.isRequired,
      image: PropTypes?.string?.isRequired,
      alt: PropTypes?.string?.isRequired
    })
  )?.isRequired,
  onBulkAction: PropTypes?.func?.isRequired
};
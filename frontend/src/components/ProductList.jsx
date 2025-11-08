import React, { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: ''
  });

  // debouncedFilters updates 300ms after user stops typing
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedFilters(filters), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters]);

  // track current in-flight fetch to cancel if needed
  const controllerRef = useRef(null);

  const fetchProducts = useCallback(async (options = {}) => {
    // options.skipLoading prevents toggling loading when we want a quiet refresh
    const { skipLoading } = options;
    try {
      // cancel previous
      if (controllerRef.current) controllerRef.current.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      if (!skipLoading) setLoading(true);
      setError(null);

      const params = {};
      if (debouncedFilters.search) params.search = debouncedFilters.search;
      if (debouncedFilters.category) params.category = debouncedFilters.category;
      if (debouncedFilters.minPrice) params.minPrice = debouncedFilters.minPrice;
      if (debouncedFilters.maxPrice) params.maxPrice = debouncedFilters.maxPrice;

      const res = await API.get('/products', { params, signal: controller.signal });

      // Only update if not aborted
      setProducts(res.data || []);
    } catch (err) {
      // axios cancellation/abort shows ERR_CANCELED
      if (err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError') {
        // ignore
        return;
      }
      setError(err.response?.data?.message || err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  }, [debouncedFilters]);

  // Product creation (quick prompt) state
  // We'll expose a small Quick Add prompt instead of the full inline create form so it
  // doesn't always display on dashboards. The prompt only asks for a name; other
  // fields use sensible defaults. If you want full fields later we can expand it.
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickError, setQuickError] = useState(null);
  const [quickPrice, setQuickPrice] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickStock, setQuickStock] = useState('');
  const [creating, setCreating] = useState(false);

  const handleQuickCreate = async (e) => {
    e?.preventDefault();
    setQuickError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setQuickError('You must be logged in to create products');
      return;
    }

    if (!quickName || !quickName.trim()) {
      setQuickError('Please enter a product name');
      return;
    }

    // validate price
    const priceNum = Number(quickPrice);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setQuickError('Price must be a number >= 0');
      return;
    }

    // validate stock
    const stockNum = Number(quickStock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setQuickError('Stock must be an integer >= 0');
      return;
    }

    try {
      setCreating(true);
      // Minimal payload: name only; use defaults for other fields so quick action is lightweight
      const payload = {
        name: quickName.trim(),
        price: priceNum,
        category: quickCategory?.trim() || 'General',
        stock: stockNum
      };
      await API.post('/products', payload);
      // refresh quietly
      fetchProducts({ skipLoading: true });
    setQuickName('');
    setQuickPrice('');
    setQuickCategory('General');
    setQuickStock('');
      setQuickOpen(false);
    } catch (err) {
      setQuickError(err.response?.data?.message || err.message || 'Failed to create product');
    } finally {
      setCreating(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // fetch on mount and whenever debouncedFilters change
  useEffect(() => {
    fetchProducts();
    // cleanup: abort on unmount
    return () => {
      if (controllerRef.current) controllerRef.current.abort();
    };
  }, [fetchProducts]);

  // Memoized product card to avoid re-rendering the whole list on unrelated state changes
  const ProductCard = React.memo(({ product }) => (
    <div className="product-card">
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} />}
      <h3>{product.name}</h3>
      <p>Price: ${product.price}</p>
      <p>Category: {product.category}</p>
      <p>Stock: {product.stock}</p>
    </div>
  ));

  return (
    <div className="product-list">
      {/* Quick Add prompt (only visible when logged in). Replaces the previous inline create form so it won't display on dashboards. */}
      {localStorage.getItem('token') && (
        <div style={{ marginBottom: '1rem' }}>
          <button className="primary" onClick={() => setQuickOpen(true)}>Quick Add Product</button>

          {quickOpen && (
            <>
              {/* backdrop */}
              <div
                onClick={() => { setQuickOpen(false); setQuickName(''); setQuickPrice(''); setQuickCategory('General'); setQuickStock(''); setQuickError(null); }}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 999 }}
              />

              <div className="form-card" style={{ position: 'fixed', left: '50%', top: '25%', transform: 'translateX(-50%)', zIndex: 1000, minWidth: 320 }}>
                <h3 style={{ marginTop: 0 }}>Quick Add Product</h3>
                {quickError && <div className="error">{quickError}</div>}
                <form onSubmit={handleQuickCreate}>
                  <div className="field">
                    <input className="input" placeholder="Product name" value={quickName} onChange={(e) => setQuickName(e.target.value)} />
                  </div>
                  <div className="field" style={{ display: 'flex', gap: '.5rem' }}>
                    <input className="input" type="number" min="0" step="0.01" placeholder="Price" value={quickPrice} onChange={(e) => setQuickPrice(e.target.value)} />
                    <input className="input" type="number" min="0" step="1" placeholder="Stock" value={quickStock} onChange={(e) => setQuickStock(e.target.value)} />
                  </div>
                  <div className="field">
                    <input className="input" placeholder="Category" value={quickCategory} onChange={(e) => setQuickCategory(e.target.value)} />
                  </div>
                  <div className="actions" style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                    <button type="button" className="ghost" onClick={() => { setQuickOpen(false); setQuickName(''); setQuickPrice(''); setQuickCategory('General'); setQuickStock(''); setQuickError(null); }} disabled={creating}>Cancel</button>
                    <button type="submit" className="primary" disabled={creating}>{creating ? 'Creating...' : 'Create'}</button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      )}
      <div className="filters" style={{ marginBottom: '1rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        <input
          className="input"
          type="text"
          name="search"
          placeholder="Search products..."
          value={filters.search}
          onChange={handleFilterChange}
        />
        <input
          className="input"
          type="text"
          name="category"
          placeholder="Category"
          value={filters.category}
          onChange={handleFilterChange}
        />
        <input
          className="input"
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <input
          className="input"
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
        {loading && <div style={{ color: '#666' }}>Loading...</div>}
        {error && <div className="error">Error: {error}</div>}
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  Package, 
  ShoppingBag, 
  Mail, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  RefreshCw, 
  Edit2, 
  Save, 
  X, 
  Plus, 
  Trash2 
} from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser } = useShop();
  const [activeTab, setActiveTab] = useState('catalog');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick edit stock state
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [editStockVal, setEditStockVal] = useState('');

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    gender: 'Men',
    price: '',
    image_url: '',
    description: '',
    materials: 'Breathable engineered mesh upper and responsive cushioning',
    sizes: [
      { size_value: '8', stock_quantity: 10, color_name: 'Standard' },
      { size_value: '9', stock_quantity: 15, color_name: 'Standard' },
      { size_value: '10', stock_quantity: 12, color_name: 'Standard' },
    ]
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, ordRes, inqRes, custRes, brandRes, categoryRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/admin/catalog'),
        fetch('http://127.0.0.1:8000/api/admin/orders'),
        fetch('http://127.0.0.1:8000/api/admin/inquiries'),
        fetch('http://127.0.0.1:8000/api/admin/customers'),
        fetch('http://127.0.0.1:8000/api/brands'),
        fetch('http://127.0.0.1:8000/api/categories'),
      ]);

      const catData = await catRes.json();
      const ordData = await ordRes.json();
      const inqData = await inqRes.json();
      const custData = await custRes.json();
      const brandData = await brandRes.json();
      const categoryData = await categoryRes.json();

      setProducts(Array.isArray(catData) ? catData : (catData.data || []));
      setOrders(Array.isArray(ordData) ? ordData : (ordData.data || []));
      setInquiries(Array.isArray(inqData) ? inqData : (inqData.data || []));
      setCustomers(Array.isArray(custData) ? custData : (custData.data || []));
      
      const bList = Array.isArray(brandData) ? brandData : [];
      const cList = Array.isArray(categoryData) ? categoryData : [];
      setBrands(bList);
      setCategories(cList);

      if (bList.length > 0 && !newProduct.brand_id) {
        setNewProduct(prev => ({ ...prev, brand_id: bList[0].id }));
      }
      if (cList.length > 0 && !newProduct.category_id) {
        setNewProduct(prev => ({ ...prev, category_id: cList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load admin records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStock = async (variantId) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ variant_id: variantId, new_stock: Number(editStockVal) })
      });
      if (res.ok) {
        setEditingVariantId(null);
        loadData();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Add Variant size row
  const handleAddSizeVariant = () => {
    setNewProduct(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size_value: '11', stock_quantity: 10, color_name: 'Standard' }]
    }));
  };

  // Remove Variant size row
  const handleRemoveSizeVariant = (index) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== index)
    }));
  };

  // Handle Add Product Submit
  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    setSubmittingProduct(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          brand_id: Number(newProduct.brand_id || (brands[0]?.id ?? 1)),
          category_id: Number(newProduct.category_id || (categories[0]?.id ?? 1)),
          gender: newProduct.gender,
          price: parseFloat(newProduct.price),
          image_url: newProduct.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
          description: newProduct.description,
          materials: newProduct.materials,
          sizes: newProduct.sizes.map(s => ({
            size_value: String(s.size_value),
            stock_quantity: parseInt(s.stock_quantity, 10),
            color_name: s.color_name || 'Standard'
          }))
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewProduct({
          name: '',
          brand_id: brands[0]?.id || '',
          category_id: categories[0]?.id || '',
          gender: 'Men',
          price: '',
          image_url: '',
          description: '',
          materials: 'Breathable engineered mesh upper and responsive cushioning',
          sizes: [
            { size_value: '8', stock_quantity: 10, color_name: 'Standard' },
            { size_value: '9', stock_quantity: 15, color_name: 'Standard' },
          ]
        });
        loadData();
      } else {
        const errData = await res.json();
        alert(`Failed to add product: ${errData.message || 'Please check form fields'}`);
      }
    } catch (err) {
      console.error('Error creating shoe:', err);
      alert('Network error while adding shoe model.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const totalRevenue = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
  const lowStockCount = products.filter(p => (p.total_stock || 0) <= 5).length;

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e11d48', letterSpacing: '1px' }}>CONTROL PANEL</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: '2px 0' }}>Admin Store Management</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Welcome back, {currentUser?.name || 'Administrator'}</p>
        </div>

        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0f172a', color: '#fff', border: 'none', padding: '0.65rem 1.25rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <Plus size={16} /> Add New Shoe Model
          </button>

          <button
            onClick={loadData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.65rem 1rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <RefreshCw size={15} /> Refresh Data
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.2rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.4rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
            <span>TOTAL REVENUE</span>
            <DollarSign size={20} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>
            ${totalRevenue.toFixed(2)}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.4rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
            <span>TOTAL ORDERS</span>
            <ShoppingBag size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>
            {orders.length}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.4rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
            <span>ACTIVE CATALOG</span>
            <Package size={20} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>
            {products.length} Models
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.4rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 700 }}>
            <span>LOW STOCK ALERTS</span>
            <AlertTriangle size={20} color="#f59e0b" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginTop: '0.5rem' }}>
            {lowStockCount} Items
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #f1f5f9', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'catalog', label: `Catalog & Stock (${products.length})`, icon: Package },
          { id: 'orders', label: `Customer Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'inquiries', label: `Contact Inquiries (${inquiries.length})`, icon: Mail },
          { id: 'customers', label: `Registered Customers (${customers.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem 1.25rem',
                border: 'none',
                borderBottom: isActive ? '3px solid #0f172a' : '3px solid transparent',
                background: 'transparent',
                color: isActive ? '#0f172a' : '#64748b',
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>Loading store data from database...</div>
      ) : (
        <>
          {/* TAB 1: CATALOG */}
          {activeTab === 'catalog' && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                      <th style={{ padding: '1rem' }}>SHOE MODEL</th>
                      <th style={{ padding: '1rem' }}>BRAND & CATEGORY</th>
                      <th style={{ padding: '1rem' }}>PRICE</th>
                      <th style={{ padding: '1rem' }}>TOTAL UNITS</th>
                      <th style={{ padding: '1rem' }}>VARIANTS & SIZES</th>
                      <th style={{ padding: '1rem' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => {
                      const img = (Array.isArray(p.images) && p.images.length > 0)
                        ? (p.images[0].startsWith('http') ? p.images[0] : `/products/${p.images[0]}`)
                        : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200';

                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={img}
                              alt={p.name}
                              style={{ width: '48px', height: '48px', objectFit: 'contain', background: '#f8fafc', borderRadius: '6px', padding: '4px' }}
                              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200'; }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, color: '#0f172a' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SKU: SHOE-{String(p.id).padStart(3, '0')}</div>
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#334155' }}>{p.brand_name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.category_name} • {p.gender}</div>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a' }}>
                            ${Number(p.price).toFixed(2)}
                          </td>
                          <td style={{ padding: '1rem', fontWeight: 800 }}>
                            <span style={{ color: (p.total_stock || 0) <= 5 ? '#e11d48' : '#10b981' }}>
                              {p.total_stock || 0} pairs
                            </span>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {p.variants?.map((v) => (
                                <div
                                  key={v.id}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  <strong>US {v.size_value}:</strong>
                                  {editingVariantId === v.id ? (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                                      <input
                                        type="number"
                                        value={editStockVal}
                                        onChange={(e) => setEditStockVal(e.target.value)}
                                        style={{ width: '45px', padding: '2px', fontSize: '0.75rem' }}
                                      />
                                      <button onClick={() => handleUpdateStock(v.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#10b981' }}><Save size={12} /></button>
                                      <button onClick={() => setEditingVariantId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={12} /></button>
                                    </div>
                                  ) : (
                                    <span
                                      onClick={() => {
                                        setEditingVariantId(v.id);
                                        setEditStockVal(v.stock_quantity);
                                      }}
                                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                                      title="Click to edit stock"
                                    >
                                      {v.stock_quantity} <Edit2 size={10} color="#94a3b8" />
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span
                              style={{
                                background: (p.total_stock || 0) > 0 ? '#dcfce7' : '#fee2e2',
                                color: (p.total_stock || 0) > 0 ? '#15803d' : '#b91c1c',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px'
                              }}
                            >
                              {(p.total_stock || 0) > 0 ? 'ACTIVE' : 'OUT OF STOCK'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {orders.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No customer orders recorded in the system yet.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                      <th style={{ padding: '1rem' }}>ORDER #</th>
                      <th style={{ padding: '1rem' }}>CUSTOMER</th>
                      <th style={{ padding: '1rem' }}>AMOUNT</th>
                      <th style={{ padding: '1rem' }}>PAYMENT</th>
                      <th style={{ padding: '1rem' }}>STATUS</th>
                      <th style={{ padding: '1rem' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem', fontWeight: 800, color: '#0f172a' }}>{o.order_number}</td>
                        <td style={{ padding: '1rem' }}>
                          <div>{o.customer_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{o.customer_phone || o.customer_email}</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 800 }}>${Number(o.total_amount).toFixed(2)}</td>
                        <td style={{ padding: '1rem' }}>{o.payment_method?.toUpperCase()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800, background: o.status === 'delivered' ? '#dcfce7' : '#fef3c7', color: o.status === 'delivered' ? '#15803d' : '#b45309' }}>
                            {o.status?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 600 }}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: CONTACT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {inquiries.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                  No customer messages submitted via Contact Us yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {inquiries.map((inq) => (
                    <div key={inq.id} style={{ padding: '1.2rem', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{inq.name}</strong>
                          <span style={{ color: '#64748b', fontSize: '0.85rem', marginLeft: '8px' }}>({inq.email})</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{inq.created_at}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#334155', background: '#f8fafc', padding: '0.8rem', borderRadius: '8px' }}>
                        {inq.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: REGISTERED CUSTOMERS */}
          {activeTab === 'customers' && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 800 }}>
                    <th style={{ padding: '1rem' }}>CUSTOMER NAME</th>
                    <th style={{ padding: '1rem' }}>EMAIL ADDRESS</th>
                    <th style={{ padding: '1rem' }}>ROLE</th>
                    <th style={{ padding: '1rem' }}>JOINED DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a' }}>{c.name}</td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{c.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {c.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#94a3b8' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MODAL: ADD NEW SHOE MODEL */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px', padding: '2rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Add New Footwear Model</h2>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.85rem' }}>Create product details and assign stock variants.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Shoe Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nike Air Max Pegasus 40"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Brand *</label>
                  <select
                    value={newProduct.brand_id}
                    onChange={(e) => setNewProduct({ ...newProduct, brand_id: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Category *</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Target Gender *</label>
                  <select
                    value={newProduct.gender}
                    onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Retail Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="129.99"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Primary Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Product Description</label>
                <textarea
                  rows="2"
                  placeholder="High performance athletic running shoe with responsive foam sole..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.85rem' }}
                />
              </div>

              {/* Sizes & Stock Variants */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Size Variants & Stock Units</span>
                  <button
                    type="button"
                    onClick={handleAddSizeVariant}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#fff', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    <Plus size={12} /> Add Size
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {newProduct.sizes.map((sz, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', width: '30px' }}>US</span>
                      <input
                        type="text"
                        placeholder="Size (e.g. 9)"
                        value={sz.size_value}
                        onChange={(e) => {
                          const updated = [...newProduct.sizes];
                          updated[idx].size_value = e.target.value;
                          setNewProduct({ ...newProduct, sizes: updated });
                        }}
                        style={{ width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={sz.stock_quantity}
                        onChange={(e) => {
                          const updated = [...newProduct.sizes];
                          updated[idx].stock_quantity = e.target.value;
                          setNewProduct({ ...newProduct, sizes: updated });
                        }}
                        style={{ width: '100px', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                      {newProduct.sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSizeVariant(idx)}
                          style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.65rem 1.2rem', borderRadius: '8px', border: '1px solid #d1d5db', background: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  style={{ padding: '0.65rem 1.4rem', borderRadius: '8px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: submittingProduct ? 'not-allowed' : 'pointer' }}
                >
                  {submittingProduct ? 'Saving Product...' : 'Save Product to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
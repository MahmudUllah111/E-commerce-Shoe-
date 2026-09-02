import React, { useState, useEffect } from 'react';
import { 
  getAdminCatalog, 
  updateVariantStock, 
  createNewProduct, 
  getBrands, 
  getCategories, 
  getAdminOrders, 
  updateOrderStatus 
} from '../services/api';
import { Plus, Package, Mail, CheckCircle2, Send, X, Image as ImageIcon } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [catalog, setCatalog] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Pop-up for notifying customers
  const [alertPopup, setAlertPopup] = useState(null);
  const [quickNotice, setQuickNotice] = useState(null);

  // Form states for adding new shoe
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newShoe, setNewShoe] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    gender: 'Men',
    price: '',
    description: '',
    materials: 'Breathable mesh upper, rubber outsole',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    sizes: [
      { size_value: '7', color_name: 'Standard', stock_quantity: 10 },
      { size_value: '8', color_name: 'Standard', stock_quantity: 10 },
      { size_value: '8.5', color_name: 'Standard', stock_quantity: 10 },
      { size_value: '9', color_name: 'Standard', stock_quantity: 10 },
      { size_value: '9.5', color_name: 'Standard', stock_quantity: 10 },
      { size_value: '10', color_name: 'Standard', stock_quantity: 10 },
      { size_value: '10.5', color_name: 'Standard', stock_quantity: 10 },
      { size_value: '11', color_name: 'Standard', stock_quantity: 10 },
    ],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, bList, cList, orderList] = await Promise.all([
        getAdminCatalog(),
        getBrands(),
        getCategories(),
        getAdminOrders(),
      ]);
      setCatalog(items);
      setBrands(bList);
      setCategories(cList);
      setOrders(orderList);
      if (bList[0]) setNewShoe((prev) => ({ ...prev, brand_id: bList[0].id }));
      if (cList[0]) setNewShoe((prev) => ({ ...prev, category_id: cList[0].id }));
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStockSave = async (variantId, currentSize) => {
    const qty = parseInt(stockInputs[variantId]);
    if (isNaN(qty) || qty < 0) return alert('Enter a valid stock number');

    try {
      const res = await updateVariantStock(variantId, qty);
      
      // If customers were waiting for this shoe size, trigger the pop-up
      if (res.notified_customers && res.notified_customers.length > 0) {
        setAlertPopup({
          shoe_name: res.notified_customers[0].shoe_name,
          size: res.notified_customers[0].size,
          customers: res.notified_customers,
        });
      } else {
        // Quiet confirmation banner
        setQuickNotice(`Size US ${currentSize} stock updated to ${qty} units.`);
        setTimeout(() => setQuickNotice(null), 4000);
      }

      loadData();
    } catch (err) {
      alert('Error updating inventory');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setQuickNotice(`Order status changed to "${newStatus}"`);
      setTimeout(() => setQuickNotice(null), 4000);
      loadData();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const handleSizeStockChange = (index, value) => {
    const updated = [...newShoe.sizes];
    updated[index].stock_quantity = parseInt(value) || 0;
    setNewShoe({ ...newShoe, sizes: updated });
  };

  const handleCreateShoe = async (e) => {
    e.preventDefault();
    try {
      await createNewProduct(newShoe);
      setShowAddModal(false);
      setQuickNotice('New shoe published to store catalog successfully!');
      setTimeout(() => setQuickNotice(null), 5000);
      loadData();
    } catch (err) {
      alert('Failed to create shoe product');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1240px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Admin Store Management</h1>
          <p style={{ color: '#6b7280' }}>Manage footwear inventory, picture assets, and customer order fulfillment.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.4rem',
            borderRadius: '8px',
            background: '#111827',
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Add New Shoe Model
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '0.8rem 1.5rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'inventory' ? '3px solid #111827' : '3px solid transparent',
            color: activeTab === 'inventory' ? '#111827' : '#6b7280',
          }}
        >
          Inventory & Stock Management ({catalog.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.8rem 1.5rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'orders' ? '3px solid #111827' : '3px solid transparent',
            color: activeTab === 'orders' ? '#111827' : '#6b7280',
          }}
        >
          Customer Orders ({orders.length})
        </button>
      </div>

      {/* Quiet Status Notification */}
      {quickNotice && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '0.85rem 1.2rem', borderRadius: '10px', marginBottom: '1.8rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <CheckCircle2 size={18} />
          <span>{quickNotice}</span>
        </div>
      )}

      {/* Pop-Up Modal: Customer Back-in-Stock Alert */}
      {alertPopup && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '480px', width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '50px', height: '50px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Send size={26} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem' }}>
              Customer Alert Sent!
            </h2>
            <p style={{ color: '#4b5563', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              A customer previously subscribed for <strong>{alertPopup.shoe_name}</strong> (Size US {alertPopup.size}). Now that it is restocked, a genuine back-in-stock email has been sent!
            </p>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Notified Recipient:</span>
              {alertPopup.customers.map((c, i) => (
                <div key={i} style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                  • {c.email}
                </div>
              ))}
            </div>

            <button
              onClick={() => setAlertPopup(null)}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>Loading store data...</div>
      ) : activeTab === 'inventory' ? (
        /* Inventory Catalog View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {catalog.map((shoe) => (
            <div key={shoe.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.8rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img
                    src={shoe.images?.[0]?.startsWith('http') ? shoe.images[0] : `/products/${shoe.images?.[0] || '1.jpg'}`}
                    alt={shoe.name}
                    style={{ width: '65px', height: '65px', objectFit: 'contain', background: '#f8f9fa', borderRadius: '8px' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }}
                  />
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      {shoe.brand_name} • {shoe.category_name} ({shoe.gender})
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{shoe.name}</h2>
                    <span style={{ fontWeight: 800, color: '#111827' }}>${Number(shoe.price).toFixed(2)}</span>
                  </div>
                </div>

                {shoe.pending_notifications > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={16} /> {shoe.pending_notifications} customer(s) waiting for restock
                  </div>
                )}
              </div>

              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#374151', marginBottom: '0.8rem' }}>Inventory by Size:</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {shoe.variants?.map((v) => {
                  const isOutOfStock = v.stock_quantity === 0;

                  return (
                    <div
                      key={v.id}
                      style={{
                        border: isOutOfStock ? '1px solid #fca5a5' : '1px solid #e5e7eb',
                        borderRadius: '10px',
                        padding: '1rem',
                        background: isOutOfStock ? '#fff5f5' : '#f9fafb',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                        <span>Size: US {v.size_value}</span>
                        <span style={{ color: isOutOfStock ? '#dc2626' : '#16a34a' }}>
                          {isOutOfStock ? '0 (Out of Stock)' : `${v.stock_quantity} in stock`}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                        <input
                          type="number"
                          min="0"
                          placeholder={v.stock_quantity.toString()}
                          value={stockInputs[v.id] !== undefined ? stockInputs[v.id] : ''}
                          onChange={(e) => setStockInputs({ ...stockInputs, [v.id]: e.target.value })}
                          style={{
                            width: '80px',
                            padding: '0.4rem 0.6rem',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                          }}
                        />
                        <button
                          onClick={() => handleStockSave(v.id, v.size_value)}
                          style={{
                            flex: 1,
                            background: '#111827',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Update Stock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Orders View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No customer orders found yet.</div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.8rem', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>ORDER REF</span>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{ord.order_number}</h2>
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{new Date(ord.created_at).toLocaleString()}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Delivery Status:</label>
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        border: '1px solid #d1d5db',
                        background: ord.status === 'delivered' ? '#dcfce7' : ord.status === 'shipped' ? '#e0e7ff' : ord.status === 'cancelled' ? '#fee2e2' : '#fef9c3',
                        color: ord.status === 'delivered' ? '#166534' : ord.status === 'shipped' ? '#3730a3' : ord.status === 'cancelled' ? '#991b1b' : '#854d0e',
                      }}
                    >
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Shipping & Customer Info</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Name:</strong> {ord.customer_name}</p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Email:</strong> {ord.customer_email}</p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Phone:</strong> {ord.customer_phone}</p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Address:</strong> {ord.shipping_address}</p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}><strong>Payment:</strong> {ord.payment_method}</p>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Purchased Items</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {ord.items?.map((item) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: '#f9fafb', padding: '0.6rem', borderRadius: '6px' }}>
                          <span>{item.product_name} (Size: US {item.size}) × {item.quantity}</span>
                          <strong>${(Number(item.unit_price) * item.quantity).toFixed(2)}</strong>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: 'right', marginTop: '0.8rem', fontSize: '1.1rem', fontWeight: 800 }}>
                      Total: ${Number(ord.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Add New Shoe with Picture URL & File Preview */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '2.5rem', borderRadius: '16px', maxWidth: '560px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Add New Footwear</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateShoe} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Shoe Model Name *</label>
                <input required type="text" placeholder="e.g. Nike Air Max Pulse" value={newShoe.name} onChange={(e) => setNewShoe({ ...newShoe, name: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>

              {/* Picture Input & Live Preview */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                  Shoe Picture (Image URL or Filename) *
                </label>
                <input
                  required
                  type="text"
                  placeholder="https://... or 1.jpg"
                  value={newShoe.image_url}
                  onChange={(e) => setNewShoe({ ...newShoe, image_url: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />

                {newShoe.image_url && (
                  <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f9fafb', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <img
                      src={newShoe.image_url.startsWith('http') ? newShoe.image_url : `/products/${newShoe.image_url}`}
                      alt="Preview"
                      style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }}
                    />
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Preview of product card thumbnail</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Brand</label>
                  <select value={newShoe.brand_id} onChange={(e) => setNewShoe({ ...newShoe, brand_id: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Category</label>
                  <select value={newShoe.category_id} onChange={(e) => setNewShoe({ ...newShoe, category_id: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Target Gender</label>
                  <select value={newShoe.gender} onChange={(e) => setNewShoe({ ...newShoe, gender: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Retail Price ($) *</label>
                  <input required type="number" step="0.01" placeholder="129.99" value={newShoe.price} onChange={(e) => setNewShoe({ ...newShoe, price: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Description *</label>
                <textarea required rows="2" placeholder="Shoe features, cushioning, performance details..." value={newShoe.description} onChange={(e) => setNewShoe({ ...newShoe, description: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>

              {/* Initial Size Variants and Stock */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Initial Stock by Size:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {newShoe.sizes.map((sz, idx) => (
                    <div key={sz.size_value} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '0.4rem', textAlign: 'center', background: '#f9fafb' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>US {sz.size_value}</span>
                      <input
                        type="number"
                        min="0"
                        value={sz.stock_quantity}
                        onChange={(e) => handleSizeStockChange(idx, e.target.value)}
                        style={{ width: '100%', textAlign: 'center', border: '1px solid #d1d5db', borderRadius: '4px', padding: '0.2rem', marginTop: '0.2rem', fontSize: '0.85rem' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.8rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Save & Publish Shoe
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.8rem 1.2rem', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
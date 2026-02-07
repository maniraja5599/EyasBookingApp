import React, { useState, useEffect } from 'react';
import { Order, Settings, Customer } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';

interface OrderFormProps {
  order: Order | null;
  settings: Settings;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
  onSave: (order: Order) => void;
  onClose: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ order, settings, customers, setCustomers, orders, onSave, onClose }) => {
  const [step, setStep] = useState(order ? 2 : 1);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState<Partial<Order>>(() => order || {
    customerName: '',
    phone: '',
    address: '', // Site address
    serviceType: 'pre-pleat',
    location: 'shop',
    sareeCount: 1,
    sareeReceivedInAdvance: false,
    sareeReceivedDate: new Date().toISOString().split('T')[0],
    eventDate: '',
    deliveryDate: '',
    collectionDate: '',
    baseAmount: settings.prePleatRate,
    additionalCharges: [],
    totalAmount: settings.prePleatRate,
    payments: [],
    amountPaid: 0,
    status: 'pending',
    notes: '',
  });

  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');

  useEffect(() => {
    calculateTotal();
  }, [formData.sareeCount, formData.serviceType, formData.additionalCharges]);

  // If editing, check if customer exists
  useEffect(() => {
    if (order) {
      const existing = customers.find(c => c.phone === order.phone);
      if (existing) {
        setIsExistingCustomer(true);
        setPermanentAddress(existing.permanentAddress);
      }
    }
  }, [order, customers]);

  const calculateTotal = () => {
    let rate = 0;
    if (formData.serviceType === 'pre-pleat') rate = settings.prePleatRate;
    else if (formData.serviceType === 'drape') rate = settings.drapeRate;
    else if (formData.serviceType === 'both') rate = settings.bothRate;

    const base = (formData.sareeCount || 0) * rate;
    const extra = (formData.additionalCharges || []).reduce((sum, c) => sum + c.amount, 0);
    const total = base + extra;

    setFormData(prev => {
      if (prev.baseAmount !== base || prev.totalAmount !== total) {
        return { ...prev, baseAmount: base, totalAmount: total };
      }
      return prev;
    });
    return total;
  };

  const addCharge = () => {
    if (newChargeName && newChargeAmount) {
      const charges = [...(formData.additionalCharges || []), { name: newChargeName, amount: parseFloat(newChargeAmount) }];
      setFormData(prev => ({ ...prev, additionalCharges: charges, totalAmount: (prev.baseAmount || 0) + charges.reduce((sum, c) => sum + c.amount, 0) }));
      setNewChargeName('');
      setNewChargeAmount('');
    }
  };

  const removeCharge = (index: number) => {
    const charges = (formData.additionalCharges || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, additionalCharges: charges, totalAmount: (prev.baseAmount || 0) + charges.reduce((sum, c) => sum + c.amount, 0) }));
  };

  const handlePhoneCheck = () => {
    console.log('handlePhoneCheck called', formData.phone);
    if (!formData.phone || formData.phone.length < 10) {
      console.log('Phone invalid:', formData.phone);
      alert("Please enter a valid phone number");
      return;
    }

    const existing = customers.find(c => c.phone === formData.phone);
    console.log('Existing customer found:', existing);

    if (existing) {
      setIsExistingCustomer(true);
      setFormData(prev => ({ ...prev, customerName: existing.name }));
      setPermanentAddress(existing.permanentAddress);
    } else {
      setIsExistingCustomer(false);
      setPermanentAddress('');
    }
    setStep(2);
    console.log('Set step to 2');
  };

  const handleSubmit = () => {
    // Only validate name and phone. Address is optional depending on context.
    if (!formData.customerName || !formData.phone) {
      alert('Please fill in customer name and phone');
      return;
    }

    // Save/Update Customer
    const now = new Date().toISOString();
    if (!isExistingCustomer) {
      // New Customer
      const newCustomer: Customer = {
        id: generateId(),
        name: formData.customerName!,
        phone: formData.phone!,
        permanentAddress: permanentAddress, // Save the permanent address entered
        createdAt: now
      };
      setCustomers(prev => [...prev, newCustomer]);
    }

    // Create new order object
    const newOrder = {
      ...formData,
      id: order ? order.id : generateId(),
      createdAt: order ? order.createdAt : now
    };

    onSave(newOrder as Order);
  };

  const handlePickContact = async () => {
    try {
      if (!('contacts' in navigator && 'ContactsManager' in window)) {
        alert('Contact Picker is not supported on this device.');
        return;
      }
      const props = ['name', 'tel'];
      const opts = { multiple: false };
      // @ts-ignore
      const contacts = await navigator.contacts.select(props, opts);
      if (contacts.length) {
        const contact = contacts[0] as any;
        const name = contact.name && contact.name.length ? contact.name[0] : '';
        const phone = contact.tel && contact.tel.length ? contact.tel[0] : '';
        setFormData(prev => ({
          ...prev,
          phone: phone.replace(/\s+/g, ''),
          customerName: name || prev.customerName
        }));
      }
    } catch (ex) { console.error(ex); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#252542',
    border: '1px solid #3a3a5a',
    padding: '12px',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '16px',
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#F5A623',
    fontWeight: 'bold',
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      zIndex: 200,
      overflow: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a2e',
        width: '100%',
        maxWidth: '600px',
        borderRadius: '16px',
        padding: '24px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(255, 215, 0, 0.1)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            background: 'var(--accent-gold)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {order ? '✏️ Edit Order' : '➕ New Order'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-accent)', fontSize: '28px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* STEP 1: PHONE VERIFICATION */}
        {step === 1 && !order && (
          <div className="animate-fadeIn">
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
              <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>Customer Check</h3>
              <p style={{ color: '#aaa' }}>Enter mobile number to check for existing customer history.</p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const cleanVal = val.replace(/\D/g, '').slice(0, 10);
                    console.log('Phone input change:', cleanVal);
                    setFormData(prev => ({ ...prev, phone: cleanVal }));
                  }}
                  placeholder="Enter phone number"
                  style={{ ...inputStyle, marginBottom: 0, fontSize: '20px', letterSpacing: '1px' }}
                  autoFocus
                />
              </div>
              <button
                onClick={handlePickContact}
                style={{
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: 'var(--accent-color)',
                  cursor: 'pointer',
                  height: '50px',
                  width: '50px',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Pick from Contacts"
              >
                📒
              </button>
            </div>

            <button
              onClick={handlePhoneCheck}
              style={{
                width: '100%',
                padding: '16px',
                background: 'var(--gold)',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-glow)'
              }}
            >
              Next ➔
            </button>
          </div>
        )}

        {/* STEP 2: DETAILS */}
        {(step === 2 || order) && (
          <div className="animate-fadeIn">

            {/* Customer Status Banner */}
            {!order && (
              <div style={{
                background: isExistingCustomer ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${isExistingCustomer ? '#10B981' : '#3B82F6'}`,
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <span style={{ fontSize: '18px', marginRight: '8px' }}>{isExistingCustomer ? '👋' : '🆕'}</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>
                    {isExistingCustomer ? 'Existing Customer' : 'New Customer'}
                  </span>
                  <div style={{ fontSize: '13px', color: '#aaa', marginTop: '4px' }}>
                    {formData.phone}
                  </div>
                </div>

                {isExistingCustomer && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    style={{
                      background: 'var(--dark-lighter)',
                      border: '1px solid #555',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    {showHistory ? 'Hide History' : '📜 View History'}
                  </button>
                )}
              </div>
            )}

            {/* History Section */}
            {showHistory && (
              <div style={{
                background: '#111',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '20px',
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #333'
              }}>
                <h4 style={{ color: 'var(--gold)', marginBottom: '8px', fontSize: '14px' }}>Previous Orders</h4>
                {orders.filter(o => o.phone === formData.phone).length === 0 ? (
                  <p style={{ color: '#666', fontSize: '13px' }}>No previous orders found.</p>
                ) : (
                  orders.filter(o => o.phone === formData.phone).map(o => (
                    <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #222', fontSize: '13px', color: '#ccc' }}>
                      <span>{formatDate(o.eventDate)}</span>
                      <span>{o.serviceType}</span>
                      <span style={{ color: 'var(--accent-color)' }}>{formatCurrency(o.totalAmount)}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            <label style={labelStyle}>Customer Name *</label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder="Enter customer name"
              style={inputStyle}
            />

            {/* Permanent Address - Only for NEW customers */}
            {!isExistingCustomer && !order && (
              <div className="animate-fadeIn">
                <label style={labelStyle}>Permanent Address * (First Time Only)</label>
                <textarea
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="Enter home/permanent address..."
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', border: '1px dashed #555' }}
                />
                <small style={{ display: 'block', color: '#666', marginBottom: '16px', marginTop: '-12px' }}>
                  This address will be saved for future bookings.
                </small>
              </div>
            )}

            <label style={labelStyle}>Service Type</label>
            <select
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as any })}
              style={inputStyle}
            >
              <option value="pre-pleat">Pre-Pleat Only</option>
              <option value="drape">Draping Only</option>
              <option value="both">Pre-Pleat + Draping</option>
            </select>

            <label style={labelStyle}>Location</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setFormData({ ...formData, location: 'shop' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: formData.location === 'shop' ? 'var(--gold)' : 'var(--border)',
                  background: formData.location === 'shop' ? 'var(--gold)' : 'transparent',
                  color: formData.location === 'shop' ? 'var(--dark)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
              >
                🏪 At Shop
              </button>
              <button
                onClick={() => setFormData({ ...formData, location: 'onsite' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: formData.location === 'onsite' ? 'var(--gold)' : 'var(--border)',
                  background: formData.location === 'onsite' ? 'var(--gold)' : 'transparent',
                  color: formData.location === 'onsite' ? 'var(--dark)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.2s',
                }}
              >
                📍 On-Site
              </button>
            </div>

            {/* Site Address Logic */}
            {formData.location === 'onsite' && (
              <div className="animate-fadeIn">
                <label style={labelStyle}>Site Address / Draping Location</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {!isExistingCustomer && permanentAddress && (
                    <button
                      onClick={() => setFormData({ ...formData, address: permanentAddress })}
                      style={{ alignSelf: 'flex-start', fontSize: '12px', padding: '4px 8px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ⬇ Copy Permanent Address
                    </button>
                  )}
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Where is the event? (e.g. Mandapam name, Hotel, or Home)"
                    rows={2}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            <label style={labelStyle}>Number of Sarees</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setFormData(prev => ({ ...prev, sareeCount: Math.max(1, (prev.sareeCount || 1) - 1) }))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  background: 'var(--dark-lighter)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'all 0.2s'
                }}
              >
                -
              </button>
              <input
                type="number"
                value={formData.sareeCount}
                onChange={(e) => setFormData({ ...formData, sareeCount: parseInt(e.target.value) || 1 })}
                min="1"
                style={{
                  ...inputStyle,
                  width: '80px',
                  textAlign: 'center',
                  marginBottom: 0,
                  fontSize: '18px',
                  fontWeight: 'bold',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid var(--gold)'
                }}
              />
              <button
                onClick={() => setFormData(prev => ({ ...prev, sareeCount: (prev.sareeCount || 1) + 1 }))}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid var(--border)',
                  background: 'var(--gold)',
                  color: 'var(--dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
              >
                +
              </button>
            </div>

            <label style={labelStyle}>Saree Received Status</label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setFormData({ ...formData, sareeReceivedInAdvance: true })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: formData.sareeReceivedInAdvance ? '#10B981' : 'var(--border-color)',
                  background: formData.sareeReceivedInAdvance ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                  color: formData.sareeReceivedInAdvance ? '#10B981' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✅ In Advance
              </button>
              <button
                onClick={() => setFormData({ ...formData, sareeReceivedInAdvance: false, sareeReceivedDate: '' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid',
                  borderColor: !formData.sareeReceivedInAdvance ? '#F59E0B' : 'var(--border-color)',
                  background: !formData.sareeReceivedInAdvance ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                  color: !formData.sareeReceivedInAdvance ? '#F59E0B' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                📍 On-Site
              </button>
            </div>

            {formData.sareeReceivedInAdvance && (
              <div className="animate-fadeIn" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed #444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: formData.sareeReceivedDate ? '12px' : '0' }}>
                  <input
                    type="checkbox"
                    id="receivedCheck"
                    checked={!!formData.sareeReceivedDate}
                    onChange={(e) => {
                      if (e.target.checked) setFormData({ ...formData, sareeReceivedDate: new Date().toISOString().split('T')[0] });
                      else setFormData({ ...formData, sareeReceivedDate: '' });
                    }}
                    style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--gold)' }}
                  />
                  <label htmlFor="receivedCheck" style={{ color: '#fff', cursor: 'pointer', fontSize: '15px' }}>
                    Sarees Received Today?
                  </label>
                </div>

                {formData.sareeReceivedDate && (
                  <div className="animate-fadeIn">
                    <label style={{ ...labelStyle, fontSize: '12px', color: '#aaa' }}>Date Received</label>
                    <input
                      type="date"
                      value={formData.sareeReceivedDate}
                      onChange={(e) => setFormData({ ...formData, sareeReceivedDate: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Event Date Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  id="eventDateCheck"
                  checked={!!formData.eventDate}
                  onChange={(e) => {
                    if (e.target.checked) setFormData({ ...formData, eventDate: new Date().toISOString().split('T')[0] });
                    else setFormData({ ...formData, eventDate: '' });
                  }}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--gold)' }}
                />
                <label htmlFor="eventDateCheck" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Event Date</label>
              </div>
              {formData.eventDate && (
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  style={inputStyle}
                />
              )}
            </div>

            {/* Delivery Date Toggle */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  id="deliveryDateCheck"
                  checked={!!formData.deliveryDate}
                  onChange={(e) => {
                    if (e.target.checked) setFormData({ ...formData, deliveryDate: new Date().toISOString().split('T')[0] });
                    else setFormData({ ...formData, deliveryDate: '' });
                  }}
                  style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--gold)' }}
                />
                <label htmlFor="deliveryDateCheck" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>Delivery Date</label>
              </div>
              {formData.deliveryDate && (
                <input
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  style={inputStyle}
                />
              )}
            </div>

            {/* Pricing */}
            <div className="glass-card" style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
              <h3 style={{
                background: 'var(--gold)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '16px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>💰 Pricing</h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>Base Amount ({formData.sareeCount} × ₹{formData.serviceType === 'pre-pleat' ? settings.prePleatRate : formData.serviceType === 'drape' ? settings.drapeRate : settings.bothRate})</span>
                <span style={{ fontWeight: 'bold' }}>{formatCurrency(formData.baseAmount || 0)}</span>
              </div>

              {(formData.additionalCharges || []).map((charge, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span>{charge.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{formatCurrency(charge.amount)}</span>
                    <button onClick={() => removeCharge(index)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>✕</button>
                  </div>
                </div>
              ))}

              {/* Add charge */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px', marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Add Extra Charge</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <select
                    value={newChargeName}
                    onChange={(e) => setNewChargeName(e.target.value)}
                    style={{ flex: 2, background: 'var(--bg-secondary)', border: '1px solid #444', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)' }}
                  >
                    <option value="">Select charge</option>
                    {settings.customChargeHeads.map(head => (
                      <option key={head} value={head}>{head}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newChargeAmount}
                    onChange={(e) => setNewChargeAmount(e.target.value)}
                    placeholder="₹"
                    style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid #444', padding: '10px', borderRadius: '6px', color: 'var(--text-primary)' }}
                  />
                  <button onClick={addCharge} style={{ background: 'var(--accent-color)', color: 'var(--bg-primary)', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                </div>
              </div>

              {/* Advance Payment */}
              <div style={{ marginBottom: '12px', borderTop: '1px solid #444', paddingTop: '12px' }}>
                <label style={{ ...labelStyle, color: '#10B981' }}>Advance Paid</label>
                <input
                  type="number"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter advance amount"
                  style={{ ...inputStyle, borderColor: '#10B981', color: '#10B981', fontWeight: 'bold' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #444', fontWeight: 'bold', fontSize: '18px' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent-color)' }}>{formatCurrency(formData.totalAmount || 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '16px', color: '#aaa' }}>
                <span>Balance Due</span>
                <span style={{ color: (formData.totalAmount || 0) - (formData.amountPaid || 0) > 0 ? '#EF4444' : '#10B981' }}>
                  {formatCurrency((formData.totalAmount || 0) - (formData.amountPaid || 0))}
                </span>
              </div>
            </div>

            <label style={labelStyle}>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '16px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '16px', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSubmit();
                  // Optional: Automatically ask to share on WhatsApp after save
                  // handleWhatsAppShare(); // For now, let's just save. Maybe add a dedicated button?
                }}
                style={{ flex: 2, padding: '16px', background: 'var(--accent-gold)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}
              >
                {order ? 'Update Order' : 'Create Order'}
              </button>
            </div>
            {/* WhatsApp Share Button (Visible only when editing or after creation logic - but here we only have save) */}
            <button
              onClick={() => {
                const balance = (formData.totalAmount || 0) - (formData.amountPaid || 0);
                const msg = `*Eyas Saree Drapist - Order Confirmation*\n\n` +
                  `📦 *Order Details:*\n` +
                  `Name: ${formData.customerName}\n` +
                  `Service: ${formData.serviceType}\n` +
                  `Sarees: ${formData.sareeCount}\n` +
                  `Event Date: ${formData.eventDate || 'Not specified'}\n\n` +
                  `💰 *Payment Info:*\n` +
                  `Total: ${formatCurrency(formData.totalAmount || 0)}\n` +
                  `Advance: ${formatCurrency(formData.amountPaid || 0)}\n` +
                  `*Balance: ${formatCurrency(balance)}*\n\n` +
                  `Thank you for booking with us!`;

                const url = `https://wa.me/${formData.phone}?text=${encodeURIComponent(msg)}`;
                window.open(url, '_blank');
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                background: '#25D366',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>💬 Share Details on WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Order, Settings, Customer } from '../types';
import { formatCurrency, formatDate, generateId } from '../utils';

interface OrderFormProps {
  order: Order | null;
  initialEventDate?: string;
  settings: Settings;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
  onSave: (order: Order) => void;
  onSettingsUpdate: React.Dispatch<React.SetStateAction<Settings>>;
  onClose: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ order, initialEventDate, settings, customers, setCustomers, orders, onSave, onSettingsUpdate, onClose }) => {
  // Steps: 1=Customer, 2=Service, 3=Dates, 4=Review, 5=Success
  const [step, setStep] = useState(order ? 2 : 1);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState('');

  // Instant Artist Creation State
  const [isAddingArtist, setIsAddingArtist] = useState(false);
  const [newArtistName, setNewArtistName] = useState('');
  const [newArtistPhone, setNewArtistPhone] = useState('');

  const handleAddArtist = () => {
    if (newArtistName) {
      const newArtist = {
        id: Date.now().toString(),
        name: newArtistName,
        phone: newArtistPhone
      };

      onSettingsUpdate(prev => ({
        ...prev,
        makeupArtists: [...(prev.makeupArtists || []), newArtist]
      }));

      setFormData({
        ...formData,
        makeupArtistDetails: { name: newArtist.name, phone: newArtist.phone }
      } as any);

      setIsAddingArtist(false);
      setNewArtistName('');
      setNewArtistPhone('');
    }
  };

  const [showHistory, setShowHistory] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [referralSearchTerm, setReferralSearchTerm] = useState('');
  const [showReferralSuggestions, setShowReferralSuggestions] = useState(false);

  const [formData, setFormData] = useState<Partial<Order>>(() => order || {
    customerName: '',
    phone: '',
    address: '', // Site address
    serviceType: 'pre-pleat',
    location: 'shop',
    sareeCount: 1,
    sareeReceivedInAdvance: false,
    sareeReceivedDate: new Date().toISOString().split('T')[0],
    eventDate: initialEventDate || '',
    deliveryDate: '',
    collectionDate: '',
    baseAmount: settings.prePleatRate,
    additionalCharges: [],
    totalAmount: settings.prePleatRate,
    payments: [],
    amountPaid: 0,
    status: 'pending',
    notes: '',
    // New Fields
    functionType: '',
    functionSubType: '',
    pleatType: '',
    measurementMethod: 'unknown',
    measurements: {
      bodyType: 'M',
      height: 'normal',
      palluHeight: 0,
      innerRotation: 0,
      bodyRotation: 0
    }
  });

  const [newChargeName, setNewChargeName] = useState('');
  const [newChargeAmount, setNewChargeAmount] = useState('');

  // Styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--dark-lighter)',
    border: '1px solid var(--border)',
    padding: '10px',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    marginBottom: '10px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '13px',
    color: 'var(--gold)',
    fontWeight: 'bold',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '16px',
    color: 'var(--gold)',
    marginBottom: '16px',
    borderBottom: '1px solid var(--border)',
    paddingBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.customerName || !formData.phone) {
        alert("Please enter Name and Phone");
        return;
      }
      if (formData.phone.length < 10) {
        alert("Please enter valid phone");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (!formData.eventDate) {
        alert("Event Date is required");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      // Check confirmation or something? No, just proceed to save action
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = () => {
    // Save/Update Customer
    const now = new Date().toISOString();
    if (!isExistingCustomer) {
      const newCustomer: Customer = {
        id: generateId(),
        name: formData.customerName!,
        phone: formData.phone!,
        permanentAddress: permanentAddress,
        createdAt: now,
        // @ts-ignore
        referralSource: formData.referralSource || 'instagram',
        // @ts-ignore
        referredByCustomerId: formData.referredByCustomerId,
        // @ts-ignore
        makeupArtistDetails: formData.makeupArtistDetails
      };
      setCustomers(prev => [...prev, newCustomer]);
    }

    const newOrder = {
      ...formData,
      id: order ? order.id : generateId(),
      createdAt: order ? order.createdAt : now
    };

    onSave(newOrder as Order);
    setStep(5); // Success
  };

  // Helper to share whatsapp
  const shareWhatsApp = () => {
    const balance = (formData.totalAmount || 0) - (formData.amountPaid || 0);
    const msg = `*Eyas Saree Drapist*\n` +
      `Order for *${formData.customerName}*\n` +
      `Event: ${formatDate(formData.eventDate || '')}\n` +
      `Function: ${formData.functionType || 'N/A'}\n` +
      `Service: ${formData.serviceType} (${formData.sareeCount} Sarees)\n` +
      `Total: ${formatCurrency(formData.totalAmount || 0)}\n` +
      `Advance: ${formatCurrency(formData.amountPaid || 0)}\n` +
      `Balance: ${formatCurrency(balance)}\n\n` +
      `Thank you!`;
    window.open(`https://wa.me/${formData.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };


  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
      zIndex: 200, overflow: 'auto', display: 'flex',
      alignItems: 'flex-start', justifyContent: 'center',
      padding: '16px', paddingTop: '40px',
    }}>
      <div className="no-scrollbar" style={{
        background: step === 1 && !order ? 'transparent' : 'var(--dark-light)',
        width: '100%', maxWidth: '360px',
        borderRadius: '16px',
        padding: step === 1 && !order ? '0' : '16px',
        maxHeight: '90vh', overflowY: 'auto',
        border: step === 1 && !order ? 'none' : '1px solid var(--gold)',
        boxShadow: step === 1 && !order ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>

        {/* Header with Progress */}
        {step !== 5 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'var(--gold)' }}>
                {order ? 'Edit Order' : 'New Order'}
              </h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4].map(s => (
                <div key={s} style={{
                  flex: 1, height: '4px', borderRadius: '2px',
                  background: s <= step ? 'var(--gold)' : '#333',
                  transition: 'all 0.3s'
                }} />
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: CUSTOMER (Reused Logic) */}
        {step === 1 && !order && (
          <div className="animate-fadeIn">
            {/* Spotlight Search Logic from previous version */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <label style={{ ...labelStyle, marginLeft: '16px' }}>Search Customer</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, phone: e.target.value, customerName: '' }));
                  setIsExistingCustomer(false);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search Name or Phone..."
                style={{ ...inputStyle, width: 'calc(100% - 12px)', borderRadius: '50px', padding: '12px 20px', marginLeft: '12px', border: '1px solid var(--gold)', boxShadow: '0 4px 15px rgba(0,0,0,0.5)' }}
                autoFocus
              />

              {formData.phone && (
                <button
                  onClick={() => setFormData(prev => ({ ...prev, phone: '', customerName: '', isExistingCustomer: false }))}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '38px',
                    background: 'var(--border)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  ✕
                </button>
              )}

              {/* Suggestions Dropdown */}
              {(isSearchFocused || (formData.phone && formData.phone.length > 1)) && !isExistingCustomer && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: 'var(--dark-light)', border: '1px solid var(--border)', borderRadius: '12px',
                  zIndex: 1000, maxHeight: '300px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.8)', marginTop: '8px',
                  width: 'calc(100% - 12px)', marginLeft: '12px' // Align with input
                }}>
                  {((formData.phone && formData.phone.length > 0)
                    ? customers.filter(c => c.name.toLowerCase().includes((formData.phone || '').toLowerCase()) || c.phone.includes(formData.phone || '')).slice(0, 20)
                    : [...customers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
                  ).map(customer => (
                    <div key={customer.id}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, customerName: customer.name, phone: customer.phone, address: customer.permanentAddress }));
                        setIsExistingCustomer(true);
                        setPermanentAddress(customer.permanentAddress);
                        setStep(2);
                      }}
                      style={{ padding: '12px 12px 12px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)' }}>
                      <div><div style={{ fontWeight: 'bold' }}>{customer.name}</div><div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{customer.phone}</div></div>
                      <span>➔</span>
                    </div>
                  ))}

                  {!formData.phone && (
                    <div onClick={() => {
                      // Clean reset
                      setIsExistingCustomer(false);
                      // Clear everything except phone if it's a number
                      const ph = /^\d+$/.test(formData.phone || '') ? formData.phone : '';
                      setFormData({
                        customerName: '', phone: ph,
                        address: '', serviceType: 'pre-pleat', location: 'shop', sareeCount: 1,
                        sareeReceivedInAdvance: false, sareeReceivedDate: new Date().toISOString().split('T')[0],
                        eventDate: '', deliveryDate: '', collectionDate: '', baseAmount: settings.prePleatRate, additionalCharges: [], totalAmount: settings.prePleatRate, payments: [], amountPaid: 0, status: 'pending', notes: '',
                        measurementMethod: 'unknown', measurements: { bodyType: 'M', height: 'normal' }
                      });
                      // Just close suggestions by unfocusing? No, we need to show the form.
                      // The form is explicitly shown below if !order and step===1.
                      // But we want to hide the SEARCH results.
                      setIsSearchFocused(false);
                    }}
                      style={{ padding: '12px', textAlign: 'center', color: 'var(--gold)', cursor: 'pointer', borderTop: '1px solid #333', fontWeight: 'bold' }}>
                      + Create New Order
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Entry Form (Visible always if not searching existing, or just below search) */}
            <div style={{ background: 'var(--dark-light)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <h3 style={sectionTitleStyle}>👤 Customer Details</h3>
              <label style={labelStyle}>Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => {
                setFormData({ ...formData, phone: e.target.value });
                // Simple existence check
                const exist = customers.find(c => c.phone === e.target.value);
                if (exist) {
                  setIsExistingCustomer(true);
                  setFormData(prev => ({ ...prev, customerName: exist.name }));
                  setPermanentAddress(exist.permanentAddress);
                } else {
                  setIsExistingCustomer(false);
                }
              }} style={inputStyle} placeholder="Phone Number" />

              {isExistingCustomer && <div style={{ color: '#10B981', fontSize: '12px', marginBottom: '8px' }}>✓ Existing Customer Found</div>}

              <label style={labelStyle}>Name</label>
              <input type="text" value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} style={inputStyle} placeholder="Customer Name" />

              {!isExistingCustomer && (
                <>
                  <label style={labelStyle}>Address (Optional)</label>
                  <textarea value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} style={{ ...inputStyle, resize: 'none' }} rows={2} placeholder="Permanent Address" />

                  <label style={labelStyle}>Referral Source</label>
                  <select value={(formData as any).referralSource || 'instagram'} onChange={e => {
                    const source = e.target.value;
                    setFormData({ ...formData, referralSource: source } as any);
                    if (source !== 'customer') {
                      setReferralSearchTerm('');
                    }
                  }} style={inputStyle}>
                    <option value="instagram">Instagram</option>
                    <option value="customer">Customer Ref</option>
                    <option value="makeup_artist">Makeup Artist</option>
                    <option value="other">Other</option>
                  </select>

                  {/* Makeup Artist Selection */}
                  {(formData as any).referralSource === 'makeup_artist' && (
                    <div style={{ marginTop: '-8px' }}>
                      {!isAddingArtist ? (
                        <select
                          value={(formData as any).makeupArtistDetails?.name || ''}
                          onChange={e => {
                            if (e.target.value === 'add_new') {
                              setIsAddingArtist(true);
                            } else {
                              const artist = settings.makeupArtists.find(a => a.name === e.target.value);
                              if (artist) {
                                setFormData({ ...formData, makeupArtistDetails: { name: artist.name, phone: artist.phone } } as any);
                              }
                            }
                          }}
                          style={{ ...inputStyle }}
                        >
                          <option value="">Select Makeup Artist</option>
                          {(settings.makeupArtists || []).map(a => (
                            <option key={a.id} value={a.name}>{a.name}</option>
                          ))}
                          <option value="add_new" style={{ fontWeight: 'bold', color: 'var(--gold)' }}>+ Add New Artist</option>
                        </select>
                      ) : (
                        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '16px' }}>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--gold)' }}>Add New Artist</h4>
                          <input
                            type="text"
                            placeholder="Artist Name"
                            value={newArtistName}
                            onChange={(e) => setNewArtistName(e.target.value)}
                            style={{ ...inputStyle, marginBottom: '8px' }}
                          />
                          <input
                            type="tel"
                            placeholder="Phone Number"
                            value={newArtistPhone}
                            onChange={(e) => setNewArtistPhone(e.target.value)}
                            style={{ ...inputStyle, marginBottom: '8px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={handleAddArtist}
                              style={{ flex: 1, padding: '8px', background: 'var(--gold)', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setIsAddingArtist(false)}
                              style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Customer Referral Search */}
                  {(formData as any).referralSource === 'customer' && (
                    <div style={{ position: 'relative', marginTop: '-8px', marginBottom: '16px', zIndex: 20 }}>
                      <input
                        type="text"
                        placeholder="Search Customer (Name/Phone)"
                        value={referralSearchTerm}
                        onChange={e => {
                          setReferralSearchTerm(e.target.value);
                          setShowReferralSuggestions(true);
                        }}
                        onFocus={() => setShowReferralSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowReferralSuggestions(false), 200)}
                        style={{ ...inputStyle, marginBottom: 0 }}
                      />
                      {showReferralSuggestions && referralSearchTerm && (
                        <div style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          maxHeight: '200px',
                          overflowY: 'auto',
                          zIndex: 10,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                          {customers.filter(c =>
                            c.name.toLowerCase().includes(referralSearchTerm.toLowerCase()) ||
                            c.phone.includes(referralSearchTerm)
                          ).slice(0, 5).map(c => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setFormData({ ...formData, referredByCustomerId: c.id } as any);
                                setReferralSearchTerm(`${c.name} (${c.phone})`);
                                setShowReferralSuggestions(false);
                              }}
                              style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                            >
                              <div style={{ fontWeight: 'bold' }}>{c.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.phone}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              <button onClick={handleNext} style={{ width: '100%', padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: '8px', fontWeight: 'bold', marginTop: '8px', cursor: 'pointer' }}>
                Next: Service Details ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SERVICE DETAILS */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h3 style={sectionTitleStyle}>👗 Service Details</h3>

            {/* Function Type */}
            <label style={labelStyle}>Function Type</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <select
                value={formData.functionType || ''}
                onChange={e => setFormData({ ...formData, functionType: e.target.value })}
                style={{ ...inputStyle, marginBottom: 0 }}
              >
                <option value="">Select Function</option>
                {(settings.functionTypes || ['Marriage', 'Baby Shower', 'Guest Drape']).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {/* Sub Type for Marriage */}
              {formData.functionType === 'Marriage' && (
                <select
                  value={formData.functionSubType || ''}
                  onChange={e => setFormData({ ...formData, functionSubType: e.target.value })}
                  style={{ ...inputStyle, marginBottom: 0 }}
                >
                  <option value="">Who?</option>
                  <option value="Self">Bride</option>
                  <option value="Relative">Relative</option>
                </select>
              )}
            </div>

            {/* Pleat Type */}
            <label style={labelStyle}>Pleat Type</label>
            <select
              value={formData.pleatType || ''}
              onChange={e => setFormData({ ...formData, pleatType: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select Pleat Style</option>
              {(settings.pleatTypes || ['Box Folding']).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Saree Count */}
            <label style={labelStyle}>Number of Sarees</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => setFormData(prev => ({ ...prev, sareeCount: Math.max(1, (prev.sareeCount || 1) - 1) }))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--dark-lighter)', color: 'var(--text-primary)', fontSize: '18px', cursor: 'pointer' }}>-</button>
              <span style={{ fontSize: '20px', fontWeight: 'bold', width: '40px', textAlign: 'center', color: 'var(--text-primary)' }}>{formData.sareeCount}</span>
              <button onClick={() => setFormData(prev => ({ ...prev, sareeCount: (prev.sareeCount || 1) + 1 }))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: 'var(--gold)', color: 'var(--dark)', fontSize: '18px', cursor: 'pointer' }}>+</button>
            </div>

            {/* Service Type */}
            <label style={labelStyle}>Service</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['pre-pleat', 'drape', 'both'].map(s => (
                <button key={s}
                  onClick={() => setFormData({ ...formData, serviceType: s as any })}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '6px',
                    border: formData.serviceType === s ? '2px solid var(--gold)' : '1px solid var(--border)',
                    background: formData.serviceType === s ? 'rgba(255,215,0,0.1)' : 'transparent',
                    color: formData.serviceType === s ? 'var(--gold)' : 'var(--text-secondary)',
                    textTransform: 'capitalize', cursor: 'pointer'
                  }}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>

            {/* Measurements */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', border: '1px dashed #444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Measurements</label>
                <div style={{ display: 'flex', background: '#333', borderRadius: '20px', padding: '2px' }}>
                  <button
                    onClick={() => setFormData({ ...formData, measurementMethod: 'unknown' })}
                    style={{ padding: '4px 12px', borderRadius: '18px', border: 'none', background: formData.measurementMethod === 'unknown' ? 'var(--gold)' : 'transparent', color: formData.measurementMethod === 'unknown' ? '#000' : '#888', fontSize: '11px', cursor: 'pointer' }}>
                    Basic
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, measurementMethod: 'known' })}
                    style={{ padding: '4px 12px', borderRadius: '18px', border: 'none', background: formData.measurementMethod === 'known' ? 'var(--gold)' : 'transparent', color: formData.measurementMethod === 'known' ? '#000' : '#888', fontSize: '11px', cursor: 'pointer' }}>
                    Advanced
                  </button>
                </div>
              </div>

              {formData.measurementMethod === 'known' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Pallu Height (In)</label>
                    <input type="number"
                      value={formData.measurements?.palluHeight || ''}
                      onChange={e => setFormData({ ...formData, measurements: { ...formData.measurements, palluHeight: parseFloat(e.target.value) } })}
                      style={inputStyle} placeholder="0.0" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Inner Rotation (In)</label>
                    <input type="number"
                      value={formData.measurements?.innerRotation || ''}
                      onChange={e => setFormData({ ...formData, measurements: { ...formData.measurements, innerRotation: parseFloat(e.target.value) } })}
                      style={inputStyle} placeholder="0.0" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Body Rotation (In)</label>
                    <input type="number"
                      value={formData.measurements?.bodyRotation || ''}
                      onChange={e => setFormData({ ...formData, measurements: { ...formData.measurements, bodyRotation: parseFloat(e.target.value) } })}
                      style={inputStyle} placeholder="0.0" />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Body Size</label>
                    <select
                      value={formData.measurements?.bodyType || 'M'}
                      onChange={e => setFormData({ ...formData, measurements: { ...formData.measurements, bodyType: e.target.value as any } })}
                      style={inputStyle}
                    >
                      {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', color: '#aaa' }}>Height</label>
                    <select
                      value={formData.measurements?.height || 'normal'}
                      onChange={e => setFormData({ ...formData, measurements: { ...formData.measurements, height: e.target.value as any } })}
                      style={inputStyle}
                    >
                      <option value="small">Low Height</option>
                      <option value="normal">Normal</option>
                      <option value="tall">Tall</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button onClick={handleBack} style={{ flex: 1, padding: '12px', background: 'var(--dark-lighter)', border: 'none', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}>Back</button>
              <button onClick={handleNext} style={{ flex: 2, padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: '8px', color: 'var(--dark)', fontWeight: 'bold', cursor: 'pointer' }}>Next: Dates ➔</button>
            </div>
          </div>
        )}

        {/* STEP 3: DATES */}
        {step === 3 && (
          <div className="animate-fadeIn">
            <h3 style={sectionTitleStyle}>📅 Schedules</h3>

            <label style={labelStyle}>Event Date *</label>
            <input type="date" value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Sarees Received Date</label>
            <input type="date" value={formData.sareeReceivedDate} onChange={e => setFormData({ ...formData, sareeReceivedDate: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Delivery Date</label>
            <input type="date" value={formData.deliveryDate} onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })} style={inputStyle} />

            <label style={labelStyle}>Collection Date</label>
            <input type="date" value={formData.collectionDate} onChange={e => setFormData({ ...formData, collectionDate: e.target.value })} style={inputStyle} />

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button onClick={handleBack} style={{ flex: 1, padding: '12px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Back</button>
              <button onClick={handleNext} style={{ flex: 2, padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Next: Review ➔</button>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & SAVE */}
        {step === 4 && (
          <div className="animate-fadeIn">
            <h3 style={sectionTitleStyle}>📝 Review Order</h3>

            <div style={{ background: 'var(--dark-lighter)', borderRadius: '8px', padding: '12px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <div><strong>Customer:</strong> {formData.customerName}</div>
              <div><strong>Phone:</strong> {formData.phone}</div>
              <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '8px' }}><strong>Service:</strong> {formData.serviceType} ({formData.sareeCount} Sarees)</div>
              <div><strong>Event:</strong> {formatDate(formData.eventDate || '')}</div>
              <div><strong>Function:</strong> {formData.functionType} {formData.functionSubType ? `(${formData.functionSubType})` : ''}</div>
              <div><strong>Pleat:</strong> {formData.pleatType}</div>
            </div>

            <label style={labelStyle}>Advance Paid</label>
            <input type="number" value={formData.amountPaid} onChange={e => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })} style={{ ...inputStyle, borderColor: '#10B981', color: '#10B981', fontWeight: 'bold' }} placeholder="₹ 0" />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', borderTop: '1px solid #333', paddingTop: '12px', marginTop: '12px' }}>
              <span>Total Amount</span>
              <span style={{ color: 'var(--gold)' }}>{formatCurrency(formData.totalAmount || 0)}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button onClick={handleBack} style={{ flex: 1, padding: '12px', background: '#333', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>Back</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '12px', background: 'var(--gold)', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>✅ Save Order</button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS & SHARE */}
        {step === 5 && (
          <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ color: 'var(--gold)', marginBottom: '20px' }}>Order Saved!</h3>
            <button
              onClick={shareWhatsApp}
              style={{ width: '100%', padding: '14px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              Share on WhatsApp
            </button>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button onClick={() => {
                // Reset everything for new order
                setFormData({
                  customerName: '', phone: '', address: '', serviceType: 'pre-pleat', location: 'shop', sareeCount: 1,
                  sareeReceivedInAdvance: false, sareeReceivedDate: new Date().toISOString().split('T')[0],
                  eventDate: '', deliveryDate: '', collectionDate: '', baseAmount: settings.prePleatRate, additionalCharges: [], totalAmount: settings.prePleatRate, payments: [], amountPaid: 0, status: 'pending', notes: '',
                  measurementMethod: 'unknown', measurements: { bodyType: 'M', height: 'normal', palluHeight: 0, innerRotation: 0, bodyRotation: 0 },
                  functionType: '', pleatType: ''
                });
                setIsExistingCustomer(false);
                setStep(1);
              }} style={{ background: 'var(--dark-lighter)', border: '1px solid #444', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Create Another</button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', textDecoration: 'underline', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

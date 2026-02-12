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

export const OrderForm: React.FC<OrderFormProps> = ({ order, initialEventDate, settings, customers, setCustomers, onSave, onClose }) => {
  // Steps: 1=Customer, 2=Service, 3=Dates, 4=Review, 5=Success
  const [step, setStep] = useState(order ? 2 : 1);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState('');

  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<'phone' | 'name' | 'referral' | null>(null);

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      phone: customer.phone,
    }));
    setPermanentAddress(customer.permanentAddress);
    setIsExistingCustomer(true);
    setShowSuggestions(null);
  };





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
        // @ts-ignore
        referralSource: formData.referralSource || 'Instagram',
        // @ts-ignore
        referredByCustomerId: formData.referredByCustomerId,
        // @ts-ignore
        // @ts-ignore
        makeupArtistDetails: formData.makeupArtistDetails
      };
      setCustomers(prev => [...prev, newCustomer]);
    }

    // If "Old Customer" referral, we might want to link the `referredByCustomerId`.
    // For now, we just save the name in notes or a specific field if we added one. 
    // The requirement was just to select them. We will store their name/ID in the order if needed.

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
    const serviceName = formData.serviceType === 'pre-pleat' ? 'Pre-Pleat Only 📦' : 'Drape 💃';

    const msg = `✨ *Eyas Saree Drapist* ✨\n` +
      `-----------------------------\n` +
      `👤 *Customer:* ${formData.customerName}\n` +
      `📅 *Event:* ${formatDate(formData.eventDate || '')}\n` +
      `🎉 *Function:* ${formData.functionType || 'N/A'}\n` +
      `👗 *Service:* ${serviceName}\n` +
      `🔢 *Sarees:* ${formData.sareeCount}\n` +
      `🏷️ *Pleat Type:* ${formData.pleatType || 'Standard'}\n` +
      `-----------------------------\n` +
      `💰 *Payment Details:*\n` +
      `💵 Total: ${formatCurrency(formData.totalAmount || 0)}\n` +
      `💳 Paid: ${formatCurrency(formData.amountPaid || 0)}\n` +
      `📉 Balance: ${formatCurrency(balance)}\n` +
      `-----------------------------\n` +
      `Thank you! 🙏`;

    // Ensure phone has 91 prefix
    let phone = formData.phone || '';
    if (!phone.startsWith('91')) phone = '91' + phone;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };


  // Validate before save
  const validateAndSave = () => {
    if (!formData.customerName || !formData.phone) {
      alert("Please enter Name and Phone");
      return;
    }
    if (formData.phone.length < 10) {
      alert("Please enter valid phone");
      return;
    }
    if (!formData.eventDate) {
      alert("Event Date is required");
      return;
    }
    handleSave();
  };

  return (
    <div className="modal-backdrop" style={{ backdropFilter: 'blur(8px)', background: 'var(--modal-backdrop)' }}>
      <div className="glass-panel no-scrollbar" style={{
        width: '100%', maxWidth: '450px',
        borderRadius: '20px',
        padding: '24px',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid var(--glass-border)',
        position: 'relative',
        background: 'var(--bg-modal-solid)', // Solid dull blue as requested
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>

        {step === 5 ? (
          /* SUCCESS VIEW */
          <div className="animate-fadeIn" style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(245, 166, 35, 0.5))' }}>🎉</div>
            <h2 style={{ color: 'var(--gold)', marginBottom: '8px', fontSize: '24px' }}>Order Confirmed!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Your booking has been successfully saved.</p>

            <button
              onClick={shareWhatsApp}
              style={{ width: '100%', padding: '16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)' }}
            >
              Share on WhatsApp
            </button>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => {
                setFormData({
                  customerName: '', phone: '', address: '', serviceType: 'pre-pleat', location: 'shop', sareeCount: 1,
                  sareeReceivedInAdvance: false, sareeReceivedDate: new Date().toISOString().split('T')[0],
                  eventDate: '', deliveryDate: '', collectionDate: '', baseAmount: settings.prePleatRate, additionalCharges: [], totalAmount: settings.prePleatRate, payments: [], amountPaid: 0, status: 'pending', notes: '',
                  measurementMethod: 'unknown', measurements: { bodyType: 'M', height: 'normal', palluHeight: 0, innerRotation: 0, bodyRotation: 0 },
                  functionType: '', pleatType: '', referralSource: 'Instagram'
                });
                setIsExistingCustomer(false);
                setStep(1);
              }} style={{ background: 'var(--btn-subtle-bg)', border: '1px solid var(--btn-subtle-border)', color: 'var(--btn-subtle-text)', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>Create Another</button>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '12px' }}>Close</button>
            </div>
          </div>
        ) : (
          /* MAIN FORM VIEW */
          <div className="animate-fadeIn">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'var(--gold)', letterSpacing: '0.5px' }}>
                {order ? 'Edit Booking' : 'New Booking'}
              </h2>
              <button onClick={onClose} style={{ background: 'var(--btn-subtle-bg)', border: 'none', color: 'var(--btn-subtle-text)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>✕</button>
            </div>

            {/* CUSTOMER SECTION */}
            <div style={{ marginBottom: '24px' }}>
              <div className="section-title">Customer Details</div>

              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ ...formData, phone: val });

                    if (val.length > 2) {
                      const matches = customers.filter(c => c.phone.includes(val));
                      setFilteredCustomers(matches);
                      setShowSuggestions(matches.length > 0 ? 'phone' : null);
                    } else {
                      setShowSuggestions(null);
                    }

                    const exist = customers.find(c => c.phone === val);
                    if (exist) {
                      setIsExistingCustomer(true);
                      setFormData(prev => ({ ...prev, customerName: exist.name }));
                      setPermanentAddress(exist.permanentAddress);
                    } else {
                      setIsExistingCustomer(false);
                    }
                  }}
                  onFocus={() => {
                    if (formData.phone && formData.phone.length > 2) {
                      const matches = customers.filter(c => c.phone.includes(formData.phone!));
                      setFilteredCustomers(matches);
                      setShowSuggestions(matches.length > 0 ? 'phone' : null);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                  className="input-glow"
                  placeholder=" "
                  autoComplete="off"
                  style={{
                    ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', height: '50px', paddingTop: '20px', paddingBottom: '6px', fontSize: '16px', fontWeight: '500',
                    borderColor: (formData.phone?.length || 0) > 10 ? '#ef4444' : (formData.phone?.length || 0) < 10 ? '#f97316' : '#10B981',
                    color: (formData.phone?.length || 0) > 10 ? '#ef4444' : (formData.phone?.length || 0) < 10 ? '#f97316' : 'var(--digit-valid-text)'
                  }}
                />
                <label style={{ position: 'absolute', left: '12px', top: '8px', fontSize: '11px', color: 'var(--text-secondary)', pointerEvents: 'none' }}>Mobile Number</label>
                <div style={{
                  position: 'absolute', right: '12px', top: '16px', fontSize: '11px', fontWeight: '600',
                  color: (formData.phone?.length || 0) > 10 ? '#ef4444' : (formData.phone?.length || 0) < 10 ? '#f97316' : '#10B981'
                }}>
                  {formData.phone?.length || 0} Digits
                </div>

                {/* Phone Suggestions */}
                {showSuggestions === 'phone' && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--dark-light)', border: '1px solid var(--border)',
                    borderRadius: '8px', marginTop: '4px', zIndex: 10,
                    boxShadow: 'var(--suggestion-shadow)', overflow: 'hidden'
                  }}>
                    {filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleCustomerSelect(c)}
                        style={{
                          padding: '10px 12px', borderBottom: '1px solid var(--suggestion-divider)',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--suggestion-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ color: 'var(--text-primary)' }}>{c.phone}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isExistingCustomer && (
                <div className="customer-pill">
                  <div style={{ marginRight: '10px', fontSize: '18px' }}>✨</div>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--customer-pill-title)', fontWeight: '600' }}>Existing Customer Found</div>
                    <div style={{ fontSize: '11px', color: 'var(--customer-pill-name)' }}>{formData.customerName}</div>
                  </div>
                </div>
              )}

              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={e => {
                    const val = e.target.value;
                    setFormData({ ...formData, customerName: val });

                    if (val.length > 2) {
                      const matches = customers.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
                      setFilteredCustomers(matches);
                      setShowSuggestions(matches.length > 0 ? 'name' : null);
                    } else {
                      setShowSuggestions(null);
                    }
                  }}
                  onFocus={() => {
                    const name = formData.customerName || '';
                    if (name.length > 2) {
                      const matches = customers.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
                      setFilteredCustomers(matches);
                      setShowSuggestions(matches.length > 0 ? 'name' : null);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                  className="input-glow"
                  placeholder=" "
                  autoComplete="off"
                  style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', height: '50px', paddingTop: '20px', paddingBottom: '6px', fontSize: '16px' }}
                />
                <label style={{ position: 'absolute', left: '12px', top: '8px', fontSize: '11px', color: 'var(--text-secondary)', pointerEvents: 'none' }}>Customer Name</label>

                {/* Name Suggestions */}
                {showSuggestions === 'name' && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--dark-light)', border: '1px solid var(--border)',
                    borderRadius: '8px', marginTop: '4px', zIndex: 10,
                    boxShadow: 'var(--suggestion-shadow)', overflow: 'hidden'
                  }}>
                    {filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleCustomerSelect(c)}
                        style={{
                          padding: '10px 12px', borderBottom: '1px solid var(--suggestion-divider)',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--suggestion-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.phone}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* REFERRAL SECTION */}
            {!isExistingCustomer && (
              <div style={{ marginBottom: '24px' }}>
                <div className="section-title">Referral Source</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {(settings.referralSources || ['Instagram', 'Old Customer', 'Makeup Artist']).map(src => {
                    const isSelected = formData.referralSource === src;
                    return (
                      <div
                        key={src}
                        onClick={() => setFormData({ ...formData, referralSource: src })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          border: isSelected ? '1px solid var(--gold)' : '1px solid var(--input-border)',
                          background: isSelected ? 'var(--gold)' : 'var(--input-bg)',
                          color: isSelected ? '#000' : 'var(--text-primary)', // Black text on Gold for visibility
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 2px 8px rgba(245, 166, 35, 0.4)' : 'none',
                          fontWeight: isSelected ? 600 : 400,
                          minWidth: 'auto'
                        }}
                      >
                        {src}
                      </div>
                    );
                  })}
                </div>

                {/* Conditional Input for Old Customer */}
                {formData.referralSource === 'Old Customer' && (
                  <div style={{ marginTop: '12px', position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search Referring Customer..."
                      className="input-glow"
                      style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)' }}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ ...formData, referredByCustomerId: val });

                        if (val.length > 1) {
                          const matches = customers.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
                          setFilteredCustomers(matches);
                          setShowSuggestions(matches.length > 0 ? 'referral' : null);
                        } else {
                          setShowSuggestions(null);
                        }
                      }}
                      onFocus={() => {
                        if (formData.referredByCustomerId && formData.referredByCustomerId.length > 1) {
                          const matches = customers.filter(c => c.name.toLowerCase().includes(formData.referredByCustomerId!.toLowerCase()));
                          setFilteredCustomers(matches);
                          setShowSuggestions(matches.length > 0 ? 'referral' : null);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                      value={formData.referredByCustomerId || ''}
                    />

                    {/* Referral Suggestions */}
                    {showSuggestions === 'referral' && (
                      <div style={{
                        position: 'absolute', top: '100%', left: 0, right: 0,
                        background: 'var(--dark-light)', border: '1px solid var(--border)',
                        borderRadius: '8px', marginTop: '4px', zIndex: 10,
                        boxShadow: 'var(--suggestion-shadow)', overflow: 'hidden', maxHeight: '150px', overflowY: 'auto'
                      }}>
                        {filteredCustomers.map(c => (
                          <div
                            key={c.id}
                            onClick={() => {
                              setFormData({ ...formData, referredByCustomerId: c.name }); // Storing name for simplicity in this field
                              setShowSuggestions(null);
                            }}
                            style={{
                              padding: '10px 12px', borderBottom: '1px solid var(--suggestion-divider)',
                              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--suggestion-hover)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ color: 'var(--text-primary)' }}>{c.name}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Input for Makeup Artist */}
                {formData.referralSource === 'Makeup Artist' && (
                  <div style={{ marginTop: '12px' }}>
                    <select
                      className="input-glow"
                      style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', height: '50px' }}
                      value={formData.makeupArtistDetails?.name || ''}
                      onChange={(e) => {
                        const selectedArtist = settings.makeupArtists?.find(a => a.name === e.target.value);
                        setFormData({
                          ...formData,
                          makeupArtistDetails: selectedArtist ? { name: selectedArtist.name, phone: selectedArtist.phone } : undefined
                        });
                      }}
                    >
                      <option value="">Select Makeup Artist</option>
                      {(settings.makeupArtists || []).map(artist => (
                        <option key={artist.id} value={artist.name}>{artist.name}</option>
                      ))}
                    </select>
                  </div>
                )}

              </div>
            )}

            {/* SERVICE SECTION */}
            {/* SERVICE SECTION */}
            <div style={{ marginBottom: '24px' }}>
              <div className="section-title">Service Type</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div
                  className={`service-card ${formData.serviceType === 'pre-pleat' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, serviceType: 'pre-pleat' })}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: formData.serviceType === 'pre-pleat' ? '1px solid var(--gold)' : '1px solid var(--input-border)',
                    background: formData.serviceType === 'pre-pleat' ? 'var(--gold)' : 'var(--input-bg)',
                    color: formData.serviceType === 'pre-pleat' ? '#000' : 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.serviceType === 'pre-pleat' ? '0 2px 8px rgba(245, 166, 35, 0.4)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '18px' }}>📦</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: formData.serviceType === 'pre-pleat' ? '#000' : 'var(--text-primary)' }}>Pre-Pleat</div>
                  </div>
                </div>

                <div
                  className={`service-card ${formData.serviceType === 'pre-pleat-drape' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, serviceType: 'pre-pleat-drape' })}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: formData.serviceType === 'pre-pleat-drape' ? '1px solid var(--gold)' : '1px solid var(--input-border)',
                    background: formData.serviceType === 'pre-pleat-drape' ? 'var(--gold)' : 'var(--input-bg)',
                    color: formData.serviceType === 'pre-pleat-drape' ? '#000' : 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                    boxShadow: formData.serviceType === 'pre-pleat-drape' ? '0 2px 8px rgba(245, 166, 35, 0.4)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '18px' }}>💃</div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: formData.serviceType === 'pre-pleat-drape' ? '#000' : 'var(--text-primary)' }}>Drape</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout: Function, Pleat, and Saree Count */}
            {/* Flexbox to allow wrapping: Mobile = Function+Pleat row 1, Saree row 2. Desktop = All row 1 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <div style={{ flex: '1 1 140px', minWidth: '140px' }}>
                <div className="section-title" style={{ marginBottom: '8px' }}>Function Name</div>
                <select
                  value={formData.functionType || ''}
                  onChange={e => setFormData({ ...formData, functionType: e.target.value })}
                  className="input-glow"
                  style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', height: '42px', width: '100%', marginBottom: 0 }}
                >
                  <option value="">Select Function</option>
                  {(settings.functionTypes || ['Marriage', 'Baby Shower']).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ flex: '1 1 140px', minWidth: '140px' }}>
                <div className="section-title" style={{ marginBottom: '8px' }}>Pre-Pleat Type</div>
                <select
                  value={formData.pleatType || ''}
                  onChange={e => setFormData({ ...formData, pleatType: e.target.value })}
                  className="input-glow"
                  style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', height: '42px', width: '100%', marginBottom: 0 }}
                >
                  <option value="">Select Type</option>
                  {(settings.pleatTypes || ['Box', 'Center', 'Mermaid', 'Side']).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1 1 300px' }}>
                <div className="section-title" style={{ marginBottom: '8px' }}>Sarees</div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--input-bg)', borderRadius: '8px', border: '1px solid var(--input-border)', padding: '4px', height: '42px' }}>
                  <button onClick={() => setFormData(prev => ({ ...prev, sareeCount: Math.max(1, (prev.sareeCount || 1) - 1) }))} style={{ width: '32px', height: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '18px', cursor: 'pointer' }}>-</button>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: 'var(--gold)' }}>{formData.sareeCount}</div>
                  <button onClick={() => setFormData(prev => ({ ...prev, sareeCount: (prev.sareeCount || 1) + 1 }))} style={{ width: '32px', height: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '18px', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>

            {/* SCHEDULE SECTION */}
            <div style={{ marginBottom: '24px' }}>
              <div className="section-title">Schedule & Notes</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>

                {/* Event/Collect Date */}
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                    className="input-glow"
                    style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', height: '50px', paddingTop: '20px', paddingBottom: '6px', fontSize: '15px' }}
                  />
                  <label style={{ position: 'absolute', left: '12px', top: '8px', fontSize: '11px', color: 'var(--text-secondary)', pointerEvents: 'none' }}>
                    {formData.serviceType === 'pre-pleat' ? 'Customer Collect Date' : 'Event Date'}
                  </label>
                </div>

                {/* Saree Received Date */}
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Sarees Received?</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={formData.sareeReceivedInAdvance}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            sareeReceivedInAdvance: isChecked,
                            sareeReceivedDate: isChecked ? new Date().toISOString().split('T')[0] : ''
                          }));
                        }}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--gold)' }}
                      />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Received Today</span>
                    </div>
                  </div>

                  {!formData.sareeReceivedInAdvance && (
                    <input
                      type="date"
                      value={formData.sareeReceivedDate}
                      onChange={e => setFormData({ ...formData, sareeReceivedDate: e.target.value })}
                      className="input-glow"
                      style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', marginBottom: 0 }}
                    />
                  )}
                  {formData.sareeReceivedInAdvance && (
                    <div style={{ fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✅ Received on {formatDate(formData.sareeReceivedDate || new Date().toISOString())}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="input-glow"
                    placeholder=" "
                    rows={3}
                    style={{ ...inputStyle, background: 'var(--input-bg)', border: '1px solid var(--input-border)', paddingTop: '20px', resize: 'vertical' }}
                  />
                  <label style={{ position: 'absolute', left: '12px', top: '8px', fontSize: '11px', color: 'var(--text-secondary)', pointerEvents: 'none' }}>Important Notes</label>
                </div>

              </div>
            </div>

            <button
              onClick={validateAndSave}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, var(--gold) 0%, #E09000 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#1a1a2e',
                fontWeight: '700',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(245, 166, 35, 0.3)',
                transition: 'transform 0.1s',
                marginTop: '10px'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Confirm Booking ➔
            </button>
          </div>
        )}
      </div>
    </div >
  );
};

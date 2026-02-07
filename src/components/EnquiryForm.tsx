import React, { useState, useEffect } from 'react';
import { Enquiry, Customer } from '../types';
import { formatDate, generateId } from '../utils';

interface EnquiryFormProps {
  enquiry: Enquiry | null;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  enquiries: Enquiry[];
  onSave: (enquiry: Enquiry) => void;
  onClose: () => void;
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({ enquiry, customers, setCustomers, enquiries, onSave, onClose }) => {
  const [step, setStep] = useState(enquiry ? 2 : 1);
  const [isExistingCustomer, setIsExistingCustomer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [formData, setFormData] = useState<Partial<Enquiry>>(() => enquiry || {
    customerName: '',
    phone: '',
    serviceType: 'pre-pleat',
    location: 'shop',
    eventDate: '',
    sareeCount: 1,
    notes: '',
    status: 'new',
  });

  // If editing, check if customer exists
  useEffect(() => {
    if (enquiry) {
      const existing = customers.find(c => c.phone === enquiry.phone);
      if (existing) {
        setIsExistingCustomer(true);
      }
    }
  }, [enquiry, customers]);

  const handlePhoneCheck = () => {
    if (!formData.phone || formData.phone.length < 10) {
      alert("Please enter a valid phone number");
      return;
    }

    const existing = customers.find(c => c.phone === formData.phone);
    if (existing) {
      setIsExistingCustomer(true);
      setFormData(prev => ({ ...prev, customerName: existing.name }));
    } else {
      setIsExistingCustomer(false);
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!formData.customerName || !formData.phone) {
      alert('Please fill in customer name and phone');
      return;
    }

    const now = new Date().toISOString();

    // Auto-create customer if new (optional for enquiry, but good for building database)
    if (!isExistingCustomer) {
      const newCustomer: Customer = {
        id: generateId(),
        name: formData.customerName!,
        phone: formData.phone!,
        permanentAddress: '', // Enquiries might not give address yet
        createdAt: now
      };
      setCustomers(prev => [...prev, newCustomer]);
    }

    const newEnquiry = {
      ...formData,
      id: enquiry ? enquiry.id : generateId(),
      createdAt: enquiry ? enquiry.createdAt : now
    };

    onSave(newEnquiry as Enquiry);
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
            {enquiry ? '✏️ Edit Enquiry' : '📋 New Enquiry'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-accent)', fontSize: '28px', cursor: 'pointer' }}>✕</button>
        </div>

        {/* STEP 1: PHONE VERIFICATION */}
        {step === 1 && !enquiry && (
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
        {(step === 2 || enquiry) && (
          <div className="animate-fadeIn">

            {/* Customer Status Banner */}
            {!enquiry && (
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

            {/* History Section (Past Enquiries) */}
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
                <h4 style={{ color: 'var(--gold)', marginBottom: '8px', fontSize: '14px' }}>Previous Enquiries</h4>
                {enquiries.filter(e => e.phone === formData.phone).length === 0 ? (
                  <p style={{ color: '#666', fontSize: '13px' }}>No previous enquiries found.</p>
                ) : (
                  enquiries.filter(e => e.phone === formData.phone).map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #222', fontSize: '13px', color: '#ccc' }}>
                      <span>{formatDate(e.eventDate)}</span>
                      <span>{e.status}</span>
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

            <label style={labelStyle}>Number of Sarees</label>
            <input
              type="number"
              value={formData.sareeCount}
              onChange={(e) => setFormData({ ...formData, sareeCount: parseInt(e.target.value) || 1 })}
              min="1"
              style={inputStyle}
            />

            <label style={labelStyle}>Event Date</label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              style={inputStyle}
            />

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
              <button onClick={handleSubmit} style={{ flex: 2, padding: '16px', background: 'var(--accent-gold)', color: '#000', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}>
                {enquiry ? 'Update Enquiry' : 'Create Enquiry'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Enquiry } from '../types';
import { formatDate } from '../utils';

export const EnquiryList: React.FC<{
  enquiries: Enquiry[];
  cardStyle: React.CSSProperties;
  btnPrimary: React.CSSProperties;
  btnSecondary: React.CSSProperties;
  onEdit: (enquiry: Enquiry) => void;
  onDelete: (id: string) => void;
  onConvert: (enquiry: Enquiry) => void;
}> = ({ enquiries, cardStyle, btnPrimary, btnSecondary: _, onEdit, onDelete, onConvert }) => {
  const [filter, setFilter] = useState<string>('all');

  const filteredEnquiries = enquiries.filter(e => filter === 'all' || e.status === filter);

  const statusColors: Record<string, string> = {
    'new': '#10B981',
    'follow-up': '#F59E0B',
    'converted': '#3B82F6',
    'cancelled': '#6B7280',
  };

  const sendWhatsAppFollowUp = (enquiry: Enquiry) => {
    const message = `🪻 *Eyas Saree Drapist* 🪻

Vanakkam ${enquiry.customerName}! 🙏

Thank you for your enquiry about our ${enquiry.serviceType === 'pre-pleat' ? 'Pre-Pleat' : enquiry.serviceType === 'drape' ? 'Draping' : 'Pre-Pleat & Draping'} service.

📅 Event Date: ${formatDate(enquiry.eventDate)}
👗 Sarees: ${enquiry.sareeCount}

We would love to serve you! Please let us know if you would like to proceed.

📸 Instagram: @eyas_sareedrapist_namakkal

Thank you! 🙏`;

    window.open(`https://wa.me/91${enquiry.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          background: 'var(--accent-gold)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>📋 Enquiries</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: 'var(--glass-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--glass-border)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <option value="all">All Enquiries</option>
          <option value="new">New</option>
          <option value="follow-up">Follow-up</option>
          <option value="converted">Converted</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filteredEnquiries.length === 0 ? (
        <div className="glass-card" style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <p style={{ color: 'var(--text-secondary)' }}>No enquiries found</p>
        </div>
      ) : (
        filteredEnquiries.map(enquiry => (
          <div key={enquiry.id} className="glass-card" style={{ ...cardStyle, marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-primary)' }}>{enquiry.customerName}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📱 {enquiry.phone}</p>
              </div>
              <span style={{
                background: `linear-gradient(135deg, ${statusColors[enquiry.status]}, ${statusColors[enquiry.status]}dd)`,
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '600',
                boxShadow: 'var(--shadow-sm)',
                textTransform: 'uppercase',
              }}>
                {enquiry.status.replace('-', ' ')}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#aaa', marginBottom: '12px' }}>
              <span>🪻 {enquiry.serviceType === 'pre-pleat' ? 'Pre-Pleat' : enquiry.serviceType === 'drape' ? 'Drape' : 'Both'}</span>
              <span>👗 {enquiry.sareeCount} sarees</span>
              <span>{enquiry.location === 'onsite' ? '📍 On-Site' : '🏪 Shop'}</span>
              <span>📅 {formatDate(enquiry.eventDate)}</span>
            </div>

            {enquiry.notes && (
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                📝 {enquiry.notes}
              </p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {enquiry.status !== 'converted' && enquiry.status !== 'cancelled' && (
                <button
                  onClick={() => onConvert(enquiry)}
                  style={{ ...btnPrimary, flex: 1, minWidth: '120px', padding: '10px' }}
                >
                  ✅ Convert to Order
                </button>
              )}
              <button
                onClick={() => sendWhatsAppFollowUp(enquiry)}
                style={{ ...btnPrimary, flex: 1, minWidth: '120px', padding: '10px', background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
              >
                📱 Follow-up
              </button>
              <button
                onClick={() => onEdit(enquiry)}
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                ✏️
              </button>
              <button
                onClick={() => { if (confirm('Delete this enquiry?')) onDelete(enquiry.id); }}
                style={{ background: '#7f1d1d', color: 'var(--text-primary)', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

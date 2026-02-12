import React, { useState } from 'react';
import { Order, Settings, Payment } from '../types';
import { formatDate, formatCurrency, generateId } from '../utils';

export const OrderList: React.FC<{
  orders: Order[];
  settings: Settings;
  cardStyle: React.CSSProperties;
  btnPrimary: React.CSSProperties;
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: Order['status']) => void;
  onAddPayment: (id: string, payment: Payment) => void;
}> = ({ orders, settings, cardStyle, btnPrimary, onEdit, onDelete, onUpdateStatus, onAddPayment }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');

  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  const statusColors: Record<string, string> = {
    'pending': 'var(--warning)',
    'received': 'var(--info)',
    'in-progress': '#9b59b6',
    'completed': 'var(--success)',
    'delivered': 'var(--text-muted)',
  };

  const sendWhatsAppQuotation = (order: Order) => {
    const message = `🪻 *Eyas Saree Drapist* 🪻
━━━━━━━━━━━━━━━━━━
Vanakkam ${order.customerName}! 🙏

📋 *Order Details:*
• Service: ${order.serviceType === 'pre-pleat' ? 'Pre-Pleat' : order.serviceType === 'drape' ? 'Draping' : 'Pre-Pleat + Draping'}
• Sarees: ${order.sareeCount}
• Location: ${order.location === 'onsite' ? 'On-Site' : 'At Shop'}
• Event Date: ${formatDate(order.eventDate)}

💰 *Amount:*
• Base: ${formatCurrency(order.baseAmount)}
${order.additionalCharges.map(c => `• ${c.name}: ${formatCurrency(c.amount)}`).join('\n')}
• *Total: ${formatCurrency(order.totalAmount)}*
• Paid: ${formatCurrency(order.amountPaid)}
• Balance: ${formatCurrency(order.totalAmount - order.amountPaid)}

📸 Instagram: ${settings.instagram}
━━━━━━━━━━━━━━━━━━
Thank you for choosing us! 🙏`;

    window.open(`https://wa.me/91${order.phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleAddPayment = () => {
    if (showPaymentModal && paymentAmount) {
      onAddPayment(showPaymentModal, {
        id: generateId(),
        amount: parseFloat(paymentAmount),
        date: new Date().toISOString(),
        mode: paymentMode,
      });
      setShowPaymentModal(null);
      setPaymentAmount('');
    }
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
        }}>📦 Orders</h2>
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
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="received">Received</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="glass-card" style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p style={{ color: 'var(--text-secondary)' }}>No orders found</p>
        </div>
      ) : (
        filteredOrders.map(order => (
          <div key={order.id} className="glass-card" style={{ ...cardStyle, marginBottom: '16px' }}>
            <div
              onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px', color: 'var(--text-primary)' }}>{order.customerName}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>📱 {order.phone}</p>
                </div>
                <span style={{
                  background: `linear-gradient(135deg, ${statusColors[order.status]}, ${statusColors[order.status]}dd)`,
                  color: order.status === 'pending' ? 'var(--dark)' : '#fff',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: '600',
                  boxShadow: 'var(--shadow-sm)',
                  textTransform: 'uppercase',
                }}>
                  {order.status.replace('-', ' ')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <span>🪻 {order.serviceType === 'pre-pleat' ? 'Pre-Pleat' : order.serviceType === 'drape' ? 'Drape' : 'Both'}</span>
                <span>👗 {order.sareeCount} sarees</span>
                <span>{order.location === 'onsite' ? '📍 On-Site' : '🏪 Shop'}</span>
                <span>📅 {formatDate(order.eventDate)}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-color)',
              }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Total: </span>
                  <span style={{ fontWeight: 'bold', background: 'var(--accent-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Balance: </span>
                  <span style={{ fontWeight: 'bold', color: order.totalAmount - order.amountPaid > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                    {formatCurrency(order.totalAmount - order.amountPaid)}
                  </span>
                </div>
              </div>
            </div>

            {expandedId === order.id && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                {/* Details */}
                <div style={{ display: 'grid', gap: '8px', fontSize: '14px', marginBottom: '16px' }}>
                  <div><strong>Address:</strong> {order.address || '-'}</div>
                  {order.gps && (
                    <div style={{ marginTop: '4px' }}>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${order.gps.lat},${order.gps.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'rgba(245, 166, 35, 0.15)',
                          color: 'var(--gold)',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: '600',
                          border: '1px solid var(--gold)'
                        }}
                      >
                        🗺️ Navigate to Location ↗
                      </a>
                    </div>
                  )}
                  <div><strong>Saree Received:</strong> {order.sareeReceivedInAdvance ? `Yes (${formatDate(order.sareeReceivedDate)})` : 'No'}</div>
                  <div><strong>Delivery Date:</strong> {formatDate(order.deliveryDate)}</div>
                  <div><strong>Collection Date:</strong> {formatDate(order.collectionDate)}</div>
                  {order.notes && <div><strong>Notes:</strong> {order.notes}</div>}
                </div>

                {/* Charges breakdown */}
                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Base Amount</span>
                    <span>{formatCurrency(order.baseAmount)}</span>
                  </div>
                  {(order.additionalCharges || []).map((charge, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>{charge.name}</span>
                      <span>{formatCurrency(charge.amount)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--accent-color)' }}>{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Payments */}
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--accent-color)' }}>Payment History</h4>
                  {(order.payments || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No payments yet</p>
                  ) : (
                    (order.payments || []).map(payment => (
                      <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px', marginBottom: '4px' }}>
                        <span>{formatDate(payment.date)} • {payment.mode}</span>
                        <span style={{ color: 'var(--success)' }}>+{formatCurrency(payment.amount)}</span>
                      </div>
                    ))
                  )}
                </div>

                {/* Status update */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>Update Status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value as Order['status'])}
                    style={{
                      width: '100%',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border)',
                      padding: '10px',
                      borderRadius: '8px',
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="received">Saree Received</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <button
                    onClick={() => setShowPaymentModal(order.id)}
                    style={{ ...btnPrimary, flex: 1, minWidth: '120px', padding: '10px' }}
                  >
                    💳 Add Payment
                  </button>
                  <button
                    onClick={() => sendWhatsAppQuotation(order)}
                    style={{ ...btnPrimary, flex: 1, minWidth: '120px', padding: '10px', background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
                  >
                    📱 WhatsApp
                  </button>
                  <button
                    onClick={() => onEdit(order)}
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this order?')) onDelete(order.id); }}
                    style={{ background: '#7f1d1d', color: 'var(--text-primary)', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

      {/* Payment Modal - Enhanced Glass */}
      {showPaymentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--modal-backdrop)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
          padding: '20px',
        }}>
          <div className="glass-card" style={{ ...cardStyle, width: '100%', maxWidth: '400px', animation: 'fadeIn 0.3s ease' }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '20px',
              background: 'var(--accent-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Add Payment</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Amount</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                }}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Bank Transfer</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowPaymentModal(null)} style={{
                flex: 1,
                padding: '12px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                fontWeight: '600',
              }}>
                Cancel
              </button>
              <button onClick={handleAddPayment} style={{ ...btnPrimary, flex: 1 }}>
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

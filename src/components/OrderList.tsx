import React, { useState } from 'react';
import { Order, Settings, Payment } from '../types';
import { formatDate, formatCurrency, generateId } from '../utils';
import { Clock, PackageCheck, Truck, CheckCircle, Loader, Package } from 'lucide-react';

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
        <div className="no-scrollbar" style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
          alignItems: 'center',
          flexWrap: 'nowrap'
        }}>
          {[
            { id: 'all', label: 'All', icon: <Package size={14} /> },
            { id: 'pending', label: 'Pending', icon: <Clock size={14} /> },
            { id: 'received', label: 'Received', icon: <PackageCheck size={14} /> },
            { id: 'in-progress', label: 'Processing', icon: <Loader size={14} /> },
            { id: 'completed', label: 'Ready', icon: <CheckCircle size={14} /> },
            { id: 'delivered', label: 'Delivered', icon: <Truck size={14} /> },
          ].map(f => {
            const count = f.id === 'all' ? orders.length : orders.filter(o => o.status === f.id).length;
            const isActive = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid var(--gold)' : '1px solid var(--glass-border)',
                  background: isActive ? 'var(--gold)' : 'var(--glass-bg)',
                  color: isActive ? '#000' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: isActive ? '600' : '500',
                  fontSize: '13px',
                  boxShadow: isActive ? '0 2px 8px rgba(245, 166, 35, 0.3)' : 'none'
                }}
              >
                {f.icon}
                <span>{f.label}</span>
                <span style={{
                  background: isActive ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  marginLeft: '2px'
                }}>{count}</span>
              </button>
            );
          })}
        </div>
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

                {/* Payment Progress Bar */}
                <div style={{
                  background: 'var(--dark-lighter)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Payment Progress</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--gold)' }}>
                      {order.amountPaid > 0 ? Math.round((order.amountPaid / order.totalAmount) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'var(--dark)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${order.amountPaid > 0 ? (order.amountPaid / order.totalAmount) * 100 : 0}%`,
                      background: 'linear-gradient(90deg, var(--success), #10b981)',
                      transition: 'width 0.3s ease',
                      borderRadius: '4px'
                    }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Total</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--gold)' }}>{formatCurrency(order.totalAmount)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Paid</div>
                      <div style={{ fontWeight: 'bold', color: 'var(--success)' }}>{formatCurrency(order.amountPaid)}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Balance</div>
                      <div style={{ fontWeight: 'bold', color: order.totalAmount - order.amountPaid > 0 ? 'var(--error)' : 'var(--success)' }}>
                        {formatCurrency(order.totalAmount - order.amountPaid)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '16px' }}>
                  <a
                    href={`tel:${order.phone}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: '#fff',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    📞 Call
                  </a>
                  <button
                    onClick={() => sendWhatsAppQuotation(order)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #25D366, #128C7E)',
                      color: '#fff',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                    }}
                  >
                    💬 WhatsApp
                  </button>
                  {order.gps && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${order.gps.lat},${order.gps.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px',
                        background: 'linear-gradient(135deg, var(--gold), #E09000)',
                        color: '#fff',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(245, 166, 35, 0.3)'
                      }}
                    >
                      🗺️ Navigate
                    </a>
                  )}
                </div>

                {/* Details */}
                <div style={{
                  background: 'var(--dark-lighter)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order Details</h4>
                  <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Address:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500', textAlign: 'right', maxWidth: '60%' }}>{order.address || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Saree Count:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>👗 {order.sareeCount}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Saree Received:</span>
                      <span style={{ color: order.sareeReceivedInAdvance ? 'var(--success)' : 'var(--text-muted)', fontWeight: '500' }}>
                        {order.sareeReceivedInAdvance ? `✅ Yes (${formatDate(order.sareeReceivedDate)})` : '❌ No'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Delivery Date:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>📅 {formatDate(order.deliveryDate)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Collection Date:</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>📅 {formatDate(order.collectionDate)}</span>
                    </div>
                    {order.notes && (
                      <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Notes:</span>
                        <span style={{ color: 'var(--text-primary)', fontSize: '12px', fontStyle: 'italic' }}>{order.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* Charges breakdown */}
                <div style={{
                  background: 'var(--dark-lighter)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Charges Breakdown</h4>
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
                <div style={{
                  background: 'var(--dark-lighter)',
                  borderRadius: '12px',
                  padding: '14px',
                  marginBottom: '16px',
                  border: '1px solid var(--border)'
                }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment History</h4>
                  {(order.payments || []).length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>No payments recorded yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(order.payments || []).map(payment => (
                        <div key={payment.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '12px',
                          padding: '10px 12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{payment.mode}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>{formatDate(payment.date)}</div>
                          </div>
                          <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '14px' }}>+{formatCurrency(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
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

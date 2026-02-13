import React from 'react';
import { Order, Enquiry } from '../types';
import { formatCurrency, formatDate } from '../utils';

export const Dashboard: React.FC<{
  orders: Order[];
  enquiries: Enquiry[];
  cardStyle: React.CSSProperties;
  onViewOrders: () => void;
  onViewEnquiries: () => void;
  onNewOrder?: () => void;
  onNewEnquiry?: () => void;
  onAddCustomer?: () => void;
}> = ({ orders, enquiries, cardStyle, onViewOrders, onViewEnquiries, onNewOrder, onNewEnquiry, onAddCustomer }) => {
  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  // --- Data Calculations ---
  const todayEvents = orders.filter(o => (o.eventDate || '') === today).sort((a, b) => (a.customerName || '').localeCompare(b.customerName || ''));
  const upcomingEvents = orders.filter(o => (o.eventDate || '') > today).sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || '')).slice(0, 5);

  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'completed');
  const newEnquiries = enquiries.filter(e => e.status === 'new').slice(0, 3);

  const todayRevenue = orders
    .filter(o => (o.createdAt || '').startsWith(today))
    .reduce((sum, o) => sum + (o.amountPaid || 0), 0);

  const totalPendingAmount = orders.reduce((sum, o) => sum + ((o.totalAmount || 0) - (o.amountPaid || 0)), 0);

  const upcomingCount = orders.filter(o => {
    const eventDate = new Date(o.eventDate || '');
    const nextWeek = new Date(Date.now() + 7 * 86400000);
    return eventDate > new Date() && eventDate <= nextWeek;
  }).length;

  // Revenue data for last 7 days
  const revenueData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0];
    const revenue = orders
      .filter(o => (o.createdAt || '').startsWith(date))
      .reduce((sum, o) => sum + (o.amountPaid || 0), 0);
    return { date, revenue };
  });

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1);

  // --- Helper Components ---

  const HeroStatCard: React.FC<{ label: string; value: string | number; icon: string; color: string; trend?: string }> = ({ label, value, icon, color, trend }) => (
    <div className="glass-card" style={{
      ...cardStyle,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '140px',
      background: `linear-gradient(135deg, ${color}20, ${color}05)`,
      borderLeft: `4px solid ${color}`,
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      cursor: 'pointer'
    }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '12px'
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'var(--text-primary)',
            lineHeight: '1',
            marginBottom: '8px'
          }}>
            {value}
          </div>
          {trend && (
            <div style={{
              fontSize: '12px',
              color: color,
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {trend}
            </div>
          )}
        </div>
        <div style={{
          background: `${color}30`,
          color: color,
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          flexShrink: 0
        }}>
          {icon}
        </div>
      </div>

      {/* Decorative Gradient Blur */}
      <div style={{
        position: 'absolute',
        right: '-30px',
        bottom: '-30px',
        width: '100px',
        height: '100px',
        background: color,
        filter: 'blur(50px)',
        opacity: 0.2,
        pointerEvents: 'none',
        borderRadius: '50%'
      }} />
    </div>
  );

  const QuickActionButton: React.FC<{ label: string; icon: string; color: string; onClick?: () => void }> = ({ label, icon, color, onClick }) => (
    <button
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${color}, ${color}dd)`,
        color: '#fff',
        border: 'none',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: `0 4px 12px ${color}40`,
        fontWeight: '600',
        fontSize: '14px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 6px 16px ${color}60`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 12px ${color}40`;
      }}
    >
      <div style={{ fontSize: '32px' }}>{icon}</div>
      <div>{label}</div>
    </button>
  );

  return (
    <div className="animate-fadeIn" style={{ paddingBottom: '20px' }}>
      {/* Hero Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        marginTop: '20px'
      }}>
        <HeroStatCard
          label="Today's Revenue"
          value={formatCurrency(todayRevenue)}
          icon="💰"
          color="#27ae60"
          trend="From payments received"
        />
        <HeroStatCard
          label="Active Orders"
          value={activeOrders.length}
          icon="📦"
          color="#f39c12"
          trend={`${activeOrders.filter(o => o.status === 'in-progress').length} in progress`}
        />
        <HeroStatCard
          label="Upcoming (7 Days)"
          value={upcomingCount}
          icon="📅"
          color="#3b82f6"
          trend="Events this week"
        />
        <HeroStatCard
          label="Pending Payments"
          value={formatCurrency(totalPendingAmount)}
          icon="⏳"
          color="#EF4444"
          trend={`${orders.filter(o => o.totalAmount > o.amountPaid).length} orders`}
        />
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ ...cardStyle, padding: '20px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>
          ⚡ Quick Actions
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px'
        }}>
          <QuickActionButton label="New Order" icon="➕" color="#F5A623" onClick={onNewOrder} />
          <QuickActionButton label="New Enquiry" icon="📝" color="#3b82f6" onClick={onNewEnquiry} />
          <QuickActionButton label="Add Customer" icon="👥" color="#9b59b6" onClick={onAddCustomer} />
          <QuickActionButton label="View Reports" icon="📊" color="#27ae60" onClick={onViewOrders} />
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

        {/* Left: Today's Schedule */}
        <div className="glass-card" style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>📅 Today's Schedule</h3>
            <span style={{
              background: 'var(--dark-lighter)',
              color: 'var(--text-secondary)',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {todayEvents.length} Events
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {todayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No events today!</p>
                <p style={{ fontSize: '13px' }}>Enjoy your free time or plan ahead.</p>
                <button
                  onClick={onViewOrders}
                  style={{
                    marginTop: '16px',
                    color: 'var(--gold)',
                    background: 'none',
                    border: '1px solid var(--gold)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  View All Orders
                </button>
              </div>
            ) : (
              todayEvents.map((order) => {
                const serviceColor = order.serviceType === 'pre-pleat' ? '#ff9f43' :
                  order.serviceType === 'drape' ? '#a29bfe' : '#0abd63';
                const statusColor = order.status === 'completed' ? '#27ae60' :
                  order.status === 'in-progress' ? '#3b82f6' : '#f39c12';

                return (
                  <div key={order.id} style={{
                    background: 'var(--dark-lighter)',
                    borderRadius: '12px',
                    padding: '16px',
                    borderLeft: `4px solid ${serviceColor}`,
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {order.customerName}
                        </h4>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          📱 {order.phone}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '12px' }}>
                          <span style={{
                            background: `${serviceColor}20`,
                            color: serviceColor,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '600'
                          }}>
                            {order.serviceType === 'pre-pleat' ? '✂️ Pre-Pleat' :
                              order.serviceType === 'drape' ? '✨ Drape' : '📚 Both'}
                          </span>
                          <span style={{
                            background: `${statusColor}20`,
                            color: statusColor,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '600'
                          }}>
                            {order.status === 'completed' ? '✅' :
                              order.status === 'in-progress' ? '⚙️' : '⏳'} {order.status}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            👗 {order.sareeCount}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {order.location === 'onsite' ? '📍 On-Site' : '🏪 Shop'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <a
                        href={`tel:${order.phone}`}
                        style={{
                          flex: 1,
                          padding: '8px',
                          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                          color: '#fff',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center',
                          border: 'none'
                        }}
                      >
                        📞 Call
                      </a>
                      {order.gps && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${order.gps.lat},${order.gps.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            padding: '8px',
                            background: 'linear-gradient(135deg, var(--gold), #E09000)',
                            color: '#fff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '600',
                            textAlign: 'center',
                            border: 'none'
                          }}
                        >
                          🗺️ Navigate
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Insights Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Revenue Chart */}
          <div className="glass-card" style={{ ...cardStyle, padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>
              📈 Revenue (Last 7 Days)
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
              {revenueData.map((data, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '100%',
                    height: `${(data.revenue / maxRevenue) * 100}%`,
                    minHeight: data.revenue > 0 ? '8px' : '2px',
                    background: data.revenue > 0 ? 'linear-gradient(180deg, #27ae60, #10b981)' : 'var(--border)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease',
                    position: 'relative'
                  }}>
                    {data.revenue > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: '#27ae60',
                        whiteSpace: 'nowrap'
                      }}>
                        ₹{(data.revenue / 1000).toFixed(0)}k
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Payments Alert */}
          {totalPendingAmount > 0 && (
            <div className="glass-card" style={{
              ...cardStyle,
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), transparent)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚠️ Pending Payments
                </h3>
                <button onClick={onViewOrders} style={{
                  fontSize: '12px',
                  color: '#EF4444',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.filter(o => o.totalAmount > o.amountPaid).slice(0, 3).map(order => (
                  <div key={order.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.2)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-primary)' }}>{order.customerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(order.eventDate)}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#EF4444', fontSize: '16px' }}>
                      {formatCurrency(order.totalAmount - order.amountPaid)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Enquiries */}
          {newEnquiries.length > 0 && (
            <div className="glass-card" style={{ ...cardStyle, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  📬 New Enquiries
                </h3>
                <button onClick={onViewEnquiries} style={{
                  fontSize: '12px',
                  color: 'var(--gold)',
                  background: 'none',
                  border: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}>
                  View All
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {newEnquiries.map(enquiry => (
                  <div key={enquiry.id} style={{
                    padding: '12px',
                    background: 'var(--dark-lighter)',
                    borderRadius: '8px',
                    borderLeft: '3px solid #3b82f6'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{enquiry.customerName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      📱 {enquiry.phone} • {formatDate(enquiry.eventDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming This Week */}
          {upcomingEvents.length > 0 && (
            <div className="glass-card" style={{ ...cardStyle, padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '16px' }}>
                🚀 Upcoming This Week
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingEvents.map(order => (
                  <div key={order.id} style={{
                    padding: '12px',
                    background: 'var(--dark-lighter)',
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--gold)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{order.customerName}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(order.eventDate)}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {order.serviceType === 'pre-pleat' ? '✂️ Pre-Pleat' :
                        order.serviceType === 'drape' ? '✨ Drape' : '📚 Both'} • {order.sareeCount} sarees
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Order, Enquiry } from '../types';
import { formatCurrency, formatDate } from '../utils';

export const Dashboard: React.FC<{
  orders: Order[];
  enquiries: Enquiry[];
  cardStyle: React.CSSProperties;
  onViewOrders: () => void;
  onViewEnquiries: () => void;
}> = ({ orders, enquiries, cardStyle, onViewOrders, onViewEnquiries }) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // --- Data Calculations ---
  const todayEvents = orders.filter(o => o.eventDate === today).sort((a, b) => a.customerName.localeCompare(b.customerName)); // Sort by name if no time
  const upcomingEvents = orders.filter(o => o.eventDate > today).sort((a, b) => a.eventDate.localeCompare(b.eventDate)).slice(0, 3);

  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'completed');
  const newEnquiries = enquiries.filter(e => e.status === 'new');

  const totalRevenueToday = orders
    .filter(o => o.createdAt.startsWith(today))
    .reduce((sum, o) => sum + (o.amountPaid || 0), 0);

  // Calculate total pending amount
  const totalPendingAmount = orders.reduce((sum, o) => sum + ((o.totalAmount || 0) - (o.amountPaid || 0)), 0);


  // --- Helper Components ---

  const QuickActionButton: React.FC<{ label: string; icon: string; color: string; onClick: () => void }> = ({ label, icon, color, onClick }) => (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`, // Glassy gradient
        border: `1px solid ${color}40`,
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        minWidth: '100px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 15px ${color}30`;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{
        fontSize: '32px',
        background: `rgba(255,255,255,0.1)`,
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 0 20px ${color}40`
      }}>
        {icon}
      </div>
      <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{label}</span>
    </button>
  );

  const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string; subtext?: string }> = ({ label, value, icon, color, subtext }) => (
    <div className="glass-card" style={{
      ...cardStyle,
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        background: `${color}20`,
        color: color,
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{value}</div>
        {subtext && <div style={{ fontSize: '11px', color: color, marginTop: '2px' }}>{subtext}</div>}
      </div>
      {/* Decorative Blur */}
      <div style={{
        position: 'absolute',
        right: '-20px',
        top: '-20px',
        width: '100px',
        height: '100px',
        background: color,
        filter: 'blur(50px)',
        opacity: 0.1,
        pointerEvents: 'none'
      }} />
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>
            Welcome Back, <span style={{ color: 'var(--gold)' }}>Mani Raja</span> 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening today.</p>
        </div>
        <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ color: 'var(--gold)', fontSize: '14px', fontWeight: '600' }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <QuickActionButton
          label="New Order"
          icon="➕"
          color="#F5A623"
          onClick={onViewOrders} // Triggers order list, usually user presses 'N' or FAB. We can wire this to open modal if passed down.
        />
        <QuickActionButton
          label="New Enquiry"
          icon="📝"
          color="#3B82F6"
          onClick={onViewEnquiries}
        />
        <QuickActionButton
          label="Calendar"
          icon="📅"
          color="#8B5CF6"
          onClick={() => { }} // Placeholder or navigation
        />
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard
          label="Expec. Revenue"
          value={formatCurrency(orders.filter(o => o.eventDate === today).reduce((sum, o) => sum + o.totalAmount, 0))}
          icon="💰"
          color="#10B981"
          subtext="From today's events"
        />
        <StatCard
          label="Today's Orders"
          value={todayEvents.length}
          icon="📦"
          color="#F5A623"
          subtext={`${orders.filter(o => o.status === 'completed' && o.eventDate === today).length} completed`}
        />
        <StatCard
          label="Pending Due"
          value={formatCurrency(totalPendingAmount)}
          icon="⏳"
          color="#EF4444"
          subtext={`${orders.filter(o => o.totalAmount > o.amountPaid).length} orders pending`}
        />
        <StatCard
          label="New Enquiries"
          value={newEnquiries.length}
          icon="📬"
          color="#3B82F6"
          subtext="Needs attention"
        />
      </div>

      {/* Main Content Split View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>

        {/* Left Col: Today's Schedule Timeline */}
        <div className="glass-card" style={{ ...cardStyle, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>📅 Today's Schedule</h3>
            <span style={{ background: '#252542', color: 'var(--text-secondary)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px' }}>
              {todayEvents.length} Events
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {todayEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>😴</div>
                <p>No events scheduled for today.</p>
                <button onClick={onViewOrders} style={{ marginTop: '16px', color: 'var(--gold)', background: 'none', border: '1px solid var(--gold)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
                  View All Orders
                </button>
              </div>
            ) : (
              todayEvents.map((order, i) => (
                <div key={order.id} style={{ display: 'flex', gap: '16px', position: 'relative' }}>
                  {/* Timeline Line */}
                  {i !== todayEvents.length - 1 && (
                    <div style={{
                      position: 'absolute',
                      left: '24px',
                      top: '50px',
                      bottom: '-20px',
                      width: '2px',
                      background: 'rgba(255,255,255,0.1)'
                    }} />
                  )}

                  {/* Time / Status Icon */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '16px',
                    background: order.status === 'completed' ? '#10B98120' : '#F5A62320',
                    border: `1px solid ${order.status === 'completed' ? '#10B981' : '#F5A623'}`,
                    color: order.status === 'completed' ? '#10B981' : '#F5A623',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    flexShrink: 0,
                    zIndex: 1
                  }}>
                    {/* Placeholder for Time, or just initial */}
                    {order.customerName.charAt(0)}
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, paddingBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{order.customerName}</h4>
                      <div style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: order.location === 'onsite' ? '#EF444420' : '#3B82F620',
                        color: order.location === 'onsite' ? '#EF4444' : '#3B82F6'
                      }}>
                        {order.location === 'onsite' ? '📍 On-Site' : '🏪 At Shop'}
                      </div>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                      {order.serviceType === 'pre-pleat' ? 'Pre-Pleating' : order.serviceType === 'drape' ? 'Saree Draping' : 'Pleat + Drape'} • {order.sareeCount} Sarees
                    </div>
                    {order.address && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📍 {order.address}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Alerts & Upcoming */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Pending Payments Alert */}
          {pendingOrders.filter(o => o.totalAmount > o.amountPaid).length > 0 && (
            <div className="glass-card" style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ⚠️ Pending Payments
                </h3>
                <button onClick={onViewOrders} style={{ fontSize: '12px', color: '#EF4444', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>View All</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pendingOrders.filter(o => o.totalAmount > o.amountPaid).slice(0, 3).map(order => (
                  <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{order.customerName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatDate(order.eventDate)}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#EF4444' }}>
                      {formatCurrency(order.totalAmount - order.amountPaid)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Tomorrow */}
          <div className="glass-card" style={cardStyle}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--gold)', marginBottom: '16px' }}>
              🚀 Upcoming Tomorrow
            </h3>
            {upcomingEvents.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No events scheduled for tomorrow.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingEvents.map(order => (
                  <div key={order.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--gold)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold' }}>{order.customerName}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(order.eventDate)}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {order.serviceType}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

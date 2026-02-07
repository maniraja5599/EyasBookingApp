import React from 'react';
import { Order, Enquiry } from '../types';
import { formatCurrency } from '../utils';

export const Dashboard: React.FC<{
  orders: Order[];
  enquiries: Enquiry[];
  cardStyle: React.CSSProperties;
  onViewOrders: () => void;
  onViewEnquiries: () => void;
}> = ({ orders, enquiries, cardStyle, onViewOrders, onViewEnquiries }) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const todayEvents = orders.filter(o => o.eventDate === today);
  const tomorrowEvents = orders.filter(o => o.eventDate === tomorrow);
  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'completed');
  const newEnquiries = enquiries.filter(e => e.status === 'new');
  const totalReceived = orders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
  const totalPending = orders.reduce((sum, o) => sum + ((o.totalAmount || 0) - (o.amountPaid || 0)), 0);

  const statCards = [
    { label: 'Pending Orders', value: pendingOrders.length, icon: '📦', color: '#3B82F6', onClick: onViewOrders },
    { label: 'New Enquiries', value: newEnquiries.length, icon: '📋', color: '#F59E0B', onClick: onViewEnquiries },
    { label: 'Amount Received', value: formatCurrency(totalReceived), icon: '💰', color: '#10B981' },
    { label: 'Pending Amount', value: formatCurrency(totalPending), icon: '⏳', color: '#EF4444' },
  ];

  // Calculate weekly data for chart
  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOrders = orders.filter(o => o.eventDate === dateStr).length;
      weekData.push({ day: days[date.getDay()], count: dayOrders, date: dateStr });
    }
    return weekData;
  };
  const weeklyData = getWeeklyData();
  const maxCount = Math.max(...weeklyData.map(d => d.count), 1);

  return (
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '20px',
        color: 'var(--gold)',
      }}>
        🏠 Dashboard
      </h2>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {statCards.map((stat, i) => (
          <div
            key={i}
            onClick={stat.onClick}
            style={{
              ...cardStyle,
              borderLeft: `3px solid ${stat.color}`,
              cursor: stat.onClick ? 'pointer' : 'default',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '20px' }}>{stat.icon}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{stat.label}</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Bookings Chart */}
      <div style={{ ...cardStyle, marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)', marginBottom: '16px' }}>
          📊 This Week's Bookings
        </h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
          {weeklyData.map((day, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%',
                height: `${(day.count / maxCount) * 80}px`,
                minHeight: day.count > 0 ? '8px' : '2px',
                background: day.count > 0 ? 'var(--gold)' : 'var(--border)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
              }} />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{day.day}</span>
              <span style={{ fontSize: '10px', fontWeight: '600', color: day.count > 0 ? 'var(--gold)' : 'var(--text-muted)' }}>
                {day.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Events */}
      <div style={{ ...cardStyle, marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '12px',
          color: 'var(--gold)',
        }}>
          🎯 Today ({todayEvents.length})
        </h3>
        {todayEvents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No events today</p>
        ) : (
          todayEvents.map(order => (
            <div key={order.id} className="glass-card" style={{
              background: 'var(--glass-bg)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '8px',
              borderLeft: '3px solid var(--text-accent)',
            }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{order.customerName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {order.serviceType.toUpperCase()} • {order.sareeCount} sarees • {order.location === 'onsite' ? '📍 On-Site' : '🏪 At Shop'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tomorrow's Events */}
      <div style={{ ...cardStyle, marginBottom: '16px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '16px',
          background: 'var(--accent-gold)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          📅 Tomorrow's Events ({tomorrowEvents.length})
        </h3>
        {tomorrowEvents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No events tomorrow</p>
        ) : (
          tomorrowEvents.map(order => (
            <div key={order.id} className="glass-card" style={{
              background: 'var(--glass-bg)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '8px',
              borderLeft: '3px solid var(--color-info)',
            }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{order.customerName}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {order.serviceType.toUpperCase()} • {order.sareeCount} sarees • {order.location === 'onsite' ? '📍 On-Site' : '🏪 At Shop'}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pending Payments */}
      <div style={cardStyle}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 'bold',
          marginBottom: '16px',
          background: 'var(--accent-gold)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          💳 Pending Payments
        </h3>
        {orders.filter(o => o.totalAmount > o.amountPaid).slice(0, 5).map(order => (
          <div key={order.id} className="glass-card" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--glass-bg)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '8px',
          }}>
            <div>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{order.customerName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{order.phone}</div>
            </div>
            <div style={{
              color: 'var(--color-error)',
              fontWeight: 'bold',
              fontSize: '14px',
            }}>
              {formatCurrency(order.totalAmount - order.amountPaid)}
            </div>
          </div>
        ))}
        {orders.filter(o => o.totalAmount > o.amountPaid).length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No pending payments! 🎉</p>
        )}
      </div>
    </div>
  );
};

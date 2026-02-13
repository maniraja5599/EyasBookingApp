import React, { useState, useEffect } from 'react';
import { CalendarView } from './components/CalendarView';
import { OrderForm } from './components/OrderForm';
import { EnquiryForm } from './components/EnquiryForm';
import { SettingsPanel } from './components/SettingsPanel';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { EnquiryList } from './components/EnquiryList';
import { Order, Enquiry, Settings, Customer } from './types';
import { generateId, formatCurrency, formatDate } from './utils';
import { ReferralReport } from './components/ReferralReport';
import { CustomerReport } from './components/CustomerReport';
import { GlobalSearch } from './components/GlobalSearch';
import { AddCustomerModal } from './components/AddCustomerModal';

import { LayoutDashboard, Package, ClipboardList, Users, Megaphone, Calendar, Settings as SettingsIcon, Search, Palette, Bell } from 'lucide-react';
import { CalendarShowcase } from './components/CalendarShowcase';


import logo from './assets/eyas-logo.svg';

// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'enquiries' | 'customers' | 'referrals' | 'calendar' | 'settings' | 'showcase'>('dashboard');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [initialEventDate, setInitialEventDate] = useState<string>('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('all');

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('eyas_theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('eyas_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }, [theme]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('eyas_orders');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    try {
      const saved = localStorage.getItem('eyas_enquiries');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('eyas_customers');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('eyas_customers', JSON.stringify(customers));
  }, [customers]);

  const [lastViewedCount, setLastViewedCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('eyas_lastViewedCount') || '0');
  });

  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('eyas_settings');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      businessName: 'Eyas Saree Drapist',
      phone: '',
      address: 'Namakkal',
      instagram: '@eyas_sareedrapist_namakkal',
      prePleatRate: 150,
      drapeRate: 500,
      bothRate: 600,
      customChargeHeads: ['Travel', 'Urgent', 'Extra Pleats'],
      functionTypes: ['Marriage', 'Baby Shower', 'Regular Use', 'Puberty Function', 'Guest Drape'],
      pleatTypes: ['Box Folding', 'Pluffy Pleat', 'Center Pleat', 'Mermaid Drape', 'Cowboy Drape'],
      referralSources: ['Instagram', 'Old Customer', 'Makeup Artist', 'Family/Friend', 'Other'],
      makeupArtists: [], // Default empty list
      ...parsed // Overwrite defaults with saved values, but keep defaults for missing keys
    };
  });

  useEffect(() => {
    localStorage.setItem('eyas_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('eyas_enquiries', JSON.stringify(enquiries));
  }, [enquiries]);

  useEffect(() => {
    localStorage.setItem('eyas_settings', JSON.stringify(settings));
  }, [settings]);

  const handleSaveOrder = (order: Order) => {
    if (editingOrder) {
      setOrders(orders.map(o => o.id === order.id ? order : o));
    } else {
      setOrders([...orders, { ...order, id: generateId(), createdAt: new Date().toISOString() }]);
    }
    // setShowOrderForm(false); // Managed by OrderForm now
    // setEditingOrder(null);
  };

  const handleSaveEnquiry = (enquiry: Enquiry) => {
    if (editingEnquiry) {
      setEnquiries(enquiries.map(e => e.id === enquiry.id ? enquiry : e));
    } else {
      setEnquiries([...enquiries, { ...enquiry, id: generateId(), createdAt: new Date().toISOString() }]);
    }
    setShowEnquiryForm(false);
    setEditingEnquiry(null);
  };

  const convertEnquiryToOrder = (enquiry: Enquiry) => {
    const rate = enquiry.serviceType === 'pre-pleat' ? settings.prePleatRate :
      enquiry.serviceType === 'drape' ? settings.drapeRate : settings.bothRate;
    const baseAmount = rate * enquiry.sareeCount;

    const newOrder: Order = {
      id: generateId(),
      customerName: enquiry.customerName,
      phone: enquiry.phone,
      gps: enquiry.gps,
      address: '',
      serviceType: enquiry.serviceType,
      location: enquiry.location,
      sareeCount: enquiry.sareeCount,
      sareeReceivedInAdvance: false,
      sareeReceivedDate: '',
      eventDate: enquiry.eventDate,
      deliveryDate: '',
      collectionDate: '',
      baseAmount: baseAmount,
      additionalCharges: [],
      totalAmount: baseAmount,
      payments: [],
      amountPaid: 0,
      status: 'pending',
      notes: enquiry.notes,
      createdAt: new Date().toISOString()
    };

    setOrders([...orders, newOrder]);
    setEnquiries(enquiries.map(e => e.id === enquiry.id ? { ...e, status: 'converted' as const } : e));
  };


  // Common button style - Professional
  const btnPrimary: React.CSSProperties = {
    background: 'var(--gold)',
    color: 'var(--dark)',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };

  const btnSecondary: React.CSSProperties = {
    background: 'var(--dark-lighter)',
    color: 'var(--text-primary)',
    fontWeight: '600',
    padding: '12px 24px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--border)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--dark-light)',
    borderRadius: 'var(--radius-lg)',
    padding: '16px',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow)',
    transition: 'all 0.2s ease',
  };




  // Navigation items - Simple and clean
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, color: '#F5A623' },
    { id: 'orders', label: 'Orders', icon: Package, color: '#4A90E2' },
    { id: 'enquiries', label: 'Enquiries', icon: ClipboardList, color: '#BD10E0' },
    { id: 'customers', label: 'Customers', icon: Users, color: '#50E3C2' },
    { id: 'referrals', label: 'Referrals', icon: Megaphone, color: '#F8E71C' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: '#E04F5F' },
    { id: 'showcase', label: 'Styles', icon: Palette, color: '#ffffff' }, // New Showcase Tab
    { id: 'settings', label: 'Settings', icon: SettingsIcon, color: '#9B9B9B' },
  ];

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'n': // New order/enquiry
          e.preventDefault();
          if (activeTab === 'enquiries') setShowEnquiryForm(true);
          else setShowOrderForm(true);
          break;
        case 'escape': // Close modals
          setShowOrderForm(false);
          setShowEnquiryForm(false);
          break;
        case '1': setActiveTab('dashboard'); break;
        case '2': setActiveTab('orders'); break;
        case '3': setActiveTab('enquiries'); break;
        case '4': setActiveTab('customers'); break;
        case '5': setActiveTab('calendar'); break;
        case '6': setActiveTab('showcase'); break;
        case '7': setActiveTab('settings'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Notification calculations
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const todayEvents = orders.filter(o => o.eventDate === today);
  const tomorrowEvents = orders.filter(o => o.eventDate === tomorrow);
  const pendingPayments = orders.filter(o => o.totalAmount > o.amountPaid);
  const newEnquiriesList = enquiries.filter(e => e.status === 'new');
  const overdueCollections = orders.filter(o => o.collectionDate < today && o.status !== 'delivered' && o.status !== 'completed');

  const totalNotifications = todayEvents.length + tomorrowEvents.length + pendingPayments.length + newEnquiriesList.length + overdueCollections.length;
  const unreadCount = Math.max(0, totalNotifications - lastViewedCount);

  // Auto-sync lastViewed if total decreases (so we don't block new notifications)
  useEffect(() => {
    if (totalNotifications < lastViewedCount) {
      setLastViewedCount(totalNotifications);
      localStorage.setItem('eyas_lastViewedCount', totalNotifications.toString());
    }
  }, [totalNotifications, lastViewedCount]);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setLastViewedCount(totalNotifications);
      localStorage.setItem('eyas_lastViewedCount', totalNotifications.toString());
      setNotificationFilter('all');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'transparent',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Modern Gradient with Glow */}
      <header style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(10px)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--header-border-color)',
        boxShadow: '0 4px 30px var(--bar-shadow)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img
            src={logo}
            alt="Eyas Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--gold)',
            }}
          />
          <div>
            <h1 style={{
              fontSize: '22px', // Reduced per request
              fontWeight: 'bold',
              color: 'var(--header-text)',
              margin: 0,
              fontFamily: '"Kaushan Script", cursive',
              letterSpacing: '0.5px',
            }}>
              Eyas Saree Drapist
            </h1>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, letterSpacing: '1px', textTransform: 'uppercase' }}>Namakkal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--gold)',
              transition: 'all 0.2s ease',
            }}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            onClick={() => setShowSearch(true)}
            style={{
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              // boxShadow: '0 2px 4px rgba(0,0,0,0.2)', // Removed box shadow to match other icon
              color: 'var(--text-secondary)', // Match theme
              padding: 0,
            }}
            title="Search Customers"
          >
            <Search size={20} strokeWidth={2} />
          </button>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleBellClick}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: unreadCount > 0 ? '#EF4444' : 'var(--text-secondary)',
                padding: 0,
                position: 'relative',
                animation: unreadCount > 0 ? 'pulse 1.5s infinite' : 'none',
                transition: 'all 0.3s ease'
              }}
              title="Notifications"
            >
              <Bell size={20} strokeWidth={unreadCount > 0 ? 2.5 : 2} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#EF4444',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '2px 5px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  minWidth: '18px',
                  textAlign: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  border: '1px solid var(--header-bg)'
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowNotifications(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                />

                {/* Dropdown */}
                <div style={{
                  position: 'absolute',
                  top: '45px',
                  right: '0',
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: 'var(--dark-light)',
                  borderRadius: '16px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  border: '1px solid var(--border)',
                  zIndex: 1000,
                  animation: 'slideDown 0.2s ease-out'
                }}>
                  <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        🔔 Notifications
                      </h3>
                      {totalNotifications > 0 && (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {totalNotifications} New
                        </span>
                      )}
                    </div>

                    {/* Filter Chips */}
                    <div className="no-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                      {['all', 'events', 'payments', 'enquiries', 'overdue'].map(f => (
                        <button
                          key={f}
                          onClick={(e) => { e.stopPropagation(); setNotificationFilter(f); }}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            border: notificationFilter === f ? '1px solid var(--gold)' : '1px solid var(--border)',
                            background: notificationFilter === f ? 'var(--gold)' : 'var(--dark-lighter)',
                            color: notificationFilter === f ? '#000' : 'var(--text-secondary)',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            textTransform: 'capitalize'
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '8px' }}>
                    {totalNotifications === 0 ? (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                        <p style={{ fontSize: '14px', fontWeight: '600' }}>All caught up!</p>
                        <p style={{ fontSize: '12px' }}>No new notifications</p>
                      </div>
                    ) : (
                      <>
                        {/* Today's Events */}
                        {(notificationFilter === 'all' || notificationFilter === 'events') && todayEvents.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                              📅 Today's Events ({todayEvents.length})
                            </div>
                            {todayEvents.slice(0, 3).map(order => (
                              <div
                                key={order.id}
                                onClick={() => { setActiveTab('orders'); setShowNotifications(false); }}
                                style={{
                                  padding: '12px',
                                  background: 'rgba(59, 130, 246, 0.1)',
                                  borderRadius: '8px',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  borderLeft: '3px solid #3b82f6',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                              >
                                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{order.customerName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.serviceType} • {order.sareeCount} sarees</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Tomorrow's Events */}
                        {(notificationFilter === 'all' || notificationFilter === 'events') && tomorrowEvents.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                              ⏰ Tomorrow ({tomorrowEvents.length})
                            </div>
                            {tomorrowEvents.slice(0, 2).map(order => (
                              <div
                                key={order.id}
                                onClick={() => { setActiveTab('orders'); setShowNotifications(false); }}
                                style={{
                                  padding: '12px',
                                  background: 'rgba(243, 156, 18, 0.1)',
                                  borderRadius: '8px',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  borderLeft: '3px solid #f39c12',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(243, 156, 18, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(243, 156, 18, 0.1)'}
                              >
                                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{order.customerName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{order.serviceType} • {order.sareeCount} sarees</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Pending Payments */}
                        {(notificationFilter === 'all' || notificationFilter === 'payments') && pendingPayments.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                              💰 Pending Payments ({pendingPayments.length})
                            </div>
                            {pendingPayments.slice(0, 2).map(order => (
                              <div
                                key={order.id}
                                onClick={() => { setActiveTab('orders'); setShowNotifications(false); }}
                                style={{
                                  padding: '12px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  borderRadius: '8px',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  borderLeft: '3px solid #EF4444',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <div>
                                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{order.customerName}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Due: {formatCurrency(order.totalAmount - order.amountPaid)}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New Enquiries */}
                        {(notificationFilter === 'all' || notificationFilter === 'enquiries') && newEnquiriesList.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                              📬 New Enquiries ({newEnquiriesList.length})
                            </div>
                            {newEnquiriesList.slice(0, 2).map(enquiry => (
                              <div
                                key={enquiry.id}
                                onClick={() => { setActiveTab('enquiries'); setShowNotifications(false); }}
                                style={{
                                  padding: '12px',
                                  background: 'rgba(155, 89, 182, 0.1)',
                                  borderRadius: '8px',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  borderLeft: '3px solid #9b59b6',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(155, 89, 182, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(155, 89, 182, 0.1)'}
                              >
                                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{enquiry.customerName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{enquiry.phone}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Overdue Collections */}
                        {(notificationFilter === 'all' || notificationFilter === 'overdue') && overdueCollections.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                              ⚠️ Overdue Collections ({overdueCollections.length})
                            </div>
                            {overdueCollections.slice(0, 2).map(order => (
                              <div
                                key={order.id}
                                onClick={() => { setActiveTab('orders'); setShowNotifications(false); }}
                                style={{
                                  padding: '12px',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  borderRadius: '8px',
                                  marginBottom: '4px',
                                  cursor: 'pointer',
                                  borderLeft: '3px solid #EF4444',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                              >
                                <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px' }}>{order.customerName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Collection was: {formatDate(order.collectionDate)}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Bottom Sheet Menu - Floating Pop-up Style */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1050, // Higher than nav
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        />
      )}
      <aside style={{
        position: 'fixed',
        left: '50%',
        transform: sidebarOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
        bottom: '90px',
        width: '90%', // Ensure it takes up space for wide layout
        maxWidth: '600px', // Prevent it from being weirdly huge on desktop
        zIndex: 1100, // Above overlay and nav
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        opacity: sidebarOpen ? 1 : 0,
        pointerEvents: sidebarOpen ? 'auto' : 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}>
        {/* Helper Label */}
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          padding: '4px 12px',
          borderRadius: '20px',
          color: 'white',
          fontSize: '10px',
          opacity: sidebarOpen ? 1 : 0,
          transform: sidebarOpen ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s 0.1s',
          marginBottom: '5px'
        }}>
          Quick Actions
        </div>

        {/* Menu Items - Floating Bubbles */}
        <nav style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '15px',
          width: '100%', // Use container width
          padding: '0 10px' // Slightly tighter padding
        }}>
          {navItems.map((item, index) => {
            // Define item specific colors for the menu view
            const itemColor = item.color;

            const Icon = item.icon;

            // Staggered animation delay based on index
            const transitionDelay = sidebarOpen ? `${index * 0.05}s` : '0s';

            const isDark = theme === 'dark';

            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                style={{
                  width: '60px',
                  height: '60px',
                  background: activeTab === item.id
                    ? (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.05)')
                    : (isDark ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)'),
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${activeTab === item.id ? itemColor : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)')}`,
                  borderRadius: '50%', // Circle bubbles
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transitionDelay: transitionDelay,
                  boxShadow: activeTab === item.id
                    ? `0 0 15px ${itemColor}${isDark ? '60' : '40'}`
                    : (isDark ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.1)'),
                  transform: sidebarOpen ? 'scale(1)' : 'scale(0)',
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ color: itemColor }}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span style={{
                  fontSize: '8px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                  marginTop: '2px'
                }}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '20px',
        paddingBottom: '90px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            enquiries={enquiries}
            cardStyle={cardStyle}
            onViewOrders={() => setActiveTab('orders')}
            onViewEnquiries={() => setActiveTab('enquiries')}
          />
        )}

        {activeTab === 'orders' && (
          <OrderList
            orders={orders}
            settings={settings}
            cardStyle={cardStyle}
            btnPrimary={btnPrimary}
            onEdit={(order) => { setEditingOrder(order); setShowOrderForm(true); }}
            onDelete={(id) => setOrders(orders.filter(o => o.id !== id))}
            onUpdateStatus={(id, status) => setOrders(orders.map(o => o.id === id ? { ...o, status } : o))}
            onAddPayment={(id, payment) => {
              setOrders(orders.map(o => {
                if (o.id === id) {
                  const newPayments = [...o.payments, payment];
                  const newAmountPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
                  return { ...o, payments: newPayments, amountPaid: newAmountPaid };
                }
                return o;
              }));
            }}
          />
        )}

        {activeTab === 'enquiries' && (
          <EnquiryList
            enquiries={enquiries}
            cardStyle={cardStyle}
            btnPrimary={btnPrimary}
            btnSecondary={btnSecondary}
            onEdit={(enquiry) => { setEditingEnquiry(enquiry); setShowEnquiryForm(true); }}
            onDelete={(id) => setEnquiries(enquiries.filter(e => e.id !== id))}
            onConvert={(enquiry) => convertEnquiryToOrder(enquiry)}
            onNew={() => { setEditingEnquiry(null); setShowEnquiryForm(true); }}
          />
        )}

        {activeTab === 'customers' && (
          <CustomerReport
            customers={customers}
            orders={orders}
            enquiries={enquiries}
            cardStyle={cardStyle}
            onViewOrder={(order) => {
              setEditingOrder(order);
              setShowOrderForm(true);
            }}
            onAddCustomer={() => setShowAddCustomer(true)}
          />
        )}

        {activeTab === 'referrals' && (
          <ReferralReport customers={customers} cardStyle={cardStyle} />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            orders={orders}
            enquiries={enquiries}
            onEditOrder={(order) => { setEditingOrder(order); setShowOrderForm(true); }}
            onEditEnquiry={(enquiry) => { setEditingEnquiry(enquiry); setShowEnquiryForm(true); }}
            onDeleteOrder={(orderId) => setOrders(orders.filter(o => o.id !== orderId))}
            onDeleteEnquiry={(enquiryId) => setEnquiries(enquiries.filter(e => e.id !== enquiryId))}
            onNewBooking={(date) => {
              setEditingOrder(null);
              // date is a Date object, format it to YYYY-MM-DD
              const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              setInitialEventDate(dateString);
              setShowOrderForm(true);
            }}
          />
        )}

        {activeTab === 'showcase' && (
          <CalendarShowcase orders={orders} enquiries={enquiries} />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            orders={orders}
            enquiries={enquiries}
            cardStyle={cardStyle}
            btnPrimary={btnPrimary}
            onSave={setSettings}
            onRestoreData={(data) => {
              if (data.orders) setOrders(data.orders);
              if (data.enquiries) setEnquiries(data.enquiries);
              if (data.settings) setSettings(data.settings);
            }}
          />
        )}
      </main>

      {/* Bottom Navigation - Clean Professional */}
      {/* Bottom Navigation - Docked Glass Panel */}
      {!showOrderForm && !showEnquiryForm && (
        <nav style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          background: 'var(--nav-bg)', // Glass effect
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--nav-border)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end', // Align items to bottom for better click area
          padding: '12px 24px 20px 24px', // Extra padding bottom for iPhone home indicator
          zIndex: 1000,
          transition: 'all 0.3s ease',
          borderRadius: '24px 24px 0 0' // Subtle curve at top
        }}>
          {['dashboard', 'orders'].map(id => {
            const item = navItems.find(i => i.id === id);
            if (!item) return null;
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? item.color : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '0 12px',
                  flex: 1
                }}
              >
                <div style={{
                  transition: 'all 0.3s',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  filter: isActive ? `drop-shadow(0 0 8px ${item.color}40)` : 'none'
                }}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '500', opacity: isActive ? 1 : 0.7 }}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Center Menu Button (Integrated Pop-up) */}
          <div style={{ position: 'relative', top: '-28px', flex: 0.8, display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'linear-gradient(135deg, var(--gold) 0%, #E09000 100%)',
                border: '4px solid var(--bg-modal-solid)', // Match page bg to simulate cutout
                borderRadius: '50%',
                width: '64px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '28px',
                boxShadow: '0 8px 20px rgba(245, 166, 35, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
            </button>
          </div>

          {['enquiries', 'calendar'].map(id => {
            const item = navItems.find(i => i.id === id);
            if (!item) return null;
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? item.color : 'var(--text-secondary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '0 12px',
                  flex: 1
                }}
              >
                <div style={{
                  transition: 'all 0.3s',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  filter: isActive ? `drop-shadow(0 0 8px ${item.color}40)` : 'none'
                }}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: isActive ? '600' : '500', opacity: isActive ? 1 : 0.7 }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}



      {/* Order Form Modal */}
      {
        showOrderForm && (
          <OrderForm
            order={editingOrder}
            initialEventDate={initialEventDate}
            settings={settings}
            customers={customers}
            setCustomers={setCustomers}
            orders={orders}
            onSave={handleSaveOrder}
            onSettingsUpdate={setSettings}
            onClose={() => { setShowOrderForm(false); setEditingOrder(null); setInitialEventDate(''); }}
          />
        )
      }

      {/* Enquiry Form Modal */}
      {
        showEnquiryForm && (
          <EnquiryForm
            enquiry={editingEnquiry}
            customers={customers}
            setCustomers={setCustomers}
            enquiries={enquiries}
            onSave={handleSaveEnquiry}
            onClose={() => { setShowEnquiryForm(false); setEditingEnquiry(null); }}
          />
        )
      }

      {/* Global Search Modal */}
      {showSearch && (
        <GlobalSearch
          orders={orders}
          enquiries={enquiries}
          customers={customers}
          onClose={() => setShowSearch(false)}
          onViewOrder={(order) => {
            setShowSearch(false);
            setEditingOrder(order);
            setShowOrderForm(true);
          }}
        />
      )}
      {/* Add Customer Modal */}
      {showAddCustomer && (
        <AddCustomerModal
          onSave={(newCustomer) => {
            setCustomers([...customers, newCustomer]);
            setShowAddCustomer(false);
          }}
          onClose={() => setShowAddCustomer(false)}
        />
      )}
    </div>
  );
};

export default App;

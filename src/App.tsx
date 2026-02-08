import React, { useState, useEffect } from 'react';
import { CalendarView } from './components/CalendarView';
import { OrderForm } from './components/OrderForm';
import { EnquiryForm } from './components/EnquiryForm';
import { SettingsPanel } from './components/SettingsPanel';
import { Dashboard } from './components/Dashboard';
import { OrderList } from './components/OrderList';
import { EnquiryList } from './components/EnquiryList';
import { Order, Enquiry, Settings, Customer } from './types';
import { generateId } from './utils';
import { ReferralReport } from './components/ReferralReport';
import { CustomerReport } from './components/CustomerReport';

// ... (existing imports)


import logo from './assets/eyas-logo.svg';

// Main App Component
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'enquiries' | 'customers' | 'referrals' | 'calendar' | 'settings'>('dashboard');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editingEnquiry, setEditingEnquiry] = useState<Enquiry | null>(null);
  const [initialEventDate, setInitialEventDate] = useState<string>('');

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
    const saved = localStorage.getItem('eyas_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const saved = localStorage.getItem('eyas_enquiries');
    return saved ? JSON.parse(saved) : [];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('eyas_customers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('eyas_customers', JSON.stringify(customers));
  }, [customers]);

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


  // Styled Icon Component - Clean design
  const Icon: React.FC<{ symbol: string; size?: number }> = ({ symbol, size = 24 }) => (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${size * 0.7}px`,
    }}>
      {symbol}
    </div>
  );

  // Navigation items - Simple and clean
  const navItems = [
    { id: 'dashboard', label: 'Home', symbol: '🏠' },
    { id: 'orders', label: 'Orders', symbol: '📦' },
    { id: 'enquiries', label: 'Enquiries', symbol: '📋' },
    { id: 'customers', label: 'Customers', symbol: '👥' },
    { id: 'referrals', label: 'Referrals', symbol: '📢' },
    { id: 'calendar', label: 'Calendar', symbol: '📅' },
    { id: 'settings', label: 'Settings', symbol: '⚙️' },
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
        case '6': setActiveTab('settings'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);


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
            onClick={() => {
              setEditingOrder(null);
              setInitialEventDate('');
              setShowOrderForm(true);
            }}
            style={{
              background: 'var(--gold)',
              color: 'var(--dark)',
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
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              padding: 0,
            }}
            title="New Order"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 2V6" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 2V6" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 10H21" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 14V18" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 16H14" stroke="var(--text-inverse)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      {/* Bottom Sheet Menu */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: '70px',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200,
          }}
        />
      )}
      <aside style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: sidebarOpen ? '70px' : '-100%',
        zIndex: 210,
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
        borderTop: '1px solid var(--gold)',
        borderRadius: '24px 24px 0 0',
        boxShadow: '0 -8px 40px var(--bar-shadow)',
        transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        maxHeight: '40vh', // Reduced height per request
        overflow: 'hidden',
      }}>
        {/* Handle Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '12px',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            background: 'var(--text-muted)',
            borderRadius: '2px'
          }} />
        </div>

        {/* Menu Title */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: 'var(--gold)' }}>Menu</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >✕</button>
        </div>

        {/* Menu Items - Grid Layout */}
        <nav style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
              style={{
                padding: '12px 6px',
                background: activeTab === item.id ? 'rgba(245, 166, 35, 0.15)' : 'var(--dark-lighter)',
                color: activeTab === item.id ? 'var(--gold)' : 'var(--text-primary)',
                border: activeTab === item.id ? '2px solid var(--gold)' : '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: activeTab === item.id ? '600' : '500',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.symbol}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Developer Footer */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid rgba(245, 166, 35, 0.3)',
          background: 'rgba(0,0,0,0.3)',
          textAlign: 'center',
        }}>
          <a
            href="https://www.instagram.com/maniraja__/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--gold)',
              fontSize: '11px',
              fontWeight: '500',
              textDecoration: 'none',
            }}
          >
            Designed & Developed by <span style={{ fontWeight: '700', color: '#FFD54F' }}>Mani Raja</span>
          </a>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
            © {new Date().getFullYear()} Eyas Saree Drapist
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        padding: '20px',
        paddingBottom: '90px',
        overflowY: 'auto',
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
      <nav style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        background: 'var(--bar-bg)',
        borderTop: '1px solid var(--gold)',
        boxShadow: '0 -4px 30px var(--bar-shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 16px',
        zIndex: 100,
      }}>
        {/* Left Group */}
        {['dashboard', 'orders'].map(id => {
          const item = navItems.find(i => i.id === id);
          if (!item) return null;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                background: activeTab === item.id ? 'var(--gold)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: activeTab === item.id ? 'var(--dark)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '8px 12px',
                minWidth: '60px',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon symbol={item.symbol} size={24} />
              <span style={{ fontSize: '10px', fontWeight: activeTab === item.id ? '600' : 'normal' }}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: sidebarOpen ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
            border: '1px solid var(--gold)',
            borderRadius: '50%',
            color: sidebarOpen ? 'var(--dark)' : 'var(--gold)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            cursor: 'pointer',
            width: '56px',
            height: '56px',
            marginTop: '-28px', // Floating effect
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            transform: sidebarOpen ? 'rotate(90deg)' : 'none',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: 110,
          }}
        >
          <Icon symbol={sidebarOpen ? "✕" : "☰"} size={26} />
        </button>

        {/* Right Group */}
        {['enquiries', 'calendar'].map(id => {
          const item = navItems.find(i => i.id === id);
          if (!item) return null;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              style={{
                background: activeTab === item.id ? 'var(--gold)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius)',
                color: activeTab === item.id ? 'var(--dark)' : 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                padding: '8px 12px',
                minWidth: '60px',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon symbol={item.symbol} size={24} />
              <span style={{ fontSize: '10px', fontWeight: activeTab === item.id ? '600' : 'normal' }}>
                {item.label}
              </span>
            </button>
          );
        })}

      </nav>



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
    </div>
  );
};

export default App;

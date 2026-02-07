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
    return saved ? JSON.parse(saved) : {
      businessName: 'Eyas Saree Drapist',
      phone: '',
      address: 'Namakkal',
      instagram: '@eyas_sareedrapist_namakkal',
      prePleatRate: 150,
      drapeRate: 500,
      bothRate: 600,
      customChargeHeads: ['Travel', 'Urgent', 'Extra Pleats']
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
      background: '#1a1a2e',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Modern Gradient with Glow */}
      <header style={{
        background: 'var(--dark-light)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'var(--dark-lighter)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'block',
              borderRadius: 'var(--radius)',
              padding: '8px 12px',
              transition: 'all 0.2s ease',
            }}
          >
            ☰
          </button>
          <img
            src={logo}
            alt="Eyas Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
          <div>
            <h1 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--gold)',
              margin: 0,
            }}>
              Eyas Saree Drapist
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>Namakkal</p>
          </div>
        </div>
        <a
          href="https://www.instagram.com/eyas_sareedrapist_namakkal/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--gold)',
            fontSize: '22px',
            textDecoration: 'none',
          }}
        >
          📸
        </a>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar - Glass Effect */}
        <aside className="animate-slideIn" style={{
          width: sidebarOpen ? '280px' : '0',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: '77px',
          left: 0,
          bottom: '70px',
          zIndex: 90,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.3)' : 'none',
        }}>
          <nav style={{ padding: '20px', flex: 1 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSidebarOpen(false); }}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  background: activeTab === item.id ? 'linear-gradient(90deg, rgba(245, 166, 35, 0.15) 0%, transparent 100%)' : 'transparent',
                  color: activeTab === item.id ? 'var(--gold)' : 'var(--text-secondary)',
                  border: 'none',
                  borderLeft: activeTab === item.id ? '4px solid var(--gold)' : '4px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '15px',
                  fontWeight: activeTab === item.id ? '600' : '500',
                  marginBottom: '4px',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  borderRadius: '0 8px 8px 0',
                }}
              >
                <span style={{ fontSize: '20px' }}>{item.symbol}</span>
                {item.label}
              </button>
            ))}
          </nav>

          {/* Developer Footer */}
          <div style={{
            padding: '24px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Designed & Developed by
            </p>
            <a
              href="https://www.instagram.com/maniraja__/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--gold)',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                marginBottom: '16px',
              }}
            >
              <span>👨‍💻 Mani Raja</span>
              <span style={{ fontSize: '12px' }}>↗</span>
            </a>

            <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              © {new Date().getFullYear()} Eyas Saree Drapist.<br />
              All rights reserved.
            </div>
          </div>
        </aside>

        {/* Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: 'fixed',
              top: '77px',
              left: '250px',
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 80,
            }}
          />
        )}

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
              onNewBooking={(_date) => {
                setEditingOrder(null);
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
      </div>

      {/* Bottom Navigation - Clean Professional */}
      <nav style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        right: '0',
        background: 'var(--dark-light)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        zIndex: 100,
      }}>
        {navItems.filter(i => ['dashboard', 'orders', 'enquiries', 'calendar'].includes(i.id)).map(item => (
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
              flex: 1,
              transition: 'all 0.2s ease',
            }}
          >
            <Icon symbol={item.symbol} size={24} />
            <span style={{ fontSize: '10px', fontWeight: activeTab === item.id ? '600' : 'normal' }}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px 12px',
            flex: 1,
            transition: 'all 0.2s ease',
          }}
        >
          <Icon symbol="☰" size={24} />
          <span style={{ fontSize: '10px' }}>Menu</span>
        </button>
      </nav>



      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          order={editingOrder}
          settings={settings}
          customers={customers}
          setCustomers={setCustomers}
          orders={orders}
          onSave={handleSaveOrder}
          onClose={() => { setShowOrderForm(false); setEditingOrder(null); }}
        />
      )}

      {/* Enquiry Form Modal */}
      {showEnquiryForm && (
        <EnquiryForm
          enquiry={editingEnquiry}
          customers={customers}
          setCustomers={setCustomers}
          enquiries={enquiries}
          onSave={handleSaveEnquiry}
          onClose={() => { setShowEnquiryForm(false); setEditingEnquiry(null); }}
        />
      )}
    </div>
  );
};

export default App;

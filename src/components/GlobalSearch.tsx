import React, { useState, useEffect } from 'react';
import { Order, Enquiry, Customer } from '../types';
import { Search, MapPin, Phone, Calendar, ChevronRight, X } from 'lucide-react';

interface GlobalSearchProps {
    orders: Order[];
    enquiries: Enquiry[];
    customers: Customer[];
    onClose: () => void;
    onViewOrder: (order: Order) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ orders, enquiries, customers, onClose, onViewOrder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSearchResults([]);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const results = customers.filter(c =>
            c.name.toLowerCase().includes(lowerTerm) ||
            c.phone.includes(lowerTerm) ||
            (c.permanentAddress && c.permanentAddress.toLowerCase().includes(lowerTerm))
        );
        setSearchResults(results);
    }, [searchTerm, customers]);

    // Calculate customer metrics
    const getCustomerMetrics = (customerId: string, customerPhone: string) => {
        // Find all orders for this customer (match by phone for robustness)
        const customerOrders = orders.filter(o => o.phone === customerPhone);
        const customerEnquiries = enquiries.filter(e => e.phone === customerPhone);

        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const totalPaid = customerOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
        const totalSarees = customerOrders.reduce((sum, o) => sum + (o.sareeCount || 0), 0);
        const totalPending = totalSpent - totalPaid;

        return { customerOrders, customerEnquiries, totalOrders, totalSpent, totalSarees, totalPending };
    };


    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 1200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '600px',
                background: 'var(--glass-bg)', // Use glass effect for premium look
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                marginBottom: '20px',
                border: '1px solid var(--glass-border)'
            }}>
                <Search size={20} className="text-gray-400 mr-3" style={{ color: 'var(--text-secondary)' }} />
                <input
                    type="text"
                    placeholder="Search by Name, Phone, or Address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        fontSize: '16px',
                        outline: 'none',
                        padding: '8px'
                    }}
                />
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <X size={24} />
                </button>
            </div>

            <div style={{
                width: '100%',
                maxWidth: '600px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingBottom: '20px'
            }}>
                {!selectedCustomer ? (
                    // Search Results List
                    <>
                        {searchResults.length === 0 && searchTerm && (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
                                No customers found matching "{searchTerm}"
                            </div>
                        )}
                        {searchResults.map(customer => {
                            const { totalPending, totalOrders, totalSarees } = getCustomerMetrics(customer.id, customer.phone);
                            return (
                                <div
                                    key={customer.id}
                                    onClick={() => setSelectedCustomer(customer)}
                                    style={{
                                        background: 'var(--dark-light)', // Solid background for cards for readability
                                        borderRadius: '16px',
                                        padding: '16px',
                                        cursor: 'pointer',
                                        border: '1px solid var(--border)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        boxShadow: 'var(--shadow)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--gold) 0%, #E09000 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {customer.name}
                                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'normal', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>
                                                    {totalOrders} Orders • {totalSarees} Sarees
                                                </span>
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Phone size={10} /> {customer.phone}
                                                </p>
                                                {customer.permanentAddress && (
                                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <MapPin size={10} /> {customer.permanentAddress}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        {totalPending > 0 && (
                                            <span style={{
                                                display: 'block',
                                                color: 'var(--error)',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                marginBottom: '4px'
                                            }}>
                                                ₹{totalPending} Pending
                                            </span>
                                        )}
                                        <ChevronRight size={16} style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </>
                ) : (
                    // Customer Detail View
                    (() => {
                        const { customerOrders, customerEnquiries, totalSpent, totalPending } = getCustomerMetrics(selectedCustomer.id, selectedCustomer.phone);
                        return (
                            <div style={{ animation: 'slideIn 0.3s ease-out' }}>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--gold)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        marginBottom: '16px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                >
                                    <ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Results
                                </button>

                                {/* Profile Header */}
                                <div style={{
                                    background: 'var(--glass-bg)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '24px',
                                    padding: '24px',
                                    border: '1px solid var(--glass-border)',
                                    textAlign: 'center',
                                    marginBottom: '20px',
                                    boxShadow: 'var(--shadow-lg)'
                                }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--gold) 0%, #E09000 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '32px',
                                        margin: '0 auto 16px',
                                        boxShadow: '0 10px 20px rgba(245, 166, 35, 0.3)'
                                    }}>
                                        {selectedCustomer.name.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 style={{ margin: '0 0 8px', color: 'var(--text-primary)', fontSize: '24px' }}>{selectedCustomer.name}</h2>
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '8px' }}>
                                        <Phone size={14} /> {selectedCustomer.phone}
                                    </div>
                                    {selectedCustomer.permanentAddress && (
                                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                            <MapPin size={14} /> {selectedCustomer.permanentAddress}
                                        </div>
                                    )}
                                </div>

                                {/* Metrics Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                    <div style={{ background: 'var(--dark-light)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Business</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--success)' }}>₹{totalSpent}</div>
                                    </div>
                                    <div style={{ background: 'var(--dark-light)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Pending</div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: totalPending > 0 ? 'var(--error)' : 'var(--text-primary)' }}>₹{totalPending}</div>
                                    </div>
                                </div>

                                {/* Order History */}
                                <h3 style={{ color: 'var(--text-primary)', margin: '0 0 12px 8px', fontSize: '16px', fontWeight: 'bold' }}>Order History ({customerOrders.length})</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                    {customerOrders.length > 0 ? customerOrders.map(order => (
                                        <div
                                            key={order.id}
                                            onClick={() => { onClose(); onViewOrder(order); }}
                                            style={{
                                                background: 'var(--dark-light)',
                                                borderRadius: '16px',
                                                padding: '16px',
                                                border: '1px solid var(--border)',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                cursor: 'pointer',
                                                transition: 'transform 0.1s'
                                            }}
                                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
                                                    <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}>
                                                        {new Date(order.eventDate).toLocaleDateString()}
                                                    </span>
                                                    <span style={{
                                                        background: 'var(--bg-secondary)',
                                                        padding: '2px 8px',
                                                        borderRadius: '10px',
                                                        fontSize: '10px',
                                                        color: 'var(--text-secondary)',
                                                        textTransform: 'capitalize',
                                                        fontWeight: '500'
                                                    }}>
                                                        {order.serviceType}
                                                    </span>
                                                </div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                                    {order.sareeCount} Sarees • {order.functionType || 'General'}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '15px' }}>₹{order.totalAmount}</div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: order.amountPaid < order.totalAmount ? 'var(--error)' : 'var(--success)'
                                                }}>
                                                    {order.amountPaid < order.totalAmount ? `Due: ₹${order.totalAmount - order.amountPaid}` : 'Paid'}
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>No orders found</div>
                                    )}
                                </div>

                                {/* Enquiries */}
                                {customerEnquiries.length > 0 && (
                                    <>
                                        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 12px 8px', fontSize: '16px', fontWeight: 'bold' }}>Past Enquiries</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {customerEnquiries.map(enquiry => (
                                                <div
                                                    key={enquiry.id}
                                                    style={{
                                                        background: 'var(--dark-light)',
                                                        borderRadius: '16px',
                                                        padding: '16px',
                                                        border: '1px solid var(--border)',
                                                        opacity: 0.7
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                        <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: '500' }}>
                                                            {new Date(enquiry.eventDate).toLocaleDateString()}
                                                        </span>
                                                        <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '600', textTransform: 'capitalize' }}>{enquiry.status}</span>
                                                    </div>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                                                        {enquiry.serviceType} • {enquiry.sareeCount} Sarees
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ height: '40px' }}></div>
                                    </>
                                )}
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import { Order, Enquiry, Customer } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface CustomerStats {
    customer: Customer;
    totalOrders: number;
    totalEnquiries: number;
    totalSpent: number;
    totalPending: number;
    lastActivity: string;
}

export const CustomerReport: React.FC<{
    customers: Customer[];
    orders: Order[];
    enquiries: Enquiry[];
    cardStyle: React.CSSProperties;
    onViewOrder: (order: Order) => void;
}> = ({ customers, orders, enquiries, cardStyle, onViewOrder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerStats | null>(null);

    // Calculate stats for all customers
    const customerStats: CustomerStats[] = useMemo(() => {
        return customers.map(customer => {
            const customerOrders = orders.filter(o => o.phone === customer.phone);
            const customerEnquiries = enquiries.filter(e => e.phone === customer.phone);

            const totalSpent = customerOrders.reduce((sum, o) => sum + (o.amountPaid || 0), 0);
            const totalPending = customerOrders.reduce((sum, o) => sum + ((o.totalAmount || 0) - (o.amountPaid || 0)), 0);

            // Find last activity date
            const dates = [
                ...customerOrders.map(o => o.createdAt),
                ...customerEnquiries.map(e => e.createdAt),
                customer.createdAt
            ].sort().reverse();

            return {
                customer,
                totalOrders: customerOrders.length,
                totalEnquiries: customerEnquiries.length,
                totalSpent,
                totalPending,
                lastActivity: dates[0] || customer.createdAt
            };
        }).sort((a, b) => b.lastActivity.localeCompare(a.lastActivity)); // Sort by most recent activity
    }, [customers, orders, enquiries]);

    // Filter based on search
    const filteredCustomers = customerStats.filter(stat =>
        stat.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stat.customer.phone.includes(searchTerm)
    );

    const getCustomerHistory = (phone: string) => {
        const historyOrders = orders.filter(o => o.phone === phone).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
        const historyEnquiries = enquiries.filter(e => e.phone === phone).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
        return { historyOrders, historyEnquiries };
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    background: 'var(--gold)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    👥 Customer Report
                </h2>
                <input
                    type="text"
                    placeholder="🔍 Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border)',
                        padding: '10px 16px',
                        borderRadius: 'var(--radius)',
                        color: 'var(--text-primary)',
                        width: '300px',
                        fontSize: '14px'
                    }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {filteredCustomers.map(stat => (
                    <div
                        key={stat.customer.id}
                        onClick={() => setSelectedCustomer(stat)}
                        className="glass-card"
                        style={{
                            ...cardStyle,
                            cursor: 'pointer',
                            marginBottom: 0,
                            boxShadow: 'var(--shadow-sm)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                    {stat.customer.name}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>📱 {stat.customer.phone}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>LTV</div>
                                <div style={{ fontWeight: 'bold', color: 'var(--gold)', fontSize: '16px' }}>
                                    {formatCurrency(stat.totalSpent)}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '13px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Orders: </span>
                                <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{stat.totalOrders}</span>
                            </div>
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>Pending: </span>
                                <span style={{ fontWeight: 'bold', color: stat.totalPending > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                                    {formatCurrency(stat.totalPending)}
                                </span>
                            </div>
                        </div>
                        {stat.totalPending > 0 && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                borderWidth: '0 40px 40px 0',
                                borderColor: 'transparent var(--color-error) transparent transparent'
                            }}>
                                <div style={{ position: 'absolute', top: '6px', right: '-34px', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}>!</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredCustomers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <p>No customers found matching "{searchTerm}"</p>
                </div>
            )}

            {/* Detail Modal */}
            {selectedCustomer && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px'
                }} onClick={() => setSelectedCustomer(null)}>
                    <div
                        className="glass-card"
                        style={{ ...cardStyle, width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--gold)' }}>{selectedCustomer.customer.name}</h2>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                    <span>📱 {selectedCustomer.customer.phone}</span>
                                    <span>📍 {selectedCustomer.customer.permanentAddress || 'No Address'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCustomer(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '24px', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Spent</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-success)' }}>
                                    {formatCurrency(selectedCustomer.totalSpent)}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Pending Payments</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: selectedCustomer.totalPending > 0 ? 'var(--color-error)' : 'var(--text-primary)' }}>
                                    {formatCurrency(selectedCustomer.totalPending)}
                                </div>
                            </div>
                            <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius)' }}>
                                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Orders</div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                    {selectedCustomer.totalOrders}
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px' }}>📦 Order History</h3>

                        {getCustomerHistory(selectedCustomer.customer.phone).historyOrders.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '12px', textAlign: 'left' }}>Service</th>
                                            <th style={{ padding: '12px', textAlign: 'center' }}>Sarees</th>
                                            <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                                            <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                                            <th style={{ padding: '12px', textAlign: 'center' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {getCustomerHistory(selectedCustomer.customer.phone).historyOrders.map(order => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '12px' }}>{formatDate(order.eventDate)}</td>
                                                <td style={{ padding: '12px', textTransform: 'capitalize' }}>{order.serviceType}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>{order.sareeCount}</td>
                                                <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(order.totalAmount)}</td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px',
                                                        background:
                                                            order.status === 'completed' ? 'var(--color-success)' :
                                                                order.status === 'pending' ? 'var(--color-warning)' :
                                                                    'var(--bg-tertiary)',
                                                        color: '#fff'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCustomer(null);
                                                            onViewOrder(order);
                                                        }}
                                                        style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)' }}
                                                    >
                                                        👁️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No order history.</p>
                        )}

                        {getCustomerHistory(selectedCustomer.customer.phone).historyEnquiries.length > 0 && (
                            <>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', marginTop: '32px' }}>📋 Enquiry History</h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {getCustomerHistory(selectedCustomer.customer.phone).historyEnquiries.map(enquiry => (
                                        <div key={enquiry.id} style={{ background: 'var(--bg-tertiary)', padding: '12px', borderRadius: 'var(--radius)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 'bold' }}>{formatDate(enquiry.eventDate)}</span>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{enquiry.status}</span>
                                            </div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                                {enquiry.serviceType} • {enquiry.sareeCount} sarees
                                            </div>
                                            {enquiry.notes && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>"{enquiry.notes}"</div>}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

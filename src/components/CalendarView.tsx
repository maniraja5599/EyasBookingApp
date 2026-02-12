import { useState, useMemo } from 'react';
import {
    generateCalendarMonth,
    populateCalendarWithBookings,
    getMonthName,
    getDayNames,
    CalendarDay
} from '../utils/calendar';
import { format } from 'date-fns';

interface CalendarViewProps {
    orders: any[];
    enquiries: any[];
    onEditOrder?: (order: any) => void;
    onEditEnquiry?: (enquiry: any) => void;
    onDeleteOrder?: (orderId: string) => void;
    onDeleteEnquiry?: (enquiryId: string) => void;
    onNewBooking?: (date: Date) => void;
}

export function CalendarView({
    orders,
    enquiries,
    onEditOrder,
    onEditEnquiry,
    onDeleteOrder,
    onDeleteEnquiry,
    onNewBooking
}: CalendarViewProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);

    const calendarWeeks = useMemo(() => {
        const weeks = generateCalendarMonth(currentYear, currentMonth);
        return populateCalendarWithBookings(weeks, orders, enquiries);
    }, [currentYear, currentMonth, orders, enquiries]);

    const goToPreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentYear(now.getFullYear());
        setCurrentMonth(now.getMonth());
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'pending': return 'var(--warning)';
            case 'received': return 'var(--info)';
            case 'confirmed': return 'var(--info)';
            case 'in-progress': return '#9b59b6';
            case 'completed': return 'var(--success)';
            case 'delivered': return 'var(--text-muted)';
            default: return 'var(--warning)';
        }
    };

    const totalEventsInMonth = calendarWeeks.reduce((total, week) => {
        return total + week.days.reduce((weekTotal, day) => {
            return weekTotal + day.orders.length + day.enquiries.length;
        }, 0);
    }, 0);

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '16px',
        },
        card: {
            background: 'var(--dark-light)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '16px',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap' as const,
            gap: '12px',
        },
        title: {
            fontSize: '20px',
            fontWeight: '700' as const,
            color: 'var(--gold)',
            margin: 0,
        },
        subtitle: {
            fontSize: '13px',
            color: 'var(--text-secondary)',
            margin: '4px 0 0 0',
        },
        navBtn: {
            background: 'var(--dark-lighter)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '16px',
        },
        todayBtn: {
            background: 'var(--gold)',
            border: 'none',
            color: 'var(--dark)',
            padding: '8px 16px',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontWeight: '600' as const,
            fontSize: '14px',
        },
        calendarGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
        },
        dayHeader: {
            padding: '10px',
            textAlign: 'center' as const,
            color: 'var(--gold)',
            fontSize: '12px',
            fontWeight: '600' as const,
            background: 'var(--dark)',
        },
        dayCell: {
            minHeight: '80px',
            padding: '8px',
            borderRight: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        },
        modal: {
            position: 'fixed' as const,
            inset: 0,
            background: 'var(--modal-backdrop)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
        },
        modalContent: {
            background: 'var(--dark-light)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'hidden' as const,
            border: '1px solid var(--border)',
        },
        modalHeader: {
            padding: '16px',
            background: 'var(--dark)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        eventCard: {
            background: 'var(--dark-lighter)',
            padding: '12px',
            borderRadius: 'var(--radius)',
            marginBottom: '8px',
            border: '1px solid var(--border)',
        },
        actionBtn: {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 'var(--radius)',
            fontSize: '14px',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.card}>
                <div style={styles.header}>
                    <div>
                        <h2 style={styles.title}>
                            📅 {getMonthName(currentMonth)} {currentYear}
                        </h2>
                        <p style={styles.subtitle}>
                            {totalEventsInMonth} event{totalEventsInMonth !== 1 ? 's' : ''} this month
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={goToPreviousMonth} style={styles.navBtn}>
                            ◀
                        </button>
                        <button onClick={goToToday} style={styles.todayBtn}>
                            Today
                        </button>
                        <button onClick={goToNextMonth} style={styles.navBtn}>
                            ▶
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
                {/* Day Names */}
                <div style={styles.calendarGrid}>
                    {getDayNames().map(day => (
                        <div key={day} style={styles.dayHeader}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div>
                    {calendarWeeks.map((week, weekIdx) => (
                        <div key={weekIdx} style={styles.calendarGrid}>
                            {week.days.map((day, dayIdx) => {
                                return (
                                    <div
                                        key={dayIdx}
                                        onClick={() => setSelectedDay(day)}
                                        style={{
                                            ...styles.dayCell,
                                            background: day.isToday
                                                ? 'rgba(245, 166, 35, 0.15)'
                                                : day.isCurrentMonth
                                                    ? 'var(--dark-light)'
                                                    : 'var(--input-bg)',
                                            borderRight: dayIdx === 6 ? 'none' : '1px solid var(--border)',
                                        }}
                                    >
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: day.isToday ? '700' : '500',
                                            color: day.isToday
                                                ? 'var(--gold)'
                                                : day.isCurrentMonth
                                                    ? 'var(--text-primary)'
                                                    : 'var(--text-muted)',
                                            marginBottom: '4px',
                                        }}>
                                            {day.dayOfMonth}
                                            {day.isToday && <span style={{ marginLeft: '4px' }}>●</span>}
                                        </div>

                                        {/* Event Indicators */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {day.orders.slice(0, 2).map((order) => (
                                                <div
                                                    key={order.id}
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        background: getStatusColor(order.status),
                                                        color: order.status === 'pending' ? 'var(--dark)' : '#fff',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    📦 {order.customerName}
                                                </div>
                                            ))}

                                            {day.enquiries.slice(0, 1).map((enquiry) => (
                                                <div
                                                    key={enquiry.id}
                                                    style={{
                                                        fontSize: '10px',
                                                        padding: '2px 4px',
                                                        borderRadius: '4px',
                                                        background: '#e67e22',
                                                        color: '#fff',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    📋 {enquiry.customerName}
                                                </div>
                                            ))}

                                            {(day.orders.length + day.enquiries.length) > 3 && (
                                                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                                    +{day.orders.length + day.enquiries.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div style={styles.card}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Status Legend
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px' }}>
                    {[
                        { color: 'var(--warning)', label: 'Pending' },
                        { color: 'var(--info)', label: 'Confirmed' },
                        { color: '#9b59b6', label: 'In Progress' },
                        { color: 'var(--success)', label: 'Completed' },
                        { color: '#e67e22', label: 'Enquiry' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                            <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Day Details Modal */}
            {selectedDay && (
                <div style={styles.modal} onClick={() => setSelectedDay(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h3 style={{ color: 'var(--gold)', fontSize: '16px', fontWeight: '700', margin: 0 }}>
                                    {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '4px 0 0 0' }}>
                                    {selectedDay.orders.length + selectedDay.enquiries.length} event(s)
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => {
                                        onNewBooking?.(selectedDay.date);
                                        setSelectedDay(null);
                                    }}
                                    style={{ ...styles.todayBtn, fontSize: '12px', padding: '6px 12px' }}
                                >
                                    + New Booking
                                </button>
                                <button
                                    onClick={() => setSelectedDay(null)}
                                    style={{ ...styles.navBtn, padding: '6px 10px' }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div style={{ padding: '16px', maxHeight: '60vh', overflowY: 'auto' }}>
                            {/* Orders */}
                            {selectedDay.orders.length > 0 && (
                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ color: 'var(--gold)', fontSize: '14px', marginBottom: '8px' }}>
                                        📦 Orders ({selectedDay.orders.length})
                                    </h4>
                                    {selectedDay.orders.map(order => (
                                        <div key={order.id} style={styles.eventCard}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                <div>
                                                    <p style={{ fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                                                        {order.customerName}
                                                    </p>
                                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                                                        {order.id}
                                                    </p>
                                                </div>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    background: getStatusColor(order.status),
                                                    color: order.status === 'pending' ? 'var(--dark)' : '#fff',
                                                }}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                <p style={{ margin: '2px 0' }}>📱 {order.phone}</p>
                                                <p style={{ margin: '2px 0' }}>👗 {order.sareeCount} sarees • {order.serviceType}</p>
                                                <p style={{ margin: '2px 0', color: 'var(--gold)', fontWeight: '600' }}>₹{order.totalAmount}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => { onEditOrder?.(order); setSelectedDay(null); }}
                                                    style={{ ...styles.actionBtn, background: 'var(--dark)', color: 'var(--gold)' }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this order?')) {
                                                            onDeleteOrder?.(order.id);
                                                            setSelectedDay(null);
                                                        }
                                                    }}
                                                    style={{ ...styles.actionBtn, background: 'var(--dark)', color: '#dc3545' }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Enquiries */}
                            {selectedDay.enquiries.length > 0 && (
                                <div>
                                    <h4 style={{ color: '#e67e22', fontSize: '14px', marginBottom: '8px' }}>
                                        📋 Enquiries ({selectedDay.enquiries.length})
                                    </h4>
                                    {selectedDay.enquiries.map(enquiry => (
                                        <div key={enquiry.id} style={styles.eventCard}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                                <p style={{ fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                                                    {enquiry.customerName}
                                                </p>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '10px',
                                                    fontWeight: '600',
                                                    background: '#e67e22',
                                                    color: '#fff',
                                                }}>
                                                    {enquiry.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                <p style={{ margin: '2px 0' }}>📱 {enquiry.phone}</p>
                                                <p style={{ margin: '2px 0' }}>🎯 {enquiry.serviceType}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => { onEditEnquiry?.(enquiry); setSelectedDay(null); }}
                                                    style={{ ...styles.actionBtn, background: 'var(--dark)', color: 'var(--gold)' }}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Delete this enquiry?')) {
                                                            onDeleteEnquiry?.(enquiry.id);
                                                            setSelectedDay(null);
                                                        }
                                                    }}
                                                    style={{ ...styles.actionBtn, background: 'var(--dark)', color: '#dc3545' }}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {selectedDay.orders.length === 0 && selectedDay.enquiries.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                    <p style={{ fontSize: '32px', marginBottom: '8px' }}>📅</p>
                                    <p>No events on this day</p>
                                    <button
                                        onClick={() => {
                                            onNewBooking?.(selectedDay.date);
                                            setSelectedDay(null);
                                        }}
                                        style={{ ...styles.todayBtn, marginTop: '12px' }}
                                    >
                                        + Create Booking
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

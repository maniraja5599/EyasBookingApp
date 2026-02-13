import { useState, useMemo, useRef, useEffect } from 'react';
import {
    generateCalendarMonth,
    populateCalendarWithBookings,
    getMonthName,
    getDayNames,
    CalendarDay
} from '../utils/calendar';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, ClipboardList, Package, User, Layers, MoreVertical, Search, Filter, ChevronDown } from 'lucide-react';

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
    onNewBooking
}: CalendarViewProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowMonthPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaySummary = (day: CalendarDay) => {
        let prePleatCount = 0;
        let drapeCount = 0;
        let bothCount = 0;
        let enquiryCount = day.enquiries.length;

        day.orders.forEach((order: any) => {
            const serviceType = (order.serviceType || '').toLowerCase();
            if (serviceType.includes('both')) bothCount++;
            else if (serviceType.includes('pre-pleat')) prePleatCount++;
            else if (serviceType.includes('drape')) drapeCount++;
        });

        return { prePleatCount, drapeCount, bothCount, enquiryCount };
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return '#f39c12';
            case 'confirmed': return '#3498db';
            case 'completed': return '#27ae60';
            case 'cancelled': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    // Calculate monthly statistics
    const monthlyStats = useMemo(() => {
        const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.eventDate);
            return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        });

        let drapeCount = 0;
        let prePleatCount = 0;
        let bothCount = 0;
        let totalRevenue = 0;
        let paidAmount = 0;
        let pendingAmount = 0;
        let completedCount = 0;
        let pendingCount = 0;
        let confirmedCount = 0;

        monthOrders.forEach(order => {
            const serviceType = (order.serviceType || '').toLowerCase();
            if (serviceType.includes('both')) bothCount++;
            else if (serviceType.includes('pre-pleat')) prePleatCount++;
            else if (serviceType.includes('drape')) drapeCount++;

            totalRevenue += order.totalAmount || 0;
            paidAmount += order.paidAmount || 0;
            pendingAmount += (order.totalAmount || 0) - (order.paidAmount || 0);

            const status = (order.status || '').toLowerCase();
            if (status === 'completed') completedCount++;
            else if (status === 'pending') pendingCount++;
            else if (status === 'confirmed' || status === 'received') confirmedCount++;
        });

        return {
            drapeCount,
            prePleatCount,
            bothCount,
            totalOrders: monthOrders.length,
            totalRevenue,
            paidAmount,
            pendingAmount,
            completedCount,
            pendingCount,
            confirmedCount
        };
    }, [orders, currentMonth, currentYear]);

    return (
        <>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%',
                paddingBottom: '16px'
            }}>
                {/* Header with Navigation and Picker */}
                <div style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    zIndex: 10
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={goToPreviousMonth} style={{ background: 'var(--dark-lighter)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={goToNextMonth} style={{ background: 'var(--dark-lighter)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        <div ref={pickerRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setShowMonthPicker(!showMonthPicker)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--gold)',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                {getMonthName(currentMonth)} {currentYear}
                                <ChevronDown size={16} />
                            </button>

                            {showMonthPicker && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '8px',
                                    background: 'var(--dark-light)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: 'var(--shadow-lg)',
                                    zIndex: 100,
                                    minWidth: '200px'
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                        {Array.from({ length: 12 }, (_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setCurrentMonth(i); setShowMonthPicker(false); }}
                                                style={{
                                                    background: i === currentMonth ? 'var(--gold)' : 'var(--dark-lighter)',
                                                    color: i === currentMonth ? 'var(--dark)' : 'var(--text-primary)',
                                                    border: 'none',
                                                    padding: '8px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: i === currentMonth ? 'bold' : 'normal'
                                                }}
                                            >
                                                {getMonthName(i).slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={goToToday} style={{
                        background: 'var(--dark-lighter)',
                        border: '1px solid var(--border)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500'
                    }}>
                        Today
                    </button>
                </div>

                {/* Calendar & Legend Container */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0'
                }}>
                    {/* Day Headers - Pill Style */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' }}>
                        {getDayNames().map((day, i) => {
                            const isToday = i === (today.getDay() === 0 ? 6 : today.getDay() - 1) && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                            return (
                                <div key={day} style={{
                                    padding: '6px 0',
                                    textAlign: 'center',
                                    color: isToday ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    fontSize: '10px',
                                    fontWeight: isToday ? '800' : '600',
                                    background: 'var(--dark-lighter)',
                                    borderRadius: '16px',
                                    letterSpacing: '0.5px'
                                }}>
                                    {day.slice(0, 3).toUpperCase()}
                                </div>
                            );
                        })}
                    </div>

                    {/* Days Grid - Card Style */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {calendarWeeks.map((week, weekIdx) => (
                            <div key={weekIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                                {week.days.map((day, dayIdx) => {
                                    const { prePleatCount, drapeCount, bothCount, enquiryCount } = getDaySummary(day);
                                    const totalCount = prePleatCount + drapeCount + bothCount + enquiryCount;

                                    // Determine Main Icon for center display
                                    let MainIcon: typeof Package | typeof User | typeof Layers | typeof ClipboardList | null = null;
                                    if (bothCount > 0) MainIcon = Layers;
                                    else if (drapeCount > 0) MainIcon = User;
                                    else if (prePleatCount > 0) MainIcon = Package;
                                    else if (enquiryCount > 0) MainIcon = ClipboardList;

                                    // Status dot color
                                    const hasPending = day.orders.some((o: any) => o.status === 'pending');
                                    const hasConfirmed = day.orders.some((o: any) => o.status === 'confirmed' || o.status === 'received');
                                    const hasCompleted = day.orders.some((o: any) => o.status === 'completed');
                                    let statusColor: string | null = null;
                                    if (hasPending) statusColor = 'var(--warning)';
                                    else if (hasConfirmed) statusColor = 'var(--info)';
                                    else if (hasCompleted) statusColor = 'var(--success)';
                                    else if (enquiryCount > 0) statusColor = '#e67e22';

                                    return (
                                        <div
                                            key={dayIdx}
                                            onClick={() => setSelectedDay(day)}
                                            style={{
                                                aspectRatio: '1',
                                                padding: '6px',
                                                borderRadius: '14px',
                                                background: day.isCurrentMonth ? 'var(--dark-lighter)' : 'transparent',
                                                border: day.isCurrentMonth ? '1px solid var(--border)' : '1px solid transparent',
                                                opacity: day.isCurrentMonth ? 1 : 0.3,
                                                cursor: 'pointer',
                                                position: 'relative',
                                                transition: 'transform 0.15s, box-shadow 0.15s',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                boxShadow: day.isCurrentMonth
                                                    ? day.isToday
                                                        ? 'var(--shadow), inset 0 0 0 2px var(--gold)'
                                                        : 'var(--shadow)'
                                                    : 'none',
                                                overflow: 'hidden'
                                            }}
                                            onMouseDown={e => { if (day.isCurrentMonth) e.currentTarget.style.transform = 'scale(0.95)'; }}
                                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            {/* Status Dot - Top Right */}
                                            {statusColor && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '6px',
                                                    right: '6px',
                                                    width: '7px',
                                                    height: '7px',
                                                    borderRadius: '50%',
                                                    background: statusColor,
                                                    boxShadow: `0 0 6px ${statusColor}`
                                                }} />
                                            )}

                                            {/* Center Icon */}
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                                {MainIcon ? (
                                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <MainIcon
                                                            size={26}
                                                            color={
                                                                MainIcon === Layers ? '#0abd63' :
                                                                    MainIcon === User ? '#a29bfe' :
                                                                        MainIcon === Package ? '#ff9f43' : '#e67e22'
                                                            }
                                                            strokeWidth={1.5}
                                                        />
                                                        {totalCount > 1 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '-5px',
                                                                right: '-6px',
                                                                background: 'var(--dark-light)',
                                                                color: 'var(--text-primary)',
                                                                fontSize: '9px',
                                                                fontWeight: 'bold',
                                                                padding: '0 4px',
                                                                borderRadius: '8px',
                                                                lineHeight: '14px',
                                                                border: '1px solid var(--border)'
                                                            }}>
                                                                +{totalCount - 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Date - Bottom Center */}
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: day.isToday ? 'bold' : '500',
                                                color: day.isToday ? 'var(--gold)' : 'var(--text-secondary)',
                                                lineHeight: '1'
                                            }}>
                                                {day.dayOfMonth}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Monthly Summary Statistics */}
                <div style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '16px',
                    border: '1px solid var(--glass-border)',
                    padding: '16px',
                    marginTop: '8px'
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)',
                        margin: '0 0 16px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📊 {getMonthName(currentMonth)} {currentYear} Summary
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '12px'
                    }}>
                        {/* Service Type Cards */}
                        <div style={{
                            background: 'rgba(162, 155, 254, 0.1)',
                            border: '1px solid rgba(162, 155, 254, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <User size={16} color="#a29bfe" />
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Drape</span>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a29bfe' }}>
                                {monthlyStats.drapeCount}
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(255, 159, 67, 0.1)',
                            border: '1px solid rgba(255, 159, 67, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Package size={16} color="#ff9f43" />
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Pre-Pleat</span>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9f43' }}>
                                {monthlyStats.prePleatCount}
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(10, 189, 99, 0.1)',
                            border: '1px solid rgba(10, 189, 99, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Layers size={16} color="#0abd63" />
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Both</span>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0abd63' }}>
                                {monthlyStats.bothCount}
                            </div>
                        </div>

                        {/* Payment Cards */}
                        <div style={{
                            background: 'rgba(39, 174, 96, 0.1)',
                            border: '1px solid rgba(39, 174, 96, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>💰 Paid</span>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#27ae60' }}>
                                ₹{monthlyStats.paidAmount.toLocaleString()}
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(243, 156, 18, 0.1)',
                            border: '1px solid rgba(243, 156, 18, 0.3)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>⏳ Pending</span>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f39c12' }}>
                                ₹{monthlyStats.pendingAmount.toLocaleString()}
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--dark-lighter)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>📈 Total Revenue</span>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--gold)' }}>
                                ₹{monthlyStats.totalRevenue.toLocaleString()}
                            </div>
                        </div>

                        {/* Order Status Cards */}
                        <div style={{
                            background: 'var(--dark-lighter)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>✅ Completed</span>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                                {monthlyStats.completedCount}
                            </div>
                        </div>

                        <div style={{
                            background: 'var(--dark-lighter)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>📋 Total Orders</span>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                {monthlyStats.totalOrders}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Detailed Day View Modal - Product List Style - OUTSIDE overflow container */}
            {selectedDay && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'var(--modal-backdrop)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1300,
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setSelectedDay(null)}>
                    <div style={{
                        background: 'var(--dark-light)',
                        borderRadius: '24px',
                        width: '90%',
                        maxWidth: '500px',
                        maxHeight: '85vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'var(--shadow-lg)',
                        overflow: 'hidden',
                        border: '1px solid var(--border)'
                    }} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'var(--dark-lighter)'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                                    {format(selectedDay.date, 'MMMM d, yyyy')}
                                </h3>
                                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                                    {getDaySummary(selectedDay).prePleatCount + getDaySummary(selectedDay).drapeCount + getDaySummary(selectedDay).bothCount} orders scheduled
                                </p>
                            </div>
                            <button
                                onClick={() => { onNewBooking?.(selectedDay.date); setSelectedDay(null); }}
                                style={{
                                    background: 'var(--gold)',
                                    color: 'var(--dark)',
                                    border: 'none',
                                    padding: '10px 16px',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                + Add Booking
                            </button>
                        </div>

                        {/* List Content */}
                        <div style={{ padding: '0', overflowY: 'auto', flex: 1 }}>
                            {/* Search/Filter */}
                            <div style={{ padding: '16px 24px', position: 'sticky', top: 0, background: 'var(--dark-light)', zIndex: 5, borderBottom: '1px solid var(--border)' }}>
                                <div style={{
                                    background: 'var(--dark-lighter)',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <Search size={16} color="var(--text-secondary)" />
                                    <input
                                        type="text"
                                        placeholder="Search bookings..."
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            width: '100%',
                                            fontSize: '13px'
                                        }}
                                    />
                                    <Filter size={16} color="var(--text-secondary)" />
                                </div>
                            </div>

                            {selectedDay.orders.length === 0 && selectedDay.enquiries.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📅</div>
                                    <div style={{ fontSize: '14px' }}>No bookings for this day</div>
                                </div>
                            )}

                            <div style={{ padding: '0 16px 16px' }}>
                                {(selectedDay.orders.length > 0) && <div style={{ padding: '16px 8px 8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Orders</div>}

                                {selectedDay.orders.map(order => {
                                    const type = (order.serviceType || '').toLowerCase();
                                    const Icon = type.includes('pre-pleat') ? Package : type.includes('both') ? Layers : User;
                                    const iconColor = type.includes('pre-pleat') ? '#ff9f43' : type.includes('both') ? '#0abd63' : '#a29bfe';
                                    const bg = type.includes('pre-pleat') ? 'rgba(255, 159, 67, 0.1)' : type.includes('both') ? 'rgba(10, 189, 99, 0.1)' : 'rgba(162, 155, 254, 0.1)';

                                    return (
                                        <div key={order.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '16px',
                                            borderBottom: '1px solid var(--border)',
                                            gap: '16px'
                                        }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: bg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: iconColor,
                                                flexShrink: 0
                                            }}>
                                                <Icon size={24} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {order.customerName}
                                                </h4>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                    {order.serviceType} • {order.sareeCount} Saree(s)
                                                </div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    ID: {order.id.slice(0, 6)}...
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', fontSize: '14px' }}>
                                                    ₹{order.totalAmount}
                                                </div>
                                                <span style={{
                                                    fontSize: '10px',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: getStatusColor(order.status),
                                                    color: '#fff',
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {order.status}
                                                </span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEditOrder?.(order); setSelectedDay(null); }}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginTop: '4px' }}
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(selectedDay.enquiries.length > 0) && <div style={{ padding: '24px 8px 8px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Enquiries</div>}

                                {selectedDay.enquiries.map(enquiry => (
                                    <div key={enquiry.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '16px',
                                        borderBottom: '1px solid var(--border)',
                                        gap: '16px',
                                        opacity: 0.8
                                    }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: 'rgba(230, 126, 34, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#e67e22',
                                            flexShrink: 0
                                        }}>
                                            <ClipboardList size={24} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                                {enquiry.customerName}
                                            </h4>
                                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                                Enquiry • {enquiry.serviceType}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onEditEnquiry?.(enquiry); setSelectedDay(null); }}
                                                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div style={{ padding: '16px', background: 'var(--dark-lighter)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedDay(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

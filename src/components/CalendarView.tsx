import { useState, useMemo, useRef, useEffect } from 'react';
import {
    generateCalendarMonth,
    populateCalendarWithBookings,
    getMonthName,
    getDayNames,
    CalendarDay
} from '../utils/calendar';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Phone, Package, ClipboardList, AlertCircle, CheckCircle, Clock, ChevronDown } from 'lucide-react';

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

    // Close picker when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowMonthPicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const months = Array.from({ length: 12 }, (_, i) => getMonthName(i));

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            height: 'calc(100vh - 120px)', // Adjust based on layout
            maxWidth: '1200px', // Limit width for better desktop view
            margin: '0 auto',
            width: '100%'
        }}>
            {/* Header with Navigation and Picker */}
            <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)',
                padding: '12px 20px',
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
                                fontSize: '20px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {getMonthName(currentMonth)} {currentYear}
                            <ChevronDown size={16} style={{ transform: showMonthPicker ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                        </button>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 0 4px' }}>
                            {totalEventsInMonth} event{totalEventsInMonth !== 1 ? 's' : ''}
                        </p>

                        {/* Month/Year Picker Dropdown */}
                        {showMonthPicker && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                marginTop: '8px',
                                background: 'var(--dark)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                                padding: '16px',
                                width: '280px',
                                boxShadow: 'var(--shadow-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                animation: 'fadeIn 0.2s ease-out'
                            }}>
                                {/* Year Control in Picker */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                    <button onClick={() => setCurrentYear(currentYear - 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ChevronLeft size={16} /></button>
                                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentYear}</span>
                                    <button onClick={() => setCurrentYear(currentYear + 1)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><ChevronRight size={16} /></button>
                                </div>
                                {/* Month Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                    {months.map((month, idx) => (
                                        <button
                                            key={month}
                                            onClick={() => {
                                                setCurrentMonth(idx);
                                                setShowMonthPicker(false);
                                            }}
                                            style={{
                                                background: currentMonth === idx ? 'var(--gold)' : 'var(--dark-lighter)',
                                                color: currentMonth === idx ? 'var(--dark)' : 'var(--text-primary)',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '8px 4px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                fontWeight: currentMonth === idx ? 'bold' : 'normal'
                                            }}
                                        >
                                            {month.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }}
                        style={{
                            background: 'var(--dark-light)',
                            border: '1px solid var(--border)',
                            color: 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600'
                        }}
                    >
                        Today
                    </button>
                </div>
            </div>

            {/* Calendar & Legend Container */}
            <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid var(--glass-border)',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Day Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--glass-border)' }}>
                    {getDayNames().map(day => (
                        <div key={day} style={{
                            padding: '12px 4px',
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: '12px',
                            fontWeight: '600',
                            background: 'rgba(0,0,0,0.1)'
                        }}>
                            {day.slice(0, 3)}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {calendarWeeks.map((week, weekIdx) => (
                        <div key={weekIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', flex: 1, minHeight: '60px' }}>
                            {week.days.map((day, dayIdx) => (
                                <div
                                    key={dayIdx}
                                    onClick={() => setSelectedDay(day)}
                                    style={{
                                        padding: '4px',
                                        borderRight: dayIdx === 6 ? 'none' : '1px solid var(--glass-border)',
                                        borderBottom: weekIdx === calendarWeeks.length - 1 ? 'none' : '1px solid var(--glass-border)',
                                        background: day.isToday
                                            ? 'rgba(245, 166, 35, 0.1)'
                                            : day.isCurrentMonth ? 'transparent' : 'rgba(0,0,0,0.2)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <div style={{
                                        alignSelf: 'flex-end',
                                        fontSize: '12px',
                                        fontWeight: day.isToday ? 'bold' : 'normal',
                                        color: day.isToday ? 'var(--gold)' : day.isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                                        margin: '2px 4px',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '50%',
                                        background: day.isToday ? 'rgba(245, 166, 35, 0.2)' : 'transparent'
                                    }}>
                                        {day.dayOfMonth}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                                        {day.orders.slice(0, 3).map(order => (
                                            <div key={order.id} style={{
                                                fontSize: '9px',
                                                padding: '1px 4px',
                                                borderRadius: '3px',
                                                background: getStatusColor(order.status),
                                                color: '#fff',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {order.customerName}
                                            </div>
                                        ))}
                                        {day.enquiries.slice(0, 1).map(enquiry => (
                                            <div key={enquiry.id} style={{
                                                fontSize: '9px',
                                                padding: '1px 4px',
                                                borderRadius: '3px',
                                                background: '#e67e22',
                                                color: '#fff',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {enquiry.customerName}
                                            </div>
                                        ))}
                                        {(day.orders.length + day.enquiries.length) > 4 && (
                                            <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center' }}>•</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Footer Legend */}
                <div style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.1)', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                        { color: 'var(--warning)', label: 'Pending' },
                        { color: 'var(--info)', label: 'Confirmed' },
                        { color: 'var(--success)', label: 'Done' },
                        { color: '#e67e22', label: 'Enquiry' },
                    ].map(item => (
                        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color }} />
                            {item.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Day Details Modal */}
            {selectedDay && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'var(--modal-backdrop)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1300,
                    animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setSelectedDay(null)}>
                    <div style={{
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        border: '1px solid var(--glass-border)',
                        width: '90%',
                        maxWidth: '400px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: 'var(--shadow-lg)'
                    }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid var(--glass-border)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--gold)', margin: 0 }}>
                                    {format(selectedDay.date, 'MMM d, yyyy')}
                                </h3>
                            </div>
                            <button
                                onClick={() => { onNewBooking?.(selectedDay.date); setSelectedDay(null); }}
                                style={{
                                    background: 'var(--gold)',
                                    color: 'var(--dark)',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                + Add
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selectedDay.orders.length === 0 && selectedDay.enquiries.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    No events
                                </div>
                            )}

                            {selectedDay.orders.map(order => (
                                <div key={order.id} style={{
                                    background: 'var(--dark-light)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>{order.customerName}</span>
                                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: getStatusColor(order.status), color: '#fff' }}>{order.status}</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        <div>📞 {order.phone}</div>
                                        <div>👗 {order.sareeCount} sarees • {order.serviceType}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button onClick={() => { onEditOrder?.(order); setSelectedDay(null); }} style={{ flex: 1, background: 'var(--bg-secondary)', border: 'none', padding: '4px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px' }}>Edit</button>
                                        <button onClick={() => { if (confirm('Delete?')) { onDeleteOrder?.(order.id); setSelectedDay(null); } }} style={{ flex: 1, background: 'rgba(220, 53, 69, 0.1)', border: 'none', padding: '4px', borderRadius: '4px', color: 'var(--error)', fontSize: '11px' }}>Delete</button>
                                    </div>
                                </div>
                            ))}

                            {selectedDay.enquiries.map(enquiry => (
                                <div key={enquiry.id} style={{
                                    background: 'var(--dark-light)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>{enquiry.customerName}</span>
                                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: '#e67e22', color: '#fff' }}>Enquiry</span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        <div>📞 {enquiry.phone}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button onClick={() => { onEditEnquiry?.(enquiry); setSelectedDay(null); }} style={{ flex: 1, background: 'var(--bg-secondary)', border: 'none', padding: '4px', borderRadius: '4px', color: 'var(--text-primary)', fontSize: '11px' }}>Edit</button>
                                        <button onClick={() => { if (confirm('Delete?')) { onDeleteEnquiry?.(enquiry.id); setSelectedDay(null); } }} style={{ flex: 1, background: 'rgba(220, 53, 69, 0.1)', border: 'none', padding: '4px', borderRadius: '4px', color: 'var(--error)', fontSize: '11px' }}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

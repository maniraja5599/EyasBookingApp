import { useState, useMemo } from 'react';
import {
    generateCalendarMonth,
    populateCalendarWithBookings,
    getMonthName,
    getDayNames,
    CalendarDay
} from '../utils/calendar';
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react';

interface CalendarShowcaseProps {
    orders: any[];
    enquiries: any[];
}

type CalendarStyle = 'minimalist' | 'glassmorphism' | 'luxury' | 'pastel' | 'neon';

export function CalendarShowcase({ orders, enquiries }: CalendarShowcaseProps) {
    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentStyle, setCurrentStyle] = useState<CalendarStyle>('glassmorphism');

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

    // --- Style Configurations ---

    const styles: Record<CalendarStyle, React.CSSProperties> = {
        minimalist: {
            background: '#ffffff',
            color: '#333333',
            fontFamily: '"Inter", sans-serif',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
        glassmorphism: {
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            fontFamily: 'system-ui, sans-serif',
        },
        luxury: {
            background: '#0a0a0a',
            color: '#d4af37', // Gold
            fontFamily: '"Playfair Display", serif',
            border: '2px solid #d4af37',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
        },
        pastel: {
            background: '#fff0f3', // Lavender Blush
            color: '#5d576b',
            fontFamily: '"Nunito", "Comic Sans MS", sans-serif',
            border: '4px solid #bde0fe',
            borderRadius: '30px',
            boxShadow: '5px 5px 0px #bde0fe',
        },
        neon: {
            background: '#000000',
            color: '#0ff', // Cyan
            fontFamily: '"Courier New", monospace',
            border: '2px solid #0ff',
            boxShadow: '0 0 10px #0ff, inset 0 0 10px #0ff',
            textShadow: '0 0 5px #0ff',
        },
    };

    // --- Render Helpers based on Style ---

    const getHeaderStyle = () => {
        const base = {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px',
            marginBottom: '10px'
        };

        if (currentStyle === 'neon') return { ...base, borderBottom: '1px solid #0ff' };
        if (currentStyle === 'luxury') return { ...base, borderBottom: '1px solid #d4af37' };
        if (currentStyle === 'glassmorphism') return { ...base, borderBottom: '1px solid rgba(255,255,255,0.1)' };

        return base;
    };

    const getDayCellStyle = (day: CalendarDay) => {
        const baseStyle: React.CSSProperties = {
            minHeight: '80px',
            padding: '8px',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.2s',
        };

        if (currentStyle === 'minimalist') {
            return {
                ...baseStyle,
                background: day.isToday ? '#e6f7ff' : 'transparent',
                borderRight: '1px solid #f0f0f0',
                borderBottom: '1px solid #f0f0f0',
                color: day.isCurrentMonth ? '#333' : '#ccc'
            };
        }
        if (currentStyle === 'glassmorphism') {
            return {
                ...baseStyle,
                background: day.isToday ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                color: day.isCurrentMonth ? '#fff' : 'rgba(255,255,255,0.3)'
            };
        }
        if (currentStyle === 'luxury') {
            return {
                ...baseStyle,
                background: day.isToday ? '#1a1a1a' : 'transparent',
                border: '1px solid #333',
                color: day.isCurrentMonth ? '#d4af37' : '#554411'
            };
        }
        if (currentStyle === 'pastel') {
            return {
                ...baseStyle,
                background: day.isToday ? '#ffcdb2' : '#ffffff', // White cells on pastel bg
                margin: '4px',
                borderRadius: '12px',
                color: day.isCurrentMonth ? '#5d576b' : '#d4d1da',
                border: 'none',
                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.05)'
            };
        }
        if (currentStyle === 'neon') {
            return {
                ...baseStyle,
                background: day.isToday ? 'rgba(0, 255, 255, 0.1)' : 'transparent',
                border: '1px solid #333',
                color: day.isCurrentMonth ? '#0ff' : '#004444',
                boxShadow: day.isToday ? 'inset 0 0 10px #0ff' : 'none'
            };
        }
        return baseStyle;
    };

    const getActionButtonStyle = () => {
        // Styles for prev/next buttons
        const base = {
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        };
        if (currentStyle === 'minimalist') return { ...base, color: '#333', border: '1px solid #eee', borderRadius: '4px' };
        if (currentStyle === 'glassmorphism') return { ...base, color: '#fff', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' };
        if (currentStyle === 'luxury') return { ...base, color: '#d4af37', border: '1px solid #d4af37' };
        if (currentStyle === 'pastel') return { ...base, background: '#ffb4a2', borderRadius: '50%', color: 'white' };
        if (currentStyle === 'neon') return { ...base, color: '#0ff', border: '1px solid #0ff', boxShadow: '0 0 5px #0ff' };

        return base;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '20px',
            height: '100%',
            overflowY: 'auto'
        }}>
            {/* Style Switcher */}
            <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                background: 'rgba(0,0,0,0.5)',
                padding: '10px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', color: 'white', marginRight: '10px' }}>
                    <Palette size={18} style={{ marginRight: '6px' }} /> Style:
                </div>
                {(['minimalist', 'glassmorphism', 'luxury', 'pastel', 'neon'] as CalendarStyle[]).map(style => (
                    <button
                        key={style}
                        onClick={() => setCurrentStyle(style)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: 'none',
                            background: currentStyle === style ? '#fff' : 'rgba(255,255,255,0.2)',
                            color: currentStyle === style ? '#000' : '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textTransform: 'capitalize',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                        }}
                    >
                        {style}
                    </button>
                ))}
            </div>

            {/* Calendar Container */}
            <div style={{
                borderRadius: currentStyle === 'pastel' ? '30px' : '16px',
                overflow: 'hidden',
                transition: 'all 0.5s ease',
                ...styles[currentStyle]
            }}>
                {/* Header */}
                <div style={getHeaderStyle()}>
                    <button onClick={goToPreviousMonth} style={getActionButtonStyle()}>
                        <ChevronLeft size={20} />
                    </button>
                    <h2 style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        margin: 0,
                        letterSpacing: currentStyle === 'luxury' ? '2px' : 'normal',
                        textTransform: currentStyle === 'luxury' || currentStyle === 'neon' ? 'uppercase' : 'none'
                    }}>
                        {getMonthName(currentMonth)} {currentYear}
                    </h2>
                    <button onClick={goToNextMonth} style={getActionButtonStyle()}>
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Days Grid */}
                <div style={{ padding: '10px' }}>
                    {/* Weekday Names */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '10px' }}>
                        {getDayNames().map((day) => (
                            <div key={day} style={{
                                textAlign: 'center',
                                padding: '10px 0',
                                fontWeight: 'bold',
                                opacity: 0.7,
                                fontSize: '12px',
                                letterSpacing: '1px'
                            }}>
                                {day.slice(0, 3)}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div>
                        {calendarWeeks.map((week, wIdx) => (
                            <div key={wIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
                                {week.days.map((day, dIdx) => (
                                    <div
                                        key={dIdx}
                                        style={getDayCellStyle(day)}
                                    >
                                        <div style={{
                                            fontWeight: 'bold',
                                            marginBottom: '4px',
                                            fontSize: '14px'
                                        }}>
                                            {day.dayOfMonth}
                                        </div>

                                        {/* Events - Simplified for demo */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {day.orders.slice(0, 2).map((order, i) => (
                                                <div key={i} style={{
                                                    height: '6px',
                                                    borderRadius: '3px',
                                                    width: '100%',
                                                    background: currentStyle === 'neon' ? '#f0f' :
                                                        currentStyle === 'luxury' ? '#d4af37' :
                                                            currentStyle === 'pastel' ? '#ff9aa2' :
                                                                currentStyle === 'minimalist' ? '#1890ff' : 'var(--warning)',
                                                    boxShadow: currentStyle === 'neon' ? '0 0 5px #f0f' : 'none'
                                                }} title={order.customerName} />
                                            ))}
                                            {day.orders.length > 2 && (
                                                <div style={{ fontSize: '8px', opacity: 0.5 }}>+more</div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{
                color: 'var(--text-secondary)',
                textAlign: 'center',
                fontSize: '12px',
                marginTop: '10px',
                background: 'rgba(0,0,0,0.2)',
                padding: '10px',
                borderRadius: '8px'
            }}>
                Mode: <b>{currentStyle.toUpperCase()}</b> - Select your favorite style to implement it permanently.
            </div>
        </div>
    );
}

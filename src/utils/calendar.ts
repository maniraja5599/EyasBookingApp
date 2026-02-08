import { Order, Enquiry } from '../types';

export interface CalendarDay {
    date: Date;
    dayOfMonth: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    orders: Order[];
    enquiries: Enquiry[];
}

export interface CalendarWeek {
    days: CalendarDay[];
}

export function generateCalendarMonth(year: number, month: number): CalendarWeek[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeks: CalendarWeek[] = [];
    let currentWeek: CalendarDay[] = [];

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        currentWeek.push({
            date,
            dayOfMonth: prevMonthLastDay - i,
            isCurrentMonth: false,
            isToday: false,
            orders: [],
            enquiries: []
        });
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        currentWeek.push({
            date,
            dayOfMonth: day,
            isCurrentMonth: true,
            isToday: date.getTime() === today.getTime(),
            orders: [],
            enquiries: []
        });

        if (currentWeek.length === 7) {
            weeks.push({ days: currentWeek });
            currentWeek = [];
        }
    }

    // Add days from next month to fill the last week
    if (currentWeek.length > 0) {
        let nextMonthDay = 1;
        while (currentWeek.length < 7) {
            const date = new Date(year, month + 1, nextMonthDay);
            currentWeek.push({
                date,
                dayOfMonth: nextMonthDay,
                isCurrentMonth: false,
                isToday: false,
                orders: [],
                enquiries: []
            });
            nextMonthDay++;
        }
        weeks.push({ days: currentWeek });
    }

    return weeks;
}

export function populateCalendarWithBookings(
    weeks: CalendarWeek[],
    orders: Order[],
    enquiries: Enquiry[]
): CalendarWeek[] {
    return weeks.map(week => ({
        days: week.days.map(day => {
            // Use local date string YYYY-MM-DD
            const dayDateString = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;

            const dayOrders = orders.filter(order => {
                if (!order.eventDate) return false;
                // order.eventDate is YYYY-MM-DD string from input type="date"
                return order.eventDate === dayDateString;
            });

            const dayEnquiries = enquiries.filter(enquiry => {
                if (!enquiry.eventDate) return false;
                return enquiry.eventDate === dayDateString;
            });

            return {
                ...day,
                orders: dayOrders,
                enquiries: dayEnquiries
            };
        })
    }));
}

export function getMonthName(month: number): string {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[month];
}

export function getDayNames(): string[] {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

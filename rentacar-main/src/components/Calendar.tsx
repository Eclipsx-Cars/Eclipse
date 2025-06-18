import React, { useState, useEffect } from "react";
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import '../css/Calendar.css'

interface CalendarProps {
    carId: string;
    updateCalendar: boolean;
    isMultiDay: boolean;
    onDateSelect: (start: string, end: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ carId, updateCalendar, isMultiDay, onDateSelect }) => {
    const [reservations, setReservations] = useState([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations/car/${carId}`);
                if (response.ok) {
                    const reservationsData = await response.json();
                    setReservations(reservationsData);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
            }
        };

        fetchData();
    }, [carId, updateCalendar]);

    const events = [
        // Existing reservations (in red)
        ...reservations.map((reservation: any) => ({
            title: "Reserved",
            start: reservation.startDate,
            end: reservation.endDate,
            display: 'background',
            color: 'rgba(255, 0, 0, 0.2)'
        })),
        // Selected dates (in darker green)
        ...selectedDates.map(date => ({
            start: date,
            end: date,
            display: 'background',
            color: 'rgba(0, 128, 0, 0.4)'
        })),
        // Start date indicator (in blue)
        ...(startDate ? [{
            start: startDate,
            end: startDate,
            display: 'background',
            color: 'rgba(0, 0, 255, 0.3)'
        }] : [])
    ];

    const isDateReserved = (date: string) => {
        return reservations.some((reservation: any) => {
            const reserveStart = new Date(reservation.startDate);
            const reserveEnd = new Date(reservation.endDate);
            const checkDate = new Date(date);
            return checkDate >= reserveStart && checkDate <= reserveEnd;
        });
    };

    const handleDateClick = (info: any) => {
        const clickedDate = info.dateStr;

        if (!isMultiDay) {
            // Single day selection
            if (selectedDates.includes(clickedDate)) {
                setSelectedDates([]);
            } else {
                setSelectedDates([clickedDate]);
            }
            onDateSelect(clickedDate, clickedDate);
        } else {
            // Multi-day selection
            if (!startDate) {
                // First click - set start date
                if (!isDateReserved(clickedDate)) {
                    setStartDate(clickedDate);
                }
            } else {
                // Second click - set end date and select range
                const start = new Date(startDate);
                const end = new Date(clickedDate);

                // Ensure end date is after start date
                if (end >= start) {
                    const dates: string[] = [];
                    let currentDate = new Date(start);

                    // Generate all dates in range
                    while (currentDate <= end) {
                        const dateStr = currentDate.toISOString().split('T')[0];
                        if (isDateReserved(dateStr)) {
                            // If any date in range is reserved, reset selection
                            setStartDate(null);
                            setSelectedDates([]);
                            return;
                        }
                        dates.push(dateStr);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }

                    // Set all dates in range
                    setSelectedDates(dates);
                    onDateSelect(startDate, clickedDate);
                }
                // Reset start date after selection
                setStartDate(null);
            }
        }
    };

    return (
        <div className="calendar-container bg-gray-800 p-4 rounded-lg">
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                    start: "prev,next today",
                    center: "title",
                    end: "dayGridMonth"
                }}
                events={events}
                selectable={false} // Disable drag selection
                dayMaxEvents={true}
                dateClick={handleDateClick}
                selectConstraint={{
                    start: new Date().toISOString().split('T')[0]
                }}
                validRange={{
                    start: new Date().toISOString().split('T')[0]
                }}
                height="auto"
                dayCellClassNames="calendar-day"
            />
            {isMultiDay && (
                <div className="text-white mt-2 text-center">
                    {startDate
                        ? "Please select an end date"
                        : "Please select a start date"}
                </div>
            )}
        </div>
    );
};

export default Calendar;
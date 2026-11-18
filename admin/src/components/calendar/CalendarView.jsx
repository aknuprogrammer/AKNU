import { useState } from "react";

const CalendarView = ({ events, onDateClick, onEventClick, onDeleteEvent, getEventsForDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearButtonRef, setYearButtonRef] = useState(null);
  const [yearPickerPosition, setYearPickerPosition] = useState({ top: 0, left: 0, width: 0 });
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [monthButtonRef, setMonthButtonRef] = useState(null);
  const [monthPickerPosition, setMonthPickerPosition] = useState({ top: 0, left: 0, width: 0 });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const navigateMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const navigateYear = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear() + direction, currentDate.getMonth(), 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const selectYear = (year) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setShowYearPicker(false);
  };

  const selectMonth = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setShowMonthPicker(false);
  };

  // Generate list of years (current year ± 10 years)
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  // Get day name for a date
  const getDayName = (dateString) => {
    const date = new Date(dateString + "T00:00:00");
    return dayNames[date.getDay()];
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const today = formatDate(new Date());

    // Get previous month's last days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    const emptyCells = [];

    // Empty cells for days before the first day of the month
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const dateString = formatDate(
        new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day)
      );
      const dayEvents = events.filter((event) => {
        const eventFromDate = event.fromDate || event.date;
        const eventToDate = event.toDate || event.fromDate || event.date;
        return dateString >= eventFromDate && dateString <= eventToDate;
      });

      // Create tooltip text for all events on this date (only event names, no type)
      const eventsTooltip = dayEvents.length > 0 
        ? dayEvents.map((event) => event.event || "No description").join("\n")
        : "";

      emptyCells.push(
        <button
          key={`prev-${day}`}
          onClick={() => onDateClick(dateString)}
          onMouseEnter={(e) => {
            if (dayEvents.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
              setHoveredDate(dateString);
            }
          }}
          onMouseLeave={() => setHoveredDate(null)}
          className={`relative h-9 w-9 rounded text-xs text-gray-400 transition-all duration-200 ${
            dayEvents.length > 0 
              ? "bg-green-50 hover:bg-green-100 hover:shadow-md hover:scale-105 cursor-pointer border border-green-200 hover:border-green-400" 
              : "hover:bg-gray-100"
          }`}
        >
          {day}
          {dayEvents.length > 0 && (
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="w-1 h-1 bg-green-600 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                  title={event.event || "No description"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                />
              ))}
            </div>
          )}
        </button>
      );
    }

    const days = [];
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayEvents = events.filter((event) => {
        const eventFromDate = event.fromDate || event.date;
        const eventToDate = event.toDate || event.fromDate || event.date;
        return dateString >= eventFromDate && dateString <= eventToDate;
      });
      const isToday = dateString === today;
      const hasEvents = dayEvents.length > 0;

      // Create tooltip text for all events on this date (only event names, no type)
      const eventsTooltip = hasEvents 
        ? dayEvents.map((event) => event.event || "No description").join("\n")
        : "";

      days.push(
        <button
          key={day}
          onClick={() => onDateClick(dateString)}
          onMouseEnter={(e) => {
            if (hasEvents) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
              setHoveredDate(dateString);
            }
          }}
          onMouseLeave={() => setHoveredDate(null)}
          className={`relative h-9 w-9 rounded text-xs transition-all duration-200 ${
            isToday
              ? "bg-blue-50 text-blue-600 font-medium border border-blue-300 hover:bg-blue-100 hover:shadow-md hover:scale-105"
              : hasEvents
              ? "bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md hover:scale-105 cursor-pointer border border-green-200 hover:border-green-400"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
          {hasEvents && (
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="w-1 h-1 bg-green-600 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                  title={event.event || "No description"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                />
              ))}
            </div>
          )}
        </button>
      );
    }

    // Get next month's first days
    const nextMonthDays = 42 - (emptyCells.length + days.length);
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const nextDays = [];
    for (let day = 1; day <= nextMonthDays; day++) {
      const dateString = formatDate(
        new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day)
      );
      const dayEvents = events.filter((event) => {
        const eventFromDate = event.fromDate || event.date;
        const eventToDate = event.toDate || event.fromDate || event.date;
        return dateString >= eventFromDate && dateString <= eventToDate;
      });

      // Create tooltip text for all events on this date (only event names, no type)
      const nextEventsTooltip = dayEvents.length > 0 
        ? dayEvents.map((event) => event.event || "No description").join("\n")
        : "";

      nextDays.push(
        <button
          key={`next-${day}`}
          onClick={() => onDateClick(dateString)}
          onMouseEnter={(e) => {
            if (dayEvents.length > 0) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.top - 10 });
              setHoveredDate(dateString);
            }
          }}
          onMouseLeave={() => setHoveredDate(null)}
          className={`relative h-9 w-9 rounded text-xs text-gray-400 transition-all duration-200 ${
            dayEvents.length > 0 
              ? "bg-green-50 hover:bg-green-100 hover:shadow-md hover:scale-105 cursor-pointer border border-green-200 hover:border-green-400" 
              : "hover:bg-gray-100"
          }`}
        >
          {day}
          {dayEvents.length > 0 && (
            <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
              {dayEvents.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  className="w-1 h-1 bg-green-600 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                  title={event.event || "No description"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                />
              ))}
            </div>
          )}
        </button>
      );
    }

    return [...emptyCells, ...days, ...nextDays];
  };

  // Get events for hovered date to display in tooltip
  const getHoveredDateEvents = () => {
    if (!hoveredDate) return [];
    return events.filter((event) => {
      const eventFromDate = event.fromDate || event.date;
      const eventToDate = event.toDate || event.fromDate || event.date;
      return hoveredDate >= eventFromDate && hoveredDate <= eventToDate;
    });
  };

  const hoveredEvents = getHoveredDateEvents();

  return (
    <div className="bg-white rounded-lg relative">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors text-green-600"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateYear(-1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-green-600"
            title="Previous Year"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-sm font-semibold text-gray-800 relative flex items-center gap-1">
            <button
              ref={(el) => setMonthButtonRef(el)}
              onClick={(e) => {
                const button = e.currentTarget;
                const rect = button.getBoundingClientRect();
                const parentRect = button.closest('.bg-white.rounded-lg')?.getBoundingClientRect() || { left: 0, top: 0 };
                setMonthPickerPosition({
                  top: rect.bottom - parentRect.top + 4,
                  left: rect.left - parentRect.left,
                  width: rect.width,
                });
                setShowMonthPicker(!showMonthPicker);
              }}
              className="hover:text-green-600 transition-colors px-2 py-1 rounded hover:bg-green-50"
            >
              {monthNames[currentDate.getMonth()]}
            </button>
            <button
              ref={(el) => setYearButtonRef(el)}
              onClick={(e) => {
                const button = e.currentTarget;
                const rect = button.getBoundingClientRect();
                const parentRect = button.closest('.bg-white.rounded-lg')?.getBoundingClientRect() || { left: 0, top: 0 };
                setYearPickerPosition({
                  top: rect.bottom - parentRect.top + 4,
                  left: rect.left - parentRect.left,
                  width: rect.width,
                });
                setShowYearPicker(!showYearPicker);
              }}
              className="hover:text-green-600 transition-colors px-2 py-1 rounded hover:bg-green-50"
            >
              {currentDate.getFullYear()}
            </button>
          </h2>
          <button
            onClick={() => navigateYear(1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors text-green-600"
            title="Next Year"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <button
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-gray-100 rounded transition-colors text-green-600"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Year Picker Dropdown */}
      {showYearPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowYearPicker(false)}
          />
          {/* Dropdown */}
          <div 
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
            style={{
              top: `${yearPickerPosition.top}px`,
              left: `${yearPickerPosition.left}px`,
              minWidth: `${Math.max(yearPickerPosition.width || 80, 100)}px`,
            }}
          >
            <style>
              {`
                .year-dropdown::-webkit-scrollbar {
                  display: none;
                }
                .year-dropdown {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}
            </style>
            <div className="max-h-64 overflow-y-auto year-dropdown">
              {generateYears().map((year) => (
                <button
                  key={year}
                  onClick={() => selectYear(year)}
                  className={`w-full px-4 py-2.5 text-sm text-center transition-all duration-200 flex items-center justify-center ${
                    year === currentDate.getFullYear()
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 active:bg-emerald-100"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Month Picker Dropdown */}
      {showMonthPicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMonthPicker(false)}
          />
          {/* Dropdown */}
          <div 
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden"
            style={{
              top: `${monthPickerPosition.top}px`,
              left: `${monthPickerPosition.left}px`,
              minWidth: `${Math.max(monthPickerPosition.width || 80, 120)}px`,
            }}
          >
            <style>
              {`
                .month-dropdown::-webkit-scrollbar {
                  display: none;
                }
                .month-dropdown {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}
            </style>
            <div className="max-h-64 overflow-y-auto month-dropdown">
              {monthNames.map((month, index) => (
                <button
                  key={index}
                  onClick={() => selectMonth(index)}
                  className={`w-full px-4 py-2.5 text-sm text-center transition-all duration-200 flex items-center justify-center ${
                    index === currentDate.getMonth()
                      ? "bg-emerald-600 text-white font-semibold"
                      : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 active:bg-emerald-100"
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Day Names Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="h-6 flex items-center justify-center text-xs font-medium text-green-600"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 justify-items-center">{renderCalendar()}</div>

      {/* Custom Styled Tooltip */}
      {hoveredDate && hoveredEvents.length > 0 && (
        <div
          className="fixed z-50 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg shadow-2xl pointer-events-none transition-opacity duration-200 border border-emerald-700"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: "translate(-50%, -100%)",
            marginTop: "-8px",
          }}
        >
          <div className="space-y-1.5 max-w-xs">
            {hoveredEvents.map((event, index) => (
              <div 
                key={event.id || index} 
                className="whitespace-nowrap font-medium text-white"
              >
                {event.event || "No description"}
              </div>
            ))}
          </div>
          {/* Tooltip Arrow */}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #059669",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CalendarView;


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CalendarEvent } from "@shared/schema";
import { Calendar, X, Facebook, Instagram } from "lucide-react";

// June 2026
const YEAR = 2026;
const MONTH = 5; // 0-indexed
const TODAY = "2026-06-03";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ContentCalendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar"],
  });

  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach((ev) => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  const daysInMonth = getDaysInMonth(YEAR, MONTH);
  const firstDay = getFirstDayOfMonth(YEAR, MONTH);

  // Build calendar grid: fill with nulls for empty cells at start
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last week
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  function handleDayClick(dateKey: string, hasEvents: boolean) {
    setSelectedDate(dateKey);
    setSheetOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-semibold text-[#1A1410]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {MONTH_NAMES[MONTH]} {YEAR}
          </h2>
          <p className="text-sm text-[#6B5E45]">Content Publishing Calendar</p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[11px] font-medium">
          {[
            { label: "Father's Day", color: "#C9A84C" },
            { label: "Hwende", color: "#8b5cf6" },
            { label: "Youth Day", color: "#10b981" },
            { label: "Product", color: "#3b82f6" },
            { label: "Launched", color: "#22c55e" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: l.color }} />
              <span className="text-[#6B5E45]">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8E0CC] overflow-hidden shadow-sm">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#E8E0CC]">
            {DAY_NAMES.map((d) => (
              <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold text-[#6B5E45] uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#E8E0CC]">
            {cells.map((day, idx) => {
              if (!day) {
                return <div key={`empty-${idx}`} className="min-h-[80px] bg-[#F7F4EE]/50" />;
              }

              const dateKey = formatDateKey(YEAR, MONTH, day);
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = dateKey === TODAY;

              return (
                <div
                  key={dateKey}
                  onClick={() => handleDayClick(dateKey, dayEvents.length > 0)}
                  className={`min-h-[80px] p-1.5 cursor-pointer transition-colors hover:bg-[#F7F4EE] ${
                    isToday ? "bg-[#C9A84C]/5 ring-1 ring-[#C9A84C] ring-inset" : ""
                  }`}
                  data-testid={`calendar-day-${day}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-[#C9A84C] text-white"
                          : "text-[#1A1410]"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] text-[#6B5E45] font-medium">{dayEvents.length}</span>
                    )}
                  </div>

                  {/* Event pills */}
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[9px] leading-tight px-1 py-0.5 rounded truncate text-white font-medium"
                        style={{ backgroundColor: ev.color || "#C9A84C" }}
                        title={ev.title}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-[#6B5E45] pl-1">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide-over panel */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#F7F4EE] border-l border-[#E8E0CC] w-[380px] sm:w-[440px]">
          <SheetHeader>
            <SheetTitle style={{ fontFamily: "'Cormorant Garamond', serif" }} className="text-xl text-[#1A1410]">
              {selectedDate
                ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-ZA", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Event Details"}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-120px)]">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-10 text-[#6B5E45]">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No events scheduled for this day</p>
              </div>
            ) : (
              selectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white rounded-xl border border-[#E8E0CC] p-4 space-y-2"
                  data-testid={`event-detail-${ev.id}`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                      style={{ backgroundColor: ev.color || "#C9A84C" }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4
                        className="font-semibold text-[#1A1410] text-sm leading-tight"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {ev.title}
                      </h4>
                      {ev.campaign && (
                        <span className="text-[10px] text-[#6B5E45] font-medium">{ev.campaign}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#6B5E45] leading-relaxed pl-5">{ev.description}</p>
                  <div className="pl-5 flex items-center gap-2">
                    {(ev.platform === "facebook" || ev.platform === "both") && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-600">
                        <Facebook className="w-3 h-3" />
                        <span>Facebook</span>
                      </div>
                    )}
                    {(ev.platform === "instagram" || ev.platform === "both") && (
                      <div className="flex items-center gap-1 text-[10px] text-pink-600">
                        <Instagram className="w-3 h-3" />
                        <span>Instagram</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

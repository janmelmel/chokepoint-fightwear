import React from 'react';
import { CalendarClock, Info } from 'lucide-react';

// Add N business days to a date (skip Sat/Sun)
function addBusinessDays(startDate, days) {
  const date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) added++;
  }
  return date;
}

function formatDateOnly(date) {
  return date.toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function OrderEDC({ order, isCompleted, isCancelled }) {
  if (isCancelled) return null;

  const isCustom = !!(order.custom_print_text && order.custom_print_text.trim().length > 0);
  const businessDays = isCustom ? 15 : 10; // extra 5 days for custom designs
  const createdDate = new Date(order.created_date);
  const edcDate = addBusinessDays(createdDate, businessDays);
  const today = new Date();
  const isOverdue = !isCompleted && today > edcDate;
  const daysLeft = Math.ceil((edcDate - today) / (1000 * 60 * 60 * 24));

  return (
    <div
      className="border px-4 py-3 flex items-start gap-3"
      style={{
        borderColor: isCompleted ? '#22c55e33' : isOverdue ? '#ff000033' : '#ff8c0033',
        background: isCompleted ? '#22c55e08' : isOverdue ? '#ff000008' : '#ff8c0008',
      }}
    >
      <CalendarClock
        className="w-4 h-4 flex-shrink-0 mt-0.5"
        style={{ color: isCompleted ? '#22c55e' : isOverdue ? '#ff4444' : '#ff8c00' }}
      />
      <div className="flex-1 min-w-0">
        <p
          className="font-mono-ui text-[9px] uppercase tracking-widest mb-0.5"
          style={{ color: isCompleted ? '#22c55e' : isOverdue ? '#ff4444' : '#ff8c00' }}
        >
          {isCompleted ? 'Order Completed' : 'Estimated Date of Completion'}
        </p>
        {!isCompleted && (
          <>
            <p className="font-mono-ui text-sm text-white font-bold">{formatDateOnly(edcDate)}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {isOverdue ? (
                <span className="font-mono-ui text-[9px] text-[#ff4444]">Processing is taking longer than usual — we apologize for the delay.</span>
              ) : (
                <span className="font-mono-ui text-[9px] text-[#555]">
                  {daysLeft <= 1 ? 'Due today or tomorrow' : `~${daysLeft} days remaining`}
                </span>
              )}
              {isCustom && (
                <span className="flex items-center gap-1 font-mono-ui text-[9px] text-[#ff8c00] border border-[#ff8c00]/30 px-1.5 py-0.5">
                  <Info className="w-2.5 h-2.5" /> Custom design (+5 days)
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
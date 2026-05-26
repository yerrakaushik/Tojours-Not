import React from 'react';
import { CheckCircle2, Circle, Package, Truck, Clock } from 'lucide-react';

const STATUS_CONFIG = {
  'Processing': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-50', label: 'Preparing Your Magic' },
  'Shipped': { icon: Package, color: 'text-purple-400', bg: 'bg-purple-50', label: 'On its way' },
  'Out for Delivery': { icon: Truck, color: 'text-pink-400', bg: 'bg-pink-50', label: 'Almost there!' },
  'Delivered': { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-50', label: 'Delivered with Love' },
  'Cancelled': { icon: Circle, color: 'text-gray-400', bg: 'bg-gray-50', label: 'Cancelled' },
};

export default function TrackingTimeline({ history }) {
  if (!history || history.length === 0) return null;

  const currentStatus = history[history.length - 1].status;

  return (
    <div className="relative space-y-8 before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-pink-100">
      {history.map((event, i) => {
        const config = STATUS_CONFIG[event.status] || STATUS_CONFIG['Processing'];
        const isLast = i === history.length - 1;
        const isCompleted = i < history.length - 1 || event.status === 'Delivered';

        return (
          <div key={i} className="relative pl-12 group">
            <div className={`absolute left-4 top-1 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
              isCompleted ? config.bg : 'bg-white border-2 border-pink-100'
            } ${isCompleted ? 'scale-110' : 'group-hover:scale-110'}`}>
              <config.icon size={16} className={isCompleted ? config.color : 'text-gray-300'} />
            </div>
            <div className="space-y-1">
              <p className={`font-bold text-sm ${isCompleted ? 'text-charcoal-berry' : 'text-gray-400'}`}>
                {config.label}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(event.changed_at).toLocaleString()}
              </p>
              {event.notes && (
                <p className="text-xs text-charcoal-berry/60 mt-1 italic">
                  "{event.notes}"
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

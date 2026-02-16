import React from 'react'
import {Pencil} from "lucide-react"

const AvailabilityRow = ({availabilities, canManage, onEdit, isDoctor}) => {
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const formatDays = (days = []) =>
    days.map((d) => DAY_LABELS[d]).join(", ");

    const formatTime = (timeStr) => {
        const date = new Date(`1970-01-01T${timeStr}`);
        return date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

  return (
    <div
      key={availabilities._id}
      className="grid grid-cols-4 items-center gap-2 mb-8"
    >
    <div className="font-semibold text-gray-900">
      {availabilities.doctor?.name}
    </div>
    <div className="w-40">
      <span className="block text-sm font-medium text-gray-900">{formatDays(availabilities.dayOfWeek)}</span>
      <span className="text-xs text-gray-500">
        {formatTime(availabilities.startTime)} - {formatTime(availabilities.endTime)}
      </span>
    </div>

      <div className="flex justify-between items-center gap-4">
        {!isDoctor && (
          <span
          className={`px-3 py-1 rounded-full text-sm font-semibold
            ${
              availabilities.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }
          `}
        >
          {availabilities.isAvailable ? "Available" : "Unavailable"}
        </span>
        )}

        {canManage && (
          <button
            className="text-blue-800 hover:text-blue-900 text-sm font-medium transition-colors"
            onClick={() => onEdit(availabilities)}
          >
            <Pencil/>
          </button>
        )}
      </div>
    </div>
  )
}

export default AvailabilityRow
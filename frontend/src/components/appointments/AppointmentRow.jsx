import React from "react";

const AppointmentRow = ({
  appointment,
  canSeeDoctor,
  canManageAppointments,
  isDoctor,
  onEdit
}) => {
  return (
    <div
      key={appointment._id}
      className="grid grid-cols-5 items-center gap-2 mb-8"
    >
      <div className="font-semibold text-gray-900">
        {appointment.patientName}
      </div>
      <div className="font-semibold text-gray-900">
        {canSeeDoctor ? appointment.doctor?.name : "-"}
      </div>
      <div className="w-40">
        <span className="block text-sm font-medium text-gray-900">
          {new Date(appointment.startTime).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(appointment.startTime).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "UTC",
          })}
        </span>
      </div>
      <div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    appointment.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : appointment.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : appointment.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }
                `}
        >
          {appointment.status}
        </span>
      </div>

      {canManageAppointments && (
        <div className="flex gap-8">
          <button 
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => onEdit(appointment)}
            >
            Edit
          </button>
          <button className="text-red-600 hover:text-red-800 font-medium">
            Delete
          </button>
        </div>
      )}

      {isDoctor && (
        <div className="flex gap-3 ml-6">
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            Update status
          </button>
        </div>
      )}
    </div>
  );
};

export default AppointmentRow;

import { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";

const AppointmentForm = ({
  appointment = null,
  onClose,
  onSuccess,
  setEditingAppointment,
}) => {
  const { user } = useAuthContext();
  const isEdit = Boolean(appointment);
  const [isWalkIn, setIsWalkIn] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState("");

  const [availableDays, setAvailableDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    isEdit ? appointment.startTime.split("T")[0] : "",
  );
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(
    isEdit ? appointment.startTime.split("T")[1].slice(0, 5) : "",
  );

  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    doctor: "",
    startTime: "",
    status: "",
    isWalkIn: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //form data
  useEffect(() => {
    if (appointment) {
      console.log(appointment);
      const start = new Date(appointment.startTime);

      const date = [
        start.getFullYear(),
        String(start.getMonth() + 1).padStart(2, "0"),
        String(start.getDate()).padStart(2, "0"),
      ].join("-");

      const time = appointment.startTime
        .split("T")[1]
        .split("Z")[0]
        .slice(0, 5);

      setSelectedDate(date);
      setSelectedTime(time);
      setDoctorId(appointment.doctor?._id);

      setFormData({
        patientName: appointment.patientName,
        patientEmail: appointment.patientEmail,
        patientPhone: appointment.patientPhone,
        doctor: appointment.doctor?._id || "",
        startTime: appointment.startTime,
        status: appointment.status,
        isWalkIn: appointment.isWalkIn,
      });
    }
  }, [appointment]);

  //fetching available timeslots
  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    const fetchAvailableTimes = async () => {
      const res = await fetch(
        `http://localhost:5555/schedules/${doctorId}/available-slots?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      const json = await res.json();
      if (res.ok) {
        setAvailableSlots(Array.isArray(json) ? json : []);
      } else {
        console.error("Failed to fetch available times:", json.message);
        setAvailableSlots([]);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, doctorId, user.token]);

  //fetching doctors
  useEffect(() => {
    if (!user) return;
    const fetchDoctors = async () => {
      try {
        const res = await fetch("http://localhost:5555/users/doctors", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const json = await res.json();

        if (res.ok) {
          setDoctors(json);
        } else {
          console.error("Error fetching doctors:", json.message);
        }
      } catch (error) {
        console.error("server error.");
      }
    };

    fetchDoctors();
  }, []);

  //fetching available days
  useEffect(() => {
    if (!doctorId) return;
    const fetchAvailableDays = async () => {
      const res = await fetch(
        `http://localhost:5555/schedules/${doctorId}/available-days`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      const json = await res.json();

      if (res.ok) {
        setAvailableDays(
          Array.isArray(json.availableDays) ? json.availableDays : [],
        );
      } else {
        console.error("Failed to fetch available days:", json.message);
        setAvailableDays([]);
      }
    };

    fetchAvailableDays();
  }, [doctorId, user.token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    let startTime;
    if (!isEdit || (selectedDate && selectedTime)) {
      // if selectedTime is like "2026-02-02T11:30:00.000Z"
      const timePart = new Date(selectedTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }); // "11:30"

      // now you can split into hours and minutes
      const [hours, minutes] = timePart.split(":").map(Number);

      // combine with selectedDate
      const [year, month, day] = selectedDate.split("-").map(Number);
      startTime = new Date(year, month - 1, day, hours, minutes).toISOString();
    } else if (appointment?.startTime) {
      startTime = appointment.startTime;
    }

    try {
      const payload = {
        patientName: formData.patientName,
        patientEmail: formData.patientEmail,
        patientPhone: formData.patientPhone,
        doctor: doctorId,
        startTime: startTime,
        status: formData.status || "scheduled",
        isWalkIn: formData.isWalkIn || false,
      };

      const token = localStorage.getItem("token");

      const res = await fetch(
        isEdit
          ? `http://localhost:5555/appointments/${appointment._id}`
          : "http://localhost:5555/appointments/",

        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong. Try again later.");
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">
        {isEdit ? "Edit Appointment" : "Add Appointment"}
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            required
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Full name"          />
        </div>
        <div>
          <input
            type="email"
            name="patientEmail"
            value={formData.patientEmail}
            onChange={handleChange}
            required
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Email address"
          />
        </div>
        <div>
          <input
            type="text"
            name="patientPhone"
            value={formData.patientPhone}
            onChange={handleChange}
            required
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Phone number"
          />
        </div>

        <div>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
            className="w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select a doctor</option>

            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Dropdown */}
        <div>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className={`w-full text-gray-800 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none transition ${!formData.doctor ? 'opacity-50 cursor-not-allowed' : ''}`}
            required
            disabled={!doctorId}
          >
            <option value="">
              Date
            </option>
            {Array.isArray(availableDays) &&
              availableDays.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
            disabled={!doctorId || !selectedDate}
            className={`w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none transition ${!formData.doctor ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">
              Time
            </option>
            {availableSlots.map((slot) => (
              <option key={slot} value={slot}>
                {new Date(slot).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "UTC",
                })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none transition"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">Did not show</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isWalkIn}
              onChange={(e) => setIsWalkIn(e.target.checked)}
            />
            Walk-in appointment?
          </label>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !formData.patientName ||
              !formData.patientEmail ||
              !formData.patientPhone ||
              !doctorId ||
              !selectedDate ||
              !selectedTime
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Book Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;

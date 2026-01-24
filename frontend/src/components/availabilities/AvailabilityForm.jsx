import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'

const AvailabilityForm = ({availability = null, onClose, onSuccess}) => {
    const {user} = useAuthContext();
    console.log(user)
    const isEdit = Boolean(availability);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [doctors, setDoctors] = useState([]);
    const [doctorId, setDoctorId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState([]);
    const [isAvailable, setIsAvailable] = useState(true);

    const toggleDay = (day) => {
        setDayOfWeek((prev) =>
            prev.includes(day)
            ? prev.filter((d) => d !== day) // remove
            : [...prev, day] // add
        );
    };

    const DAYS = [
        { label: "Sun", value: 0 },
        { label: "Mon", value: 1 },
        { label: "Tue", value: 2 },
        { label: "Wed", value: 3 },
        { label: "Thu", value: 4 },
        { label: "Fri", value: 5 },
        { label: "Sat", value: 6 },
    ];
    
    const [formData, setFormData] = useState({
        doctor: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
        isAvailable: ""
    });

    //for edit function
    useEffect(() => {

    })

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (dayOfWeek.length === 0) {
            alert("Select at least one day");
            return;
        }

        const payload = dayOfWeek.map((day) => ({
            doctor: doctorId,
            dayOfWeek: day,
            startTime,
            endTime,
            isAvailable,
        }));

        console.log(payload);
        // send to backend
    };

    return (
    <form action={handleSubmit} className="space-y-4">
        {/* // doctor */}
        <div>
          <label className="block text-sm font-medium mb-1">Doctor</label>

          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Select a doctor</option>

            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        {/* // dayOfWeek */}
        <div>
            <label className="block text-sm font-medium mb-1">Days of Week</label>

            <div className="flex gap-2 flex-wrap">
                {DAYS.map((day) => {
                const selected = dayOfWeek.includes(day.value);

                return (
                    <button
                    type="button"
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm border transition
                        ${selected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white hover:bg-gray-100"
                        }`}
                    >
                    {day.label}
                    </button>
                );
                })}
            </div>
        </div>
        {/* // startTime */}
        <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
            />
        </div>

        {/* // endTime */}
        <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
            />
        </div>

        {/* // isAvailable */}
        <div>
            <label className="block text-sm font-medium mb-1">Availability</label>
            <select
                value={isAvailable}
                onChange={(e) => setIsAvailable(e.target.value === "true")}
                className="w-full border rounded-lg px-3 py-2 text-sm"
            >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
            </select>
        </div>

        {/* // submit */}
        <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
            Save Availability
        </button>
    </form>
  )
}

export default AvailabilityForm
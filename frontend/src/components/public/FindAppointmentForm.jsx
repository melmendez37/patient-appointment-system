import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FindAppointmentForm = ({onClose}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    ref: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try{
      const payload = {
        email: formData.email,
        ref: formData.ref,
      };

      const res = await fetch(`http://localhost:5555/public/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message);
      }

      sessionStorage.setItem('appointmentToken', json.token);

      console.log("Token", sessionStorage);
      navigate(`/public/appointments/${json.appointment._id}`);

    } catch (err) {
      setError(`Failed to find appointment. Please check your details and try again.`);
      console.error("Error finding appointment:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
      <h2 className="text-lg font-semibold mb-4">Find Appointment</h2>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          onChange={handleChange}
          name="email"
          value={formData.email}
          className="bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email address"
        />

        <input
          type="text"
          onChange={handleChange}
          name="ref"
          value={formData.ref}
          className="bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Appointment Reference"
        />
        <button
          disabled={isLoading}
          className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition mt-4"
        >
          Find Appointment
        </button>
        {error && (
          <div className="text-red-500 font-semibold text-center">{error}</div>
        )}
      </form>
    </div>
  );
};

export default FindAppointmentForm;

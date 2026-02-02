import { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";

const UsersForm = ({ user, onClose, onSuccess }) => {
  const { user: authUser } = useAuthContext();
  const isEdit = Boolean(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "patient",
    isActive: "true",
    doctors: [],
  });

  const [doctors, setDoctors] = useState([]);

  const toggleDoctor = (doctorId) => {
    setFormData((prev) => ({
      ...prev,
      doctors: prev.doctors.includes(doctorId)
        ? prev.doctors.filter((id) => id !== doctorId)
        : [...prev.doctors, doctorId],
    }));
  };

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "patient",
        isActive:
          user.isActive === true
            ? "true"
            : user.isActive === false
            ? "false"
            : "",
        doctors: user.doctors || [],
      });
    }
  }, [isEdit, user]);

  //fetching doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!authUser) return;
      try {
        const res = await fetch("http://localhost:5555/users/doctors", {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
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

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        isActive: !!formData.isActive,
        doctors: formData.role === "staff" ? formData.doctors : undefined,
      };

      const token = localStorage.getItem("token");

      const res = await fetch(
        isEdit
          ? `http://localhost:5555/users/${user._id}`
          : "http://localhost:5555/users/",
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
      console.log(json);

      if (!res.ok) {
        setError(json.error || "Something went wrong. Try again later.");
        return;
      }

      onSuccess(json);
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
        {isEdit ? "Edit User" : "Add User"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="scheduled">Select Role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {formData.role === "staff" && (
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Assign Doctors
            </label>

            <div className="flex gap-2 flex-wrap">
              {doctors.map((doctor) => {
                const selected = formData.doctors.includes(doctor._id);

                return (
                  <button
                    key={doctor._id}
                    type="button"
                    onClick={() => toggleDoctor(doctor._id)}
                    className={`px-3 py-2 rounded-lg text-sm border transition
                ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white hover:bg-gray-100"
                }`}
                  >
                    {doctor.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Active Status
          </label>
          <select
            name="isActive"
            value={formData.isActive}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="">Select Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
          onClick={handleSubmit}
        >
          {isEdit ? "Update User" : "Add User"}
        </button>
      </form>
    </div>
  );
};

export default UsersForm;

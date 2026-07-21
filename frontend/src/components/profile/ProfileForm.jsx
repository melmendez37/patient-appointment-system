import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";

const ProfileForm = ({ profile, onClose, onSuccess }) => {
  const { user } = useAuthContext();
  const isAdmin = user.user.role === "admin";
  const [setUser] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    doctors: [],
    isActive: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${user.user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const json = await res.json();

        if (res.ok) {
          setUser(json);
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [user]);

  //fetching doctors
  useEffect(() => {
    if (!user) return;
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/doctors`, {
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
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    console.log("ProfileForm profile:", profile);

    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      password: "",
      role: profile.role || "",
      doctors: profile.doctors?.map(String) || [],
      isActive: profile.isActive ?? true,
    });
  }, [profile]);

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

      console.log("Submitting profile update with payload:", payload);

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isAdmin) {
        payload.role = formData.role;
        payload.doctors = formData.doctors;
        payload.isActive = formData.isActive;
      }

      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${profile._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Something went wrong. Try again later.");
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
      <h2 className="text-lg font-semibold mb-4">Edit profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <label className="block text-sm font-medium mb-2">
          Assigned Doctors
        </label>
        
        {isAdmin && (
          <>
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
                    : "bg-gray-100 border-gray-300 hover:bg-gray-100"
                }`}
                  >
                    {doctor.name}
                  </button>
                );
              })}
            </div>
            {/* Role */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="staff">Staff</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>

            {/* Active */}
            <select
              name="isActive"
              value={formData.isActive}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isActive: e.target.value === "true",
                }))
              }
              className="w-full text-gray-700 bg-gray-100 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </>
        )}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;

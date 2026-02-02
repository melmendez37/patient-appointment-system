import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";

const ProfileForm = ({ profile, onClose, onSuccess }) => {
  const { user,setUser } = useAuthContext();
  const isAdmin = user.user.role === "admin";
  const isStaff = user.user.role === "staff";
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
      if(!user) return;
      try {
        const res = await fetch(
          `http://localhost:5555/users/${user.user.id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const json = await res.json();

        if(res.ok){
          setUser(json);
        }
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    }

    fetchUser();
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
      doctors: profile.doctors || [],
      isActive: profile.isActive ?? true,
    });
  }, [user]);

   //fetching doctors
    useEffect(() => {
      const fetchDoctors = async () => {
        if (!user) return;
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
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (isAdmin) {
        payload.role = formData.role;
        payload.doctors = formData.doctors;
        payload.isActive = formData.isActive;
      }

      const res = await fetch(`http://localhost:5555/users/${profile._id}`, {
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
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="New password (optional)"
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isStaff && (
          <>
            {/* Doctors */}
            <select
              multiple
              value={formData.doctors}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  doctors: [...e.target.selectedOptions].map((o) => o.value),
                }))
              }
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </>
        )}

        {isAdmin && (
          <>
            {/* Role */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
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

import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import ProfileForm from "../../components/profile/ProfileForm";
import ChangePassword from "../../components/profile/ChangePassword";

const ViewProfile = () => {
  const { user, setUser } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState();
  const [modalType, setModalType] = useState(null);
  const [profile, setProfile] = useState(null);

  const fetchProfile = async () => {
      if(!user) return;
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/users/${user.user.id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      const json = await response.json();

      if (response.ok) setProfile(json);
    };
    console.log("Fetching profile...", profile);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return (
    <div className="flex flex-col p-2">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Profile</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Name
          </label>
          <p className="text-gray-900 font-semibold">{profile?.name}</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Email
          </label>
          <p className="text-gray-900 font-semibold">{profile?.email}</p>
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Role
          </label>
          <p className="text-gray-900 font-semibold capitalize">
            {profile?.role}
          </p>
        </div>
      </div>

      {/* Optional Edit Button */}
      <div className="flex gap-4 mt-6">
        <button
          className="w-full bg-blue-800 hover:bg-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          onClick={() => {
            setModalType("profile");
          }}
        >
          Edit Profile
        </button>

        <button
          className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          onClick={() => {
            setModalType("password");
          }}
        >
          Change Password
        </button>
      </div>

      {modalType && (
        <Modal onClose={() => setModalType(null)}>
          {modalType === "profile" && (
            <ProfileForm
            profile={profile}
            onClose={() => setModalType(null)}
            onSuccess={fetchProfile}
          />
          )}

          {modalType === "password" && (
            <ChangePassword onClose={() => setModalType(null)} />
          )}
        </Modal>
      )}
    </div>
  );
};

export default ViewProfile;

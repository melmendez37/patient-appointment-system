import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import ProfileForm from "../../components/profile/ProfileForm";

const ViewProfile = () => {
  const { user, setUser } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if(!user) return;
      const response = await fetch(
        `http://localhost:5555/users/${user.user.id}`,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );
      const json = await response.json();
      
      if (response.ok) setProfile(json);
    };
    console.log("Fetching profile...", profile);
    fetchProfile();
  }, [user]);

  return (
    <div className="flex-1 p-6 bg-white">
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
      <div className="mt-6">
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Edit Profile
        </button>
      </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <ProfileForm
            profile={profile}
            onClose={() => setIsModalOpen(false)}
            onSuccess={(updatedUser) => {
              setProfile(updatedUser);
              setUser(updatedUser);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViewProfile;

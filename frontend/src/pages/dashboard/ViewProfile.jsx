import { useState } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import ProfileForm from "../../components/profile/ProfileForm";

const ViewProfile = () => {
  const { user } = useAuthContext();

  const [isModalOpen, setIsModalOpen] = useState();

  return (
    <div className="flex-1 p-6 bg-white">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Profile</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Name
            </label>
            <p className="text-gray-900 font-semibold">{user.user.name}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email
            </label>
            <p className="text-gray-900 font-semibold">{user.user.email}</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Role
            </label>
            <p className="text-gray-900 font-semibold capitalize">{user.user.role}</p>
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
            profile={user}
            onClose={() => setIsModalOpen(false)}
            onSuccess={(json) => {
              dispatch({type: "LOGIN", payload: json})
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViewProfile;

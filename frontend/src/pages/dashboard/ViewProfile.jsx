import { useAuthContext } from "../../hooks/useAuthContext";

const ViewProfile = () => {
  const { user } = useAuthContext();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Loading user info...</p>
      </div>
    );
  }

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
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Edit Profile
          </button>
        </div>
    </div>
  );
};

export default ViewProfile;

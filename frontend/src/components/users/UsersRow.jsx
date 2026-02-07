const UsersRow = ({ user, canManage, onEdit }) => {
  return (
    <div key={user._id} className="grid grid-cols-4 items-center gap-2 mb-8">
      <div className="w-40">
        <span className="block text-sm font-semibold text-gray-900">
          {user.name}
        </span>
        <span className="text-xs text-gray-500">
          {user.email}
        </span>
      </div>
      <div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold
                  ${
                    user.role === "doctor"
                      ? "bg-blue-100 text-blue-700"
                      : user.role === "staff"
                        ? "bg-green-100 text-green-700"
                        : user.role === "admin"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-700"
                  }
                `}
        >
          {user.role}
        </span>
      </div>
      <div className="flex justify-between items-center gap-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold
            ${
              user.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }
          `}
        >
          {user.isActive ? "Active" : "Inactive"}
        </span>

        {canManage && (
          <button
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            onClick={() => onEdit(user)}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default UsersRow;

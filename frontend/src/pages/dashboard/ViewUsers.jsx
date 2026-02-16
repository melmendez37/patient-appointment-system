import { useState, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import Modal from "../../components/Modal";
import UsersRow from "../../components/users/UsersRow";
import UsersForm from "../../components/users/UsersForm";

const ViewUsers = () => {
  const { user } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState();
  const [allUsers, setAllUsers] = useState(null);
  const canManage = user?.user.role === "admin";
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
      if (!user) return;
      const response = await fetch(`http://localhost:5555/users/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const json = await response.json();
      if (response.ok) setAllUsers(json.data);
    };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-start p-2">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Users</h1>
        <button
          className="px-4 py-2 rounded-lg bg-blue-800 text-white font-medium hover:bg-blue-900 transition"
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
        >
          Add User
        </button>
      </div>

    <div className="grid grid-cols-4 gap-2 mb-6 text-sm items-center font-semibold text-gray-500">
        <div>User</div>
        <div>Role</div>
        <div>isActive</div>
      </div>

      {allUsers?.length === 0 && (
        <p className="text-center mt-4">No users found.</p>
      )}
      <div className="max-h-150 overflow-y-auto">
        {allUsers?.map((user) => (
        <UsersRow
          key={user._id}
          user={user}
          canManage={canManage}
          onEdit={handleEdit}
        />
      ))}
        </div>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <UsersForm
            user={editingUser}
            onClose={() => setIsModalOpen(false)}
            onSuccess={fetchUsers}
            setEditingUser={handleEdit}
          />
        </Modal>
      )}
    </div>
  );
};

export default ViewUsers;

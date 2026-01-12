import { useAuthContext } from "../../hooks/useAuthContext";

const ViewProfile = () => {
  const { user } = useAuthContext();

  return (
    <div className="flex-1 p-6 bg-white">
        {user.user.name}
        {user.user.email}
        {user.user.role}
    </div>
  );
};

export default ViewProfile;

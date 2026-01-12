import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ViewAppointments from "./appointments/ViewAppointments";

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex min-h-screen gap-6">
        <div className="w-64 bg-gray-800 text-white p-4">
          <Sidebar />
        </div>

        <ViewAppointments />
      </div>
    </div>
  );
};

export default HomePage;

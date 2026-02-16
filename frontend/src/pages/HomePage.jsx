import Modal from "../components/Modal";
import Navbar from "../components/Navbar";
import { useState } from "react";
import FindAppointmentForm from "../components/public/FindAppointmentForm";
import CreateAppointmentForm from "../components/public/CreateAppointmentForm";
import { CirclePlus, Search, ClipboardCheck } from "lucide-react";

const HomePage = () => {
  const [modalType, setModalType] = useState(null);
  return (
    <div className="min-h-screen flex flex-col gap-8">
      <div>
        <Navbar />
      </div>
      <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
        <button
          onClick={() => setModalType("add")}
          className="flex justify-center items-center gap-2 px-4 py-2 bg-orange-800 text-white p-2 rounded"
          >
            <CirclePlus/> Create Appointment
          </button>
          <button
            onClick={() => setModalType("view")}
            className="flex justify-center items-center gap-2 bg-blue-800 text-white p-2 rounded"
          >
            <Search/> Find Appointment
          </button>
          <button
            onClick={() => setModalType("manage")}
            className="flex justify-center items-center gap-2 bg-green-800 text-white p-2 rounded"
          >
            <ClipboardCheck/>Manage Booking
          </button>
      </div>

      {modalType && (
        <Modal onClose={() => setModalType(null)}>
          {modalType === "add" && (
            <CreateAppointmentForm
              modalType={modalType}
              onClose={() => setModalType(null)}
            />
          )}
          {modalType === "view" && (
            <FindAppointmentForm
              modalType={modalType}
              onClose={() => setModalType("view")}
            />
          )}
          {modalType === "manage" && (
            <FindAppointmentForm
              modalType={modalType}
              onClose={() => setModalType("manage")}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default HomePage;

export const generateAvailableSlots = (
    date, startTime, endTime, bookedAppointments
) => {
    //generate 30min slots between startTime and endTime
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const [endHours, endMinutes] = endTime.split(":").map(Number);
      
      let current = new Date(targetDate); // copy the date
      current.setHours(startHours, startMinutes, 0, 0);

      const end = new Date(targetDate);
      end.setHours(endHours, endMinutes, 0, 0);
      const slots = [];
      while (current < end) {
        slots.push(new Date(current));
        current.setMinutes(current.getMinutes() + 30); // Assuming 30-minute slots
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const bookedSlots = bookedAppointments.map((app) =>
        app.startTime.getTime()
      );

      //filter out booked slots
      return slots.filter(
        (slot) => !bookedSlots.includes(slot.getTime())
      );

};
import { useState, useEffect } from "react";

const TimeTable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    "09:00 - 10:30",
    "10:30 - 12:00",
    "12:00 - 13:00",
    "13:00 - 14:30",
    "14:30 - 16:00",
    "16:00 - 17:30",
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTimetables([
        {
          id: 1,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Monday",
          timeSlot: "09:00 - 10:30",
          subject: "Data Structures",
          faculty: "Dr. Smith",
          room: "Lab 101",
        },
        {
          id: 2,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Monday",
          timeSlot: "10:30 - 12:00",
          subject: "Algorithms",
          faculty: "Prof. Johnson",
          room: "Room 205",
        },
        {
          id: 3,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Tuesday",
          timeSlot: "09:00 - 10:30",
          subject: "Database Systems",
          faculty: "Dr. Williams",
          room: "Lab 102",
        },
        {
          id: 4,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Tuesday",
          timeSlot: "13:00 - 14:30",
          subject: "Operating Systems",
          faculty: "Prof. Brown",
          room: "Room 301",
        },
        {
          id: 5,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Wednesday",
          timeSlot: "09:00 - 10:30",
          subject: "Computer Networks",
          faculty: "Dr. Davis",
          room: "Lab 103",
        },
        {
          id: 6,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Wednesday",
          timeSlot: "14:30 - 16:00",
          subject: "Software Engineering",
          faculty: "Prof. Miller",
          room: "Room 302",
        },
        {
          id: 7,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Thursday",
          timeSlot: "10:30 - 12:00",
          subject: "Web Development",
          faculty: "Dr. Wilson",
          room: "Lab 104",
        },
        {
          id: 8,
          course: "Computer Science",
          semester: "3rd Semester",
          day: "Friday",
          timeSlot: "09:00 - 10:30",
          subject: "Machine Learning",
          faculty: "Prof. Moore",
          room: "Room 303",
        },
        {
          id: 9,
          course: "Mathematics",
          semester: "2nd Semester",
          day: "Monday",
          timeSlot: "13:00 - 14:30",
          subject: "Calculus",
          faculty: "Dr. Taylor",
          room: "Room 401",
        },
        {
          id: 10,
          course: "Mathematics",
          semester: "2nd Semester",
          day: "Tuesday",
          timeSlot: "10:30 - 12:00",
          subject: "Linear Algebra",
          faculty: "Prof. Anderson",
          room: "Room 402",
        },
        {
          id: 11,
          course: "Mathematics",
          semester: "2nd Semester",
          day: "Wednesday",
          timeSlot: "13:00 - 14:30",
          subject: "Probability",
          faculty: "Dr. Thomas",
          room: "Room 403",
        },
        {
          id: 12,
          course: "Mathematics",
          semester: "2nd Semester",
          day: "Thursday",
          timeSlot: "09:00 - 10:30",
          subject: "Statistics",
          faculty: "Prof. Jackson",
          room: "Room 404",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  // Build timetable grid
  const buildTimetableGrid = () => {
    const grid = {};
    days.forEach((day) => {
      grid[day] = {};
      timeSlots.forEach((slot) => {
        grid[day][slot] = null;
      });
    });

    timetables.forEach((item) => {
      if (grid[item.day] && grid[item.day][item.timeSlot] === null) {
        grid[item.day][item.timeSlot] = item;
      }
    });

    return grid;
  };

  const timetableGrid = buildTimetableGrid();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#525B88]">Class Time Table</h1>
        <p className="text-gray-600 mt-1">View class schedules</p>
      </div>

      {/* TimeTable Grid */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-[#525b88]">Class Schedule</h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 bg-[#525b88] text-white px-4 py-3 text-sm font-medium">
                    Time
                  </th>
                  {days.map((day) => (
                    <th
                      key={day}
                      className="border border-gray-300 bg-[#525b88] text-white px-4 py-3 text-sm font-medium"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot}>
                    <td className="border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700">
                      {slot}
                    </td>
                    {days.map((day) => {
                      const classData = timetableGrid[day]?.[slot];
                      return (
                        <td
                          key={`${day}-${slot}`}
                          className="border border-gray-300 px-3 py-2 text-xs min-w-[150px]"
                        >
                          {classData ? (
                            <div className="bg-blue-50 border border-blue-200 rounded p-2">
                              <div className="font-semibold text-blue-900 mb-1">
                                {classData.subject}
                              </div>
                              <div className="text-blue-700 mb-1">
                                {classData.faculty}
                              </div>
                              <div className="text-blue-600 text-xs">
                                {classData.room}
                              </div>
                            </div>
                          ) : (
                            <div className="text-gray-400 text-center py-2">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTable;


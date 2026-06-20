// Example logic for MarkAttendance.js
const handleSubmit = async () => {
  const attendanceData = students.map(s => ({
    studentId: s._id,
    status: attendanceMap[s._id] || "Absent"
  }));
  await Axios.post("/api/attendance", { date: new Date(), records: attendanceData });
  alert("Attendance saved!");
};
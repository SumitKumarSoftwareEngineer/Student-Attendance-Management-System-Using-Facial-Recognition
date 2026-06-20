import React, { useState, useEffect } from "react"
import Axios from "axios"

function AttendanceSheet() {
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({}) // Stores { studentId: "Present" }

  useEffect(() => {
    Axios.get("/api/students").then(res => setStudents(res.data))
  }, [])

  const handleSave = () => {
    const data = students.map(s => ({
      studentId: s._id,
      status: marks[s._id] || "Absent"
    }))
    Axios.post("/api/mark-attendance", { date: new Date(), attendanceData: data })
      .then(() => alert("Saved!"))
  }

  return (
    <div className="container mt-5">
      <h2>Mark Attendance</h2>
      <ul className="list-group mb-3">
        {students.map(s => (
          <li key={s._id} className="list-group-item d-flex justify-content-between">
            {s.name}
            <div>
              <button onClick={() => setMarks({...marks, [s._id]: "Present"})} 
                      className={`btn btn-sm ${marks[s._id]==="Present" ? "btn-success" : "btn-outline-success"}`}>P</button>
              <button onClick={() => setMarks({...marks, [s._id]: "Absent"})} 
                      className={`btn btn-sm ms-2 ${marks[s._id]==="Absent" ? "btn-danger" : "btn-outline-danger"}`}>A</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={handleSave} className="btn btn-primary w-100">Submit Attendance</button>
    </div>
  )
}
export default AttendanceSheet
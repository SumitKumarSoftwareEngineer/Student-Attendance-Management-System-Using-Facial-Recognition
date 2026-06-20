import React, { useState, useEffect } from "react"
import Axios from "axios"

function Attendance() {
  const [students, setStudents] = useState([])
  const [marks, setMarks] = useState({})

  useEffect(() => {
    async function fetchStudents() {
      const res = await Axios.get("/api/students")
      setStudents(res.data)
    }
    fetchStudents()
  }, [])

  const markStatus = (id, status) => {
    setMarks({ ...marks, [id]: status })
  }

  const saveAttendance = async () => {
    const data = students.map(s => ({ studentId: s._id, status: marks[s._id] || "Absent" }))
    await Axios.post("/api/mark-attendance", { date: new Date(), records: data })
    alert("Attendance Marked Successfully!")
  }

  return (
    <div className="container mt-4">
      <h2>Mark Daily Attendance</h2>
      <ul className="list-group">
        {students.map(s => (
          <li key={s._id} className="list-group-item d-flex justify-content-between align-items-center">
            {s.name} ({s.course})
            <div>
              <button onClick={() => markStatus(s._id, "Present")} className={`btn btn-sm ms-1 ${marks[s._id] === "Present" ? "btn-success" : "btn-outline-success"}`}>P</button>
              <button onClick={() => markStatus(s._id, "Absent")} className={`btn btn-sm ms-1 ${marks[s._id] === "Absent" ? "btn-danger" : "btn-outline-danger"}`}>A</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={saveAttendance} className="btn btn-primary mt-3 w-100">Submit Records</button>
    </div>
  )
}
export default Attendance
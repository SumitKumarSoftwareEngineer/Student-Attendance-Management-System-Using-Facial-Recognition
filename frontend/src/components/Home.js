import React from "react"

function Home() {
  return (
    <div className="container mt-4 text-center">
      <div className="row">
        <div className="col-md-12 bg-light p-5 rounded shadow-sm">
          <h1 className="display-4">Welcome to SAMS</h1>
          <p className="lead">Student Attendance Management System Dashboard</p>
          <hr className="my-4" />
          <div className="d-flex justify-content-around">
            <div className="p-4 border rounded"><h3>Total Students</h3><p className="h2 text-primary">Loading...</p></div>
            <div className="p-4 border rounded"><h3>Today's Status</h3><p className="h2 text-success">Active</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Home
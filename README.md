Student Attendance Management System (SAMS) - MERN
A modern MERN Stack web application for managing student attendance using Facial Recognition with webcam support.
Built with Express.js, MongoDB, EJS, Bootstrap 5, and face-api.js.

✨ Features

Facial Recognition Attendance – Mark attendance using webcam (face-api.js)
Student Database – Add, edit, delete, and manage students with photos
Attendance Log – View, filter, and export attendance records as CSV
Role-Based Login – Separate access for Admin and Faculty
Student Profile – View individual attendance history and percentage
Responsive UI – Clean and modern design using Bootstrap 5


🖥️ Demo Credentials
RoleUsernamePasswordAdminadminadminFacultyfacultyfaculty

🚀 Tech Stack

Frontend: EJS, Bootstrap 5, JavaScript
Backend: Node.js, Express.js
Database: MongoDB
Facial Recognition: face-api.js + TensorFlow.js
Others: Sharp.js, express-session


🛠️ Setup Instructions

Clone the repositoryBashgit clone https://github.com/SumitKumarSoftwareEngineer/Student-Attendance-Management-System-MERN.git
cd Student-Attendance-Management-System-MERN
Install DependenciesBashcd backend
npm install
Create Environment Variable
Create a .env file inside the backend folder:envCONNECTIONSTRING=mongodb://127.0.0.1:27017/sams
PORT=3000
Start MongoDB (Local MongoDB should be running)
Run the ApplicationBashnpm start
Open your browser and go to http://localhost:3000


📁 Project Structure
textbackend/
├── server.js
├── package.json
frontend/
├── views/
│   ├── partials/
│   ├── login.ejs
│   ├── admin.ejs
│   ├── attendance-log.ejs
│   └── ...
public/
├── uploaded-photos/
└── ...

🔮 Future Enhancements

Auto check-out / logout feature
Cancel attendance option
Detailed individual student reports
Manual attendance by admin


Developed by Sumit Kumar

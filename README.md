Student Attendance Management System (SAMS) - MERN
A modern MERN Stack web application for managing student attendance using Facial Recognition with webcam support.
Built with Express.js, MongoDB, EJS, Bootstrap 5, and face-api.js (TensorFlow.js).

✨ Features

Facial Recognition Attendance – Mark attendance using webcam (face-api.js)
Student Database – Add, edit, delete, and manage students with photos
Attendance Log – View, filter, and export attendance records (CSV)
Role-Based Login – Separate access for Admin and Faculty
Student Profile – Individual attendance history and statistics
Responsive Design – Clean and modern UI with Bootstrap


🖥️ Demo Credentials

RoleUsernamePasswordAdminadminadminFacultyfacultyfaculty

🚀 Tech Stack

Frontend: HTML, EJS, Bootstrap 5, JavaScript
Backend: Node.js, Express.js
Database: MongoDB
Facial Recognition: face-api.js + TensorFlow.js
Image Processing: Sharp.js
Session Management: express-session


📸 Screenshots
Attendance Taking (Facial Recognition)

Attendance Log

Student Database


🛠️ Setup Instructions

Clone the repositoryBashgit clone https://github.com/yourusername/Student-Attendance-Management-System-MERN.git
cd Student-Attendance-Management-System-MERN
Install DependenciesBashcd backend
npm install
Setup Environment Variables
Create .env file in backend folder:envCONNECTIONSTRING=mongodb://127.0.0.1:27017/yourdbname
PORT=3000
Start MongoDB (Make sure MongoDB is running locally)
Run the ApplicationBashnpm start
Open browser and go to http://localhost:3000


📁 Project Structure
textbackend/
├── server.js
├── package.json
frontend/
├── views/
│   ├── partials/header.ejs
│   ├── login.ejs
│   ├── admin.ejs
│   ├── attendance-log.ejs
│   └── ...
public/
├── uploaded-photos/
└── ...

🔮 Future Enhancements

Cancel attendance option
Auto check-out (logout) feature
Individual student detailed reports
Manual attendance by admin
Better face recognition accuracy

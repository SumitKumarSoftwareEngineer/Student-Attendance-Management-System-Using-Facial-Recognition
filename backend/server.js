
require("dotenv").config();

const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const multer = require("multer");
const upload = multer();
const sanitizeHTML = require("sanitize-html");
const fse = require("fs-extra");
const sharp = require("sharp");
const path = require("path");

const { Parser } = require("json2csv");

const session = require("express-session");


let db;
const app = express();

const publicPath = path.join(__dirname, "../frontend/public");
const viewsPath = path.join(__dirname, "../frontend/views");
const uploadPath = path.join(publicPath, "uploaded-photos");

fse.ensureDirSync(uploadPath);

app.set("view engine", "ejs");
app.set("views", viewsPath);
app.use(express.static(publicPath));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// ==================== SESSION SETUP (NEW) ====================
app.use(session({
  secret: "sams-final-year-project-2026-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 60 * 60 * 1000, 
    httpOnly: true 
  }
}));



function ourCleanup(req, res, next) {
  if (typeof req.body.name !== "string") req.body.name = "";
  if (typeof req.body.course !== "string") req.body.course = "";
  if (typeof req.body.branch !== "string") req.body.branch = "";
  if (typeof req.body.semester !== "string") req.body.semester = "";
  if (typeof req.body._id !== "string") req.body._id = "";
  if (typeof req.body.rollNumber !== "string") req.body.rollNumber = "";
  if (typeof req.body.email !== "string") req.body.email = "";

  req.cleanData = {
    name: sanitizeHTML(req.body.name.trim(), { allowedTags: [], allowedAttributes: {} }),
    course: sanitizeHTML(req.body.course.trim(), { allowedTags: [], allowedAttributes: {} }),
    branch: sanitizeHTML(req.body.branch.trim(), { allowedTags: [], allowedAttributes: {} }),
    semester: sanitizeHTML(req.body.semester.trim(), { allowedTags: [], allowedAttributes: {} }),
    rollNumber: sanitizeHTML(req.body.rollNumber.trim(), { allowedTags: [], allowedAttributes: {} }),
    email: sanitizeHTML(req.body.email.trim(), { allowedTags: [], allowedAttributes: {} })
  };

  next();
}

// Session Auth Middleware
function isAuthenticated(req, res, next) {
  if (req.session && req.session.isLoggedIn) {
    return next();
  }
  res.redirect("/login");
}

// Admin Only
function isAdmin(req, res, next) {
  if (req.session && req.session.isLoggedIn && req.session.role === "admin") {
    return next();
  }
  res.redirect("/login");
}

// Faculty Only (or Admin)
function isFaculty(req, res, next) {
  if (req.session && req.session.isLoggedIn && 
      (req.session.role === "faculty" || req.session.role === "admin")) {
    return next();
  }
  res.redirect("/login");
}

function buildAttendanceFilter(query) {
  const { day, month, year, studentName, branch, semester } = query;
  const filter = {};

  if (studentName && studentName.trim()) {
    filter.studentName = { $regex: studentName.trim(), $options: "i" };
  }
  if (branch && branch.trim()) {
    filter.branch = { $regex: branch.trim(), $options: "i" };
  }
  if (semester && semester.trim()) {
    filter.semester = semester.trim();
  }

  // Date logic remains the same
  let startDate = null;
  let endDate = null;
  if (year && month && day) {
    startDate = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
    endDate = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
  } else if (year && month) {
    startDate = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
    endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
  } else if (year) {
    startDate = new Date(Number(year), 0, 1, 0, 0, 0, 0);
    endDate = new Date(Number(year), 11, 31, 23, 59, 59, 999);
  }

  if (startDate && endDate) {
    filter.date = { $gte: startDate, $lte: endDate };
  }

  return filter;
}

// ====================== PAGE ROUTES ======================
app.get("/", (req, res) => res.render("home", { session: req.session }));
app.get("/home", (req, res) => res.render("home", { session: req.session }));
app.get("/about", (req, res) => res.render("about", { session: req.session }));
app.get("/login", (req, res) => {
  if (req.session && req.session.isLoggedIn) {
    if (req.session.role === "admin") return res.redirect("/admin");
    return res.redirect("/home");
  }
  res.render("login", { error: null, session: req.session });
});
app.get("/take-attendance", isFaculty, (req, res) => 
  res.render("index", { session: req.session })
);

app.get("/attendance-log", isFaculty, async (req, res) => {
  try {
    const filter = buildAttendanceFilter(req.query);
    const logs = await db.collection("attendanceLog")
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    res.render("attendance-log", {
      logs,
      filters: {
        day: req.query.day || "",
        month: req.query.month || "",
        year: req.query.year || "",
        studentName: req.query.studentName || "",
        branch: req.query.branch || "",
        semester: req.query.semester || ""
      },
      session: req.session   // ← Important
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading attendance log page");
  }
});
// ====================== CSV DOWNLOAD (Single Clean Route) ======================
app.get("/attendance-log/download/csv", async (req, res) => {
  try {
    const filter = buildAttendanceFilter(req.query);

    const logs = await db.collection("attendanceLog")
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    // Updated with Branch & Semester
    const rows = logs.map((log) => ({
      studentName: log.studentName || "",
      branch: log.branch || "",
      semester: log.semester || "",
      status: log.status || "",
      date: log.date ? new Date(log.date).toLocaleString() : "",
      studentId: log.studentId || ""
    }));

    const parser = new Parser({
      fields: ["studentName", "branch", "semester", "status", "date", "studentId"]
    });

    const csv = parser.parse(rows);

    res.setHeader("Content-Disposition", "attachment; filename=attendance-log.csv");
    res.setHeader("Content-Type", "text/csv; charset=UTF-8");
    res.send(csv);
  } catch (error) {
    console.error("CSV Download Error:", error);
    res.status(500).send("CSV download failed");
  }
});

// Student Database
app.get("/studentdatabase", isFaculty, async (req, res) => {
  try {
    const allStudents = await db.collection("students").find().toArray();
    res.render("studentdatabase", { students: allStudents, session: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading student database");
  }
});

// Protected Admin Route
app.get("/admin", isAdmin, async (req, res) => {
  try {
    const students = await db.collection("students").find().toArray();
    res.render("admin", { students, session: req.session });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

// ====================== API ROUTES ======================
app.get("/api/students", async (req, res) => {
  try {
    const allStudents = await db.collection("students").find().toArray();
    res.json(allStudents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
});

app.get("/api/getStudentByName/:studentName", async (req, res) => {
  try {
    const decodedName = decodeURIComponent(req.params.studentName);
    const student = await db.collection("students").findOne({ name: decodedName });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch student" });
  }
});

app.get("/api/attendance-log", async (req, res) => {
  try {
    const logs = await db.collection("attendanceLog").find().sort({ date: -1 }).toArray();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch attendance log" });
  }
});

// CSV download
app.get("/attendance-log/download/csv", async (req, res) => {
  try {
    const filter = buildAttendanceFilter(req.query);

    const logs = await db
      .collection("attendanceLog")
      .find(filter)
      .sort({ date: -1 })
      .toArray();

    const rows = logs.map((log) => ({
      studentName: log.studentName || "",
      status: log.status || "",
      date: log.date ? new Date(log.date).toLocaleString() : "",
      studentId: log.studentId || ""
    }));

    const parser = new Parser({
      fields: ["studentName", "status", "date", "studentId"]
    });

    const csv = parser.parse(rows);

    res.header("Content-Type", "text/csv");
    res.attachment("attendance-log.csv");
    return res.send(csv);
  } catch (error) {
    console.error(error);
    res.status(500).send("CSV download failed");
  }
});

// ====================== DASHBOARD SUMMARY API ======================
app.get("/api/today-attendance-summary", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Count total students
    const totalStudents = await db.collection("students").countDocuments();

    // Count today's present students
    const todayPresent = await db.collection("attendanceLog").countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: "Present"
    });

    // Get recent attendance (last 5 records)
    const recentLogs = await db.collection("attendanceLog")
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({
      totalStudents: totalStudents || 0,
      presentToday: todayPresent || 0,
      absentToday: Math.max(0, totalStudents - todayPresent),
      attendanceRate: totalStudents > 0 
        ? Math.round((todayPresent / totalStudents) * 100) 
        : 0,
      recentActivity: recentLogs.map(log => ({
        studentName: log.studentName,
        status: log.status,
        time: log.createdAt || log.date
      }))
    });

  } catch (error) {
    console.error("Dashboard Summary Error:", error);
    res.status(500).json({ 
      message: "Failed to fetch summary", 
      error: error.message 
    });
  }
});

// Student Profile Page
app.get("/profile/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    const student = await db.collection("students").findOne({ _id: new ObjectId(studentId) });

    if (!student) {
      return res.status(404).send("Student not found");
    }

    const attendanceHistory = await db.collection("attendanceLog")
      .find({ studentId: studentId })
      .sort({ date: -1 })
      .toArray();

    const totalDays = await db.collection("attendanceLog").countDocuments({ studentId: studentId });
    const presentDays = await db.collection("attendanceLog").countDocuments({
      studentId: studentId,
      status: "Present"
    });

    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.render("profile", {
      student: student,
      attendanceHistory: attendanceHistory,
      attendancePercentage: attendancePercentage,
      presentDays: presentDays,
      totalDays: totalDays,
      session: req.session
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


// ====================== MARK ATTENDANCE (Store branch & semester) ======================
app.post("/api/mark-attendance", async (req, res) => {
  try {
    const { date, records } = req.body;
    // ... existing validation ...

    const attendanceDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const savedLogs = [];
    const skippedLogs = [];

    for (const record of records) {
      if (!record.studentId) continue;

      const existingLog = await db.collection("attendanceLog").findOne({
        studentId: record.studentId,
        date: { $gte: startOfDay, $lte: endOfDay }
      });

      if (existingLog) {
        skippedLogs.push(record.studentId);
        continue;
      }

      const student = await db.collection("students").findOne({
        _id: new ObjectId(record.studentId)
      });

      const logDoc = {
        studentId: record.studentId,
        studentName: student ? student.name : "Unknown Student",
        branch: student ? student.branch || "" : "",
        semester: student ? student.semester || "" : "",
        status: record.status || "Present",
        date: attendanceDate,
        createdAt: new Date()
      };

      await db.collection("attendanceLog").insertOne(logDoc);
      savedLogs.push(logDoc);
    }

    res.json({ message: "Attendance processed successfully", savedCount: savedLogs.length, skippedCount: skippedLogs.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save attendance" });
  }
});

// CREATE STUDENT

app.post("/create-student", upload.single("photo"), ourCleanup, async (req, res) => {
  try {
    if (req.file) {
      const photoFilename = `${Date.now()}.jpg`;
      await sharp(req.file.buffer)
        .jpeg({ quality: 80 })
        .toFile(path.join(uploadPath, photoFilename));
      req.cleanData.photo = photoFilename;
    }

    // === FIXED ROLL NUMBER GENERATION ===
    if (!req.cleanData.rollNumber) {
      // Find the highest existing roll number
      const lastStudent = await db.collection("students")
        .find({ rollNumber: { $regex: /^ROLL\d{3}$/ } })
        .sort({ rollNumber: -1 })
        .limit(1)
        .toArray();

      let nextNumber = 1;

      if (lastStudent.length > 0 && lastStudent[0].rollNumber) {
        const lastNum = parseInt(lastStudent[0].rollNumber.replace("ROLL", ""), 10);
        nextNumber = lastNum + 1;
      }

      req.cleanData.rollNumber = `ROLL${String(nextNumber).padStart(3, "0")}`;
    }

    if (!req.cleanData.email) {
      req.cleanData.email = `student${Date.now()}@example.com`;
    }

    const info = await db.collection("students").insertOne(req.cleanData);
    const newStudent = await db.collection("students").findOne({ _id: new ObjectId(info.insertedId) });

    res.send(newStudent);
  } catch (error) {
    console.error("Create Student Error:", error);
    if (error.code === 11000) {
      res.status(409).send("Roll number conflict. Please try again.");
    } else {
      res.status(500).send("Failed to create student");
    }
  }
});

app.delete("/student/:id", async (req, res) => {
  try {
    if (typeof req.params.id !== "string") req.params.id = "";

    const doc = await db.collection("students").findOne({ _id: new ObjectId(req.params.id) });

    if (doc && doc.photo) {
      await fse.remove(path.join(uploadPath, doc.photo));
    }

    await db.collection("students").deleteOne({ _id: new ObjectId(req.params.id) });
    res.send("Good job");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to delete student");
  }
});

// ====================== UPDATE STUDENT - FIXED ======================
app.post("/update-student", upload.single("photo"), ourCleanup, async (req, res) => {
  try {
    const studentId = new ObjectId(req.body._id);
    
    let updateData = { ...req.cleanData };
    let oldPhoto = null;

    // Fetch existing student to preserve important fields
    const existingStudent = await db.collection("students").findOne({ _id: studentId });
    if (!existingStudent) {
      return res.status(404).send("Student not found");
    }
    oldPhoto = existingStudent.photo;

    // === CRITICAL FIXES FOR DUPLICATE KEY ERRORS ===
    
    // 1. Protect rollNumber - Never allow empty rollNumber
    if (!updateData.rollNumber || updateData.rollNumber.trim() === "") {
      delete updateData.rollNumber;   // Keep existing rollNumber
    }

    // 2. Protect email - Never allow empty email
    if (!updateData.email || updateData.email.trim() === "") {
      delete updateData.email;
    }

    // Handle Photo Upload
    if (req.file) {
      const photoFilename = `${Date.now()}.jpg`;
      await sharp(req.file.buffer)
        .jpeg({ quality: 80 })
        .toFile(path.join(uploadPath, photoFilename));

      updateData.photo = photoFilename;

      if (oldPhoto) {
        await fse.remove(path.join(uploadPath, oldPhoto)).catch(() => {});
      }

      await db.collection("students").updateOne(
        { _id: studentId }, 
        { $set: updateData }
      );

      res.send(photoFilename);
    } else {
      // No photo uploaded
      delete updateData.photo;

      await db.collection("students").updateOne(
        { _id: studentId }, 
        { $set: updateData }
      );

      res.send("false");
    }
  } catch (error) {
    console.error("Update Student Error:", error);
    
    if (error.code === 11000) {
      res.status(409).send("Duplicate roll number or email detected. Please use unique values.");
    } else {
      res.status(500).send("Failed to update student");
    }
  }
});





// POST Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin") {
    req.session.isLoggedIn = true;
    req.session.role = "admin";
    req.session.username = username;
    return res.redirect("/admin");
  }

  if (username === "faculty" && password === "faculty") {
    req.session.isLoggedIn = true;
    req.session.role = "faculty";
    req.session.username = username;
    return res.redirect("/home");
  }

  res.render("login", { error: "Invalid username or password", session: null });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});

async function start() {
  try {
    const client = new MongoClient(process.env.CONNECTIONSTRING);
    await client.connect();
    db = client.db();

    console.log("✅ MongoDB Connected Successfully");

    // ====================== INDEXES ======================
    
    // Attendance Log Indexes
    await db.collection("attendanceLog").createIndex({ studentId: 1, date: -1 });
    await db.collection("attendanceLog").createIndex({ studentName: 1 });
    await db.collection("attendanceLog").createIndex({ branch: 1 });
    await db.collection("attendanceLog").createIndex({ semester: 1 });

    // Students Indexes
    await db.collection("students").createIndex({ name: 1 });
    await db.collection("students").createIndex({ branch: 1 });
    await db.collection("students").createIndex({ semester: 1 });
    
    // Critical Indexes
    await db.collection("students").createIndex({ rollNumber: 1 }, { unique: true });
    
    // Make email index NON-UNIQUE (to prevent update errors when email is empty)
    await db.collection("students").dropIndex("email_1").catch(() => {
      console.log("No email index to drop or already dropped");
    });
    await db.collection("students").createIndex({ email: 1 }); // Normal index, not unique



    // Start Server
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

start();
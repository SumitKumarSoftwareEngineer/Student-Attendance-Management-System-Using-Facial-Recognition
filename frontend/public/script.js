// var video = document.getElementById('videoCam');
// var button = document.getElementById('startButton');
// var viewLogButton = document.getElementById('viewLogButton');
// var confirmButton = document.getElementById('confirmButton');
// var closeLogButton = document.getElementById('closePopup');

// document.getElementById('confirmButton').style.visibility='hidden';

// //loads face recognition models
// Promise.all([
//     faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//     faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//     faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
// ]).then(start);

// //starts user's webcam
// function openCam(){
//     // only play if "START" is pressed
//     if (button.textContent == 'START'){
//         // change words on start button
//         button.textContent = 'STOP';
//         if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//             console.log('getUserMedia() not supported :(');
//             return;
//         } 
//         navigator.mediaDevices.getUserMedia({video: true}) 
//         .then(function(vidStream) {
//             if ("srcObject" in video) { 
//                 video.srcObject = vidStream;
//             } else { 
//                 video.src = window.URL.createObjectURL(vidStream); 
//             }
//             video.onloadedmetadata = function() { 
//                 video.play(); 
//                 document.getElementById('status').innerHTML='Identifying face...'; //change status
//                 paused = false; //make sure face recognition is unpaused, if the webcam was previously stopped
//             } 
//         }) 
//         .catch(function(err0r) { 
//             console.log(err0r.name + ': ' + err0r.message); 
//         }); 
//     }    else {
//         // stop video if "STOP" is pressed
//         button.textContent = 'START';
//         video.srcObject.getTracks().forEach(function(track){
//             if (track.readyState == 'live') {
//                     track.stop();
//             }
//         });
//         //creates custom event for video stopped for addEventListener in start()
//         var event = new Event('videoStopped');
//         video.dispatchEvent(event);
//         document.getElementById('status').innerHTML='Video stopped'; //change status
//         console.log('video stopped');
//     }
// }
// button.addEventListener("click", openCam);


// var studentRecognised;
// var paused = false;

// async function start() {
//     console.log('successfully loaded models :)');
//     const labeledFaceDescriptors = await loadStudentImages();
//     const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
//     video.addEventListener('play', async () => {loop});
//     var loop = setInterval(
//         async function faceRecognition(){
//             video.addEventListener('videoStopped', async () => {
//                 paused = true; // pauses the face recognition function until video starts again when "START" is pressed
//                 console.log('face recognition has stopped'); 
//             });

//             if (!paused) { //only run normally if not paused
//                 studentRecognised = null;
//                 //to detect face and retrieve face landmarks and descriptors
//                 const liveDetections = await faceapi.detectSingleFace(video).withFaceLandmarks().withFaceDescriptor(); 
//                 console.log(liveDetections);
//                 if (liveDetections != null) { //if one face is detected, try to recognise face
//                     const bestMatch = faceMatcher.findBestMatch(liveDetections.descriptor);
//                     var studentRecognised = bestMatch.toString();
//                     console.log(studentRecognised);
//                     var studentName = studentRecognised.split(' '+'(')[0]; //obtain name of student recognised
//                     if (studentName != 'unknown') { //if student name is registered and not unknown
//                         document.getElementById('confirmButton').style.visibility='visible';
//                         document.getElementById('status').innerHTML='Student found'; //change status
//                         displayStudentRecognised(studentName);
//                         paused = true; // pauses the face recognition function until "confirm attendance" is pressed
//                     }                    
//                 } else {
//                     console.log('no faces or multiple faces detected :( please try again.')
//                 }
//             }
//         }
//     , 4000);    //repeats face recognition function every 4 seconds until a face is detected
// }

// //if 'confirm attendance' is pressed, resume face recognition, and restore everything to that stage
// function confirmAttendance() {
//     paused = false;
//     document.getElementById('studentName').innerHTML='';
//     document.getElementById('dateTime').innerHTML='';
//     document.getElementById('confirmButton').style.visibility='hidden';
//     document.getElementById('studentImg').style.visibility='hidden';
//     if (button.textContent == 'STOP'){
//         document.getElementById('status').innerHTML='Identifying face...';
//     }
// }
// confirmButton.addEventListener("click", confirmAttendance);


// //process student images for face recognition
// async function loadStudentImages() {
//     const response = await fetch(`http://localhost:3000/api/students`);
//     const allStudents = await response.json();
//     const labels = allStudents.map(student => student.name);
//     return Promise.all(
//         labels.map(async label => {
//             const descriptions = [];
//             for (let i = 1; i <= 2; i++) {
//                 const response = await fetch(`http://localhost:3000/api/getStudentByName/${label}`);
//                 const student = await response.json();
//                 const img = await faceapi.fetchImage(`/uploaded-photos/${student.photo}`);
//                 const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//                 descriptions.push(detections.descriptor);
//             }
//             console.log('successfully loaded student image descriptors :)');
//             document.getElementById('status').innerHTML='Press START to begin';
//             return new faceapi.LabeledFaceDescriptors(label, descriptions);
//         })
//     );
// }

// var attendanceTable = document.getElementById("attendanceTable").getElementsByTagName('tbody')[0];
// //display name and photo of student recognised and date and time the attendance was taken
// async function displayStudentRecognised(studentName){
//     var today = new Date();
//     var dateTime = today.getFullYear()+'-'+today.getMonth()+'-'+today.getDate()+' '+today.getHours()+':'+today.getMinutes();
//     const response = await fetch(`http://localhost:3000/api/getStudentByName/${studentName}`);
//     const student = await response.json();
//     document.getElementById('dateTime').innerHTML=dateTime;
//     document.getElementById('studentName').innerHTML=studentName;
//     document.getElementById('studentImg').style.visibility='visible';
//     document.getElementById('studentImg').src=`/uploaded-photos/${student.photo}`;

//     //adds an entry of student's name and date and time of attendance to the list of new entries into the attendance table
//     var row = attendanceTable.insertRow(0);
//     var namecell = row.insertCell(0);
//     var timecell = row.insertCell(1);
//     namecell.innerHTML = studentName;
//     timecell.innerHTML = dateTime;
// }

// //to open and close the popup window when "View Attendance Log" is clicked
// const popupWindow = document.getElementById("popupWindowOverlay");
// function viewLog(){
//     popupWindow.style.display = 'flex';
// }

// function closeLog(){
//     popupWindow.style.display = 'none';
// }

// viewLogButton.addEventListener("click", viewLog);
// closeLogButton.addEventListener("click", closeLog);






// var video = document.getElementById('videoCam');
// var button = document.getElementById('startButton');
// var viewLogButton = document.getElementById('viewLogButton');
// var confirmButton = document.getElementById('confirmButton');
// var closeLogButton = document.getElementById('closePopup');

// document.getElementById('confirmButton').style.visibility = 'hidden';

// // Liveness Detection State
// let livenessState = {
//     blinkCount: 0,
//     lastBlinkTime: 0,
//     requiredBlinks: 2,
//     livenessPassed: false,
//     livenessTimer: null
// };

// // Eye Aspect Ratio (EAR) for blink detection
// function getEAR(eyePoints) {
//     const v1 = faceapi.euclideanDistance([eyePoints[1].x, eyePoints[1].y], [eyePoints[5].x, eyePoints[5].y]);
//     const v2 = faceapi.euclideanDistance([eyePoints[2].x, eyePoints[2].y], [eyePoints[4].x, eyePoints[4].y]);
//     const h = faceapi.euclideanDistance([eyePoints[0].x, eyePoints[0].y], [eyePoints[3].x, eyePoints[3].y]);
//     return (v1 + v2) / (2 * h);
// }

// function detectBlink(landmarks) {
//     if (!landmarks) return false;
    
//     const leftEye = landmarks.getLeftEye();
//     const rightEye = landmarks.getRightEye();
    
//     const leftEAR = getEAR(leftEye);
//     const rightEAR = getEAR(rightEye);
//     const avgEAR = (leftEAR + rightEAR) / 2;

//     const now = Date.now();
//     const blinkThreshold = 0.27; // Adjust if too sensitive/insensitive

//     if (avgEAR < blinkThreshold && now - livenessState.lastBlinkTime > 250) {
//         livenessState.blinkCount++;
//         livenessState.lastBlinkTime = now;
//         console.log(`Blink detected! (${livenessState.blinkCount}/${livenessState.requiredBlinks})`);
//         return true;
//     }
//     return false;
// }

// function resetLivenessState() {
//     livenessState.blinkCount = 0;
//     livenessState.livenessPassed = false;
//     if (livenessState.livenessTimer) clearTimeout(livenessState.livenessTimer);
//     livenessState.livenessTimer = null;
// }

// // loads face recognition models
// Promise.all([
//     faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//     faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//     faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
// ]).then(start);

// // starts user's webcam
// function openCam() {
//     if (button.textContent === 'START') {
//         button.textContent = 'STOP';
//         if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//             console.log('getUserMedia() not supported :(');
//             return;
//         }
//         navigator.mediaDevices.getUserMedia({ video: true })
//             .then(function (vidStream) {
//                 if ("srcObject" in video) {
//                     video.srcObject = vidStream;
//                 } else {
//                     video.src = window.URL.createObjectURL(vidStream);
//                 }
//                 video.onloadedmetadata = function () {
//                     video.play();
//                     document.getElementById('status').innerHTML = 'Identifying face...';
//                     paused = false;
//                     resetLivenessState();
//                 };
//             })
//             .catch(function (err0r) {
//                 console.log(err0r.name + ': ' + err0r.message);
//             });
//     } else {
//         button.textContent = 'START';
//         if (video.srcObject) {
//             video.srcObject.getTracks().forEach(track => track.stop());
//         }
//         var event = new Event('videoStopped');
//         video.dispatchEvent(event);
//         document.getElementById('status').innerHTML = 'Video stopped';
//         resetLivenessState();
//     }
// }
// button.addEventListener("click", openCam);

// var studentRecognised;
// var paused = false;

// async function start() {
//     console.log('Models loaded successfully :)');
//     const labeledFaceDescriptors = await loadStudentImages();
//     const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

//     // Fixed: Proper interval setup
//     setInterval(async () => {
//         if (paused) return;

//         // Handle video stopped event
//         video.addEventListener('videoStopped', () => {
//             paused = true;
//             console.log('Face recognition paused');
//         }, { once: true });

//         const detection = await faceapi
//             .detectSingleFace(video)
//             .withFaceLandmarks()
//             .withFaceDescriptor();

//         if (!detection) {
//             document.getElementById('status').innerHTML = 'No face detected. Please face the camera clearly.';
//             return;
//         }

//         // === LIVENESS DETECTION ===
//         if (!livenessState.livenessPassed) {
//             detectBlink(detection.landmarks);

//             if (livenessState.blinkCount >= livenessState.requiredBlinks) {
//                 livenessState.livenessPassed = true;
//                 if (livenessState.livenessTimer) clearTimeout(livenessState.livenessTimer);
//                 document.getElementById('status').innerHTML = '✅ Liveness Verified!';
//             } else if (livenessState.blinkCount === 0) {
//                 document.getElementById('status').innerHTML = '👁️ <strong>Blink twice</strong> to prove you are live';
//             } else {
//                 document.getElementById('status').innerHTML = `👁️ Blink again! (${livenessState.blinkCount}/${livenessState.requiredBlinks})`;
//             }

//             // Auto reset after 12 seconds
//             if (!livenessState.livenessTimer) {
//                 livenessState.livenessTimer = setTimeout(() => {
//                     if (!livenessState.livenessPassed) {
//                         resetLivenessState();
//                         document.getElementById('status').innerHTML = '⏰ Liveness timeout. Try blinking again.';
//                     }
//                 }, 12000);
//             }
//             return; // Don't do recognition until liveness passed
//         }

//         // === FACE RECOGNITION (Only after liveness) ===
//         const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
//         const matchString = bestMatch.toString();
//         const studentName = matchString.split(' (')[0];

//         if (studentName !== 'unknown') {
//             document.getElementById('confirmButton').style.visibility = 'visible';
//             document.getElementById('status').innerHTML = '✅ Student Verified!';
//             displayStudentRecognised(studentName);
//             paused = true;
//             resetLivenessState();
//         } else {
//             document.getElementById('status').innerHTML = 'Unknown face. Please try again.';
//         }
//     }, 1200); // Faster interval for smooth liveness detection
// }

// // Confirm Attendance
// function confirmAttendance() {
//     paused = false;
//     document.getElementById('studentName').innerHTML = '';
//     document.getElementById('dateTime').innerHTML = '';
//     document.getElementById('confirmButton').style.visibility = 'hidden';
//     document.getElementById('studentImg').style.visibility = 'hidden';
//     if (button.textContent === 'STOP') {
//         document.getElementById('status').innerHTML = 'Identifying face...';
//     }
//     resetLivenessState();
// }
// confirmButton.addEventListener("click", confirmAttendance);

// // Load Student Images
// async function loadStudentImages() {
//     const response = await fetch(`http://localhost:3000/api/students`);
//     const allStudents = await response.json();
//     const labels = allStudents.map(student => student.name);

//     return Promise.all(
//         labels.map(async label => {
//             const descriptions = [];
//             for (let i = 1; i <= 2; i++) {
//                 const res = await fetch(`http://localhost:3000/api/getStudentByName/${label}`);
//                 const student = await res.json();
//                 const img = await faceapi.fetchImage(`/uploaded-photos/${student.photo}`);
//                 const det = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//                 if (det) descriptions.push(det.descriptor);
//             }
//             console.log(`Loaded descriptors for ${label}`);
//             document.getElementById('status').innerHTML = 'Press START to begin';
//             return new faceapi.LabeledFaceDescriptors(label, descriptions);
//         })
//     );
// }

// // Display Recognised Student
// var attendanceTable = document.getElementById("attendanceTable").getElementsByTagName('tbody')[0];

// async function displayStudentRecognised(studentName) {
//     const today = new Date();
//     const dateTime = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2,'0')}-${today.getDate().toString().padStart(2,'0')} ${today.getHours()}:${today.getMinutes()}`;

//     const response = await fetch(`http://localhost:3000/api/getStudentByName/${studentName}`);
//     const student = await response.json();

//     document.getElementById('dateTime').innerHTML = dateTime;
//     document.getElementById('studentName').innerHTML = studentName;
//     document.getElementById('studentImg').style.visibility = 'visible';
//     document.getElementById('studentImg').src = `/uploaded-photos/${student.photo}`;

//     // Add to table
//     var row = attendanceTable.insertRow(0);
//     row.insertCell(0).innerHTML = studentName;
//     row.insertCell(1).innerHTML = dateTime;
// }

// // Popup handlers
// const popupWindow = document.getElementById("popupWindowOverlay");
// function viewLog() { popupWindow.style.display = 'flex'; }
// function closeLog() { popupWindow.style.display = 'none'; }

// viewLogButton.addEventListener("click", viewLog);
// closeLogButton.addEventListener("click", closeLog);







var video = document.getElementById("videoCam");
var button = document.getElementById("startButton");
var viewLogButton = document.getElementById("viewLogButton");
var confirmButton = document.getElementById("confirmButton");
var closeLogButton = document.getElementById("closePopup");

document.getElementById("confirmButton").style.visibility = "hidden";

let recognisedStudent = null;
let recognitionInterval = null;

// Liveness Detection State
let livenessState = {
  blinkCount: 0,
  lastBlinkTime: 0,
  requiredBlinks: 2,
  livenessPassed: false,
  livenessTimer: null
};

function getEAR(eyePoints) {
  const v1 = faceapi.euclideanDistance([eyePoints[1].x, eyePoints[1].y], [eyePoints[5].x, eyePoints[5].y]);
  const v2 = faceapi.euclideanDistance([eyePoints[2].x, eyePoints[2].y], [eyePoints[4].x, eyePoints[4].y]);
  const h = faceapi.euclideanDistance([eyePoints[0].x, eyePoints[0].y], [eyePoints[3].x, eyePoints[3].y]);
  return (v1 + v2) / (2 * h);
}

function detectBlink(landmarks) {
  if (!landmarks) return false;

  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  const leftEAR = getEAR(leftEye);
  const rightEAR = getEAR(rightEye);
  const avgEAR = (leftEAR + rightEAR) / 2;

  const now = Date.now();
  const blinkThreshold = 0.27;

  if (avgEAR < blinkThreshold && now - livenessState.lastBlinkTime > 250) {
    livenessState.blinkCount++;
    livenessState.lastBlinkTime = now;
    console.log(`Blink detected! (${livenessState.blinkCount}/${livenessState.requiredBlinks})`);
    return true;
  }

  return false;
}

function resetLivenessState() {
  livenessState.blinkCount = 0;
  livenessState.livenessPassed = false;

  if (livenessState.livenessTimer) {
    clearTimeout(livenessState.livenessTimer);
  }

  livenessState.livenessTimer = null;
}

Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models")
]).then(startFaceRecognitionSystem);

function openCam() {
  if (button.textContent === "START") {
    button.textContent = "STOP";

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log("getUserMedia() not supported :(");
      return;
    }

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (vidStream) {
        if ("srcObject" in video) {
          video.srcObject = vidStream;
        } else {
          video.src = window.URL.createObjectURL(vidStream);
        }

        video.onloadedmetadata = function () {
          video.play();
          document.getElementById("status").innerHTML = "Identifying face...";
          paused = false;
          resetLivenessState();
        };
      })
      .catch(function (error) {
        console.log(error.name + ": " + error.message);
      });
  } else {
    button.textContent = "START";

    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
    }

    paused = true;
    recognisedStudent = null;
    resetLivenessState();
    document.getElementById("status").innerHTML = "Video stopped";
  }
}

button.addEventListener("click", openCam);

var paused = false;
var attendanceTable = document.getElementById("attendanceTable").getElementsByTagName("tbody")[0];

async function startFaceRecognitionSystem() {
  console.log("Models loaded successfully :)");

  const labeledFaceDescriptors = await loadStudentImages();
  const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

  document.getElementById("status").innerHTML = "Press START to begin";

  if (recognitionInterval) clearInterval(recognitionInterval);

  recognitionInterval = setInterval(async () => {
    if (paused || !video.srcObject) return;

    const detection = await faceapi
      .detectSingleFace(video)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      document.getElementById("status").innerHTML = "No face detected. Please face the camera clearly.";
      return;
    }

    if (!livenessState.livenessPassed) {
      detectBlink(detection.landmarks);

      if (livenessState.blinkCount >= livenessState.requiredBlinks) {
        livenessState.livenessPassed = true;

        if (livenessState.livenessTimer) {
          clearTimeout(livenessState.livenessTimer);
        }

        document.getElementById("status").innerHTML = "✅ Liveness Verified!";
      } else if (livenessState.blinkCount === 0) {
        document.getElementById("status").innerHTML = "👁️ Blink twice to prove you are live";
      } else {
        document.getElementById("status").innerHTML = `👁️ Blink again! (${livenessState.blinkCount}/${livenessState.requiredBlinks})`;
      }

      if (!livenessState.livenessTimer) {
        livenessState.livenessTimer = setTimeout(() => {
          if (!livenessState.livenessPassed) {
            resetLivenessState();
            document.getElementById("status").innerHTML = "⏰ Liveness timeout. Try blinking again.";
          }
        }, 12000);
      }

      return;
    }

    const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
    const matchString = bestMatch.toString();
    const studentName = matchString.split(" (")[0];

    if (studentName !== "unknown") {
      document.getElementById("confirmButton").style.visibility = "visible";
      document.getElementById("status").innerHTML = "✅ Student Verified!";
      await displayStudentRecognised(studentName);
      paused = true;
      resetLivenessState();
    } else {
      document.getElementById("status").innerHTML = "Unknown face. Please try again.";
    }
  }, 1200);
}

async function confirmAttendance() {
  try {
    if (!recognisedStudent) {
      alert("No student recognized.");
      return;
    }

    const payload = {
      date: new Date().toISOString(),
      records: [
        {
          studentId: recognisedStudent._id,
          status: "Present"
        }
      ]
    };

    const response = await fetch("/api/mark-attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save attendance");
    }

    if (data.savedCount > 0) {
      alert("Attendance saved successfully.");
    } else {
      alert("Attendance already marked for today.");
    }

    await loadAttendanceLog();

    recognisedStudent = null;
    paused = false;
    document.getElementById("studentName").innerHTML = "";
    document.getElementById("dateTime").innerHTML = "";
    document.getElementById("confirmButton").style.visibility = "hidden";
    document.getElementById("studentImg").style.visibility = "hidden";
    document.getElementById("studentImg").src = "";

    if (button.textContent === "STOP") {
      document.getElementById("status").innerHTML = "Identifying face...";
    }

    resetLivenessState();
  } catch (error) {
    console.error(error);
    alert("Attendance save nahi hui.");
  }
}

confirmButton.addEventListener("click", confirmAttendance);

async function loadStudentImages() {
  const response = await fetch("/api/students");
  const allStudents = await response.json();

  return Promise.all(
    allStudents.map(async (student) => {
      const descriptions = [];

      if (!student.photo) {
        return new faceapi.LabeledFaceDescriptors(student.name, descriptions);
      }

      try {
        const img = await faceapi.fetchImage(`/uploaded-photos/${student.photo}`);
        const det = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (det) {
          descriptions.push(det.descriptor);
        }

        console.log(`Loaded descriptors for ${student.name}`);
      } catch (err) {
        console.error(`Could not load photo for ${student.name}`, err);
      }

      return new faceapi.LabeledFaceDescriptors(student.name, descriptions);
    })
  );
}

async function displayStudentRecognised(studentName) {
  const today = new Date();
  const dateTime = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")} ${today.getHours().toString().padStart(2, "0")}:${today.getMinutes().toString().padStart(2, "0")}`;

  const response = await fetch(`/api/getStudentByName/${encodeURIComponent(studentName)}`);
  const student = await response.json();

  recognisedStudent = student;

  document.getElementById("dateTime").innerHTML = dateTime;
  document.getElementById("studentName").innerHTML = studentName;
  document.getElementById("studentImg").style.visibility = "visible";
  document.getElementById("studentImg").src = `/uploaded-photos/${student.photo}`;
}

async function loadAttendanceLog() {
  try {
    const response = await fetch("/api/attendance-log");
    const logs = await response.json();

    attendanceTable.innerHTML = "";

    logs.forEach((log) => {
      const row = attendanceTable.insertRow();
      row.insertCell(0).innerHTML = log.studentName || "Unknown";
      row.insertCell(1).innerHTML = new Date(log.date).toLocaleString();
    });
  } catch (error) {
    console.error("Failed to load attendance log", error);
  }
}

const popupWindow = document.getElementById("popupWindowOverlay");

async function viewLog() {
  await loadAttendanceLog();
  popupWindow.style.display = "flex";
}

function closeLog() {
  popupWindow.style.display = "none";
}

viewLogButton.addEventListener("click", viewLog);
closeLogButton.addEventListener("click", closeLog);
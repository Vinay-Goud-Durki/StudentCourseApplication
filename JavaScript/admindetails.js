const admin = JSON.parse(localStorage.getItem("adminData"));
const adminDetailsDiv = document.getElementById("adminDetails");
const imageContainer = document.getElementById("imageContainer");
const popupModal = document.getElementById("popupModal");
const popupImage = document.getElementById("popupImage");
const popupModal1 = document.getElementById("popupModal1");
const popupImage1 = document.getElementById("popupImage1");

console.log(admin);
const adminName = document.getElementById("adminName");
const imageElementProfile = document.getElementById("profileIcon");
let imgUrl = null;

if (admin) {
  adminName.innerText = `${admin.fname} ${admin.lname}`;

  adminDetailsDiv.innerHTML = `
    <h2>${admin.fname} ${admin.lname}</h2>
    <p><strong>Admin ID:</strong> ${admin.admId}</p>
    <p><strong>Email:</strong> ${admin.email}</p>
    <p><strong>Address:</strong> ${admin.address}</p>
    <p><strong>Mobile:</strong> ${admin.mobileNumber}</p>
    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
  `;

  fetch(`http://localhost:8080/fetchAdminImage/${admin.admId}`)
    .then((res) => {
      console.log(res);
      console.log(res.status);
      if (res.ok) return res.blob();
      throw new Error("No image found");
    })
    .then((blob) => {
      console.log(blob);
      const url = URL.createObjectURL(blob);
      imgUrl = url;
      imageContainer.innerHTML = `<img src="${url}" onclick="openModal('${url}')" alt="Admin Image" />`;
      imageElementProfile.src = url;
    })
    .catch(() => {
      imageContainer.innerHTML = `<img src="./images/149071.png" onclick="openModal('./images/149071.png')" alt="Admin Image" />`;
    });
} else {
  adminDetailsDiv.innerHTML = "<p>No admin data. Please login again.</p>";
}

function fetchImage() {
  openModal(imgUrl);
}

// Open/Close Image Modal
function openModal(src) {
  popupImage.src = src;
  popupModal.classList.remove("hidden");
}

function closeModal() {
  popupModal.classList.add("hidden");
  popupImage.src = "";
}

function openModal1(src) {
  popupImage1.src = src;
  popupModal1.classList.remove("hidden");
}

function closeModal1() {
  popupModal1.classList.add("hidden");
  popupImage1.src = "";
}

// Upload Image
function uploadAdminImage(event) {
  const file = event.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  fetch(`http://localhost:8080/uploadAdminImage/${admin.admId}`, {
    method: "PUT",
    body: formData,
  })
    .then((res) => res.json())
    .then(() => {
      showMessageModal("Image uploaded successfully!", () => location.reload());
    })
    .catch(() => showMessageModal("Image upload failed."));
}

function deleteAdminImage() {
  showConfirmationModal("Are you sure you want to delete the image?", () => {
    fetch(`http://localhost:8080/deleteAdminImage/${admin.admId}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to delete image");
        }
        return res.json();
      })
      .then(() => {
        showMessageModal("Image deleted!", () => location.reload());
      })
      .catch((err) => {
        showMessageModal("Error: " + err.message);
      });
  });
}

localStorage.setItem("adminDetails", JSON.stringify(admin));

// Update Admin Info
function updateAdmin() {
  // localStorage.setItem("adminDetails",JSON.stringify(admin));
  // localStorage.setItem("studentData", JSON.stringify(data));
  showMessageModal("Redirecting to update admin page...", () => {
    // location.href = "updateadmin.html";

    location.href = "updateDetailsAdmin.html";
  });
}

// Delete Admin Account
function deleteAccount() {
  showConfirmationModal("Are you sure you want to delete your account?", () => {
    fetch(`http://localhost:8080/deleteAdmin/${admin.admId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        localStorage.removeItem("adminData");
        showMessageModal("Account deleted.", () => {
          window.location.href = "adminsigin.html";
        });
      });
  });
}

// Fetch all students
function getAllStudents() {
  fetch("http://localhost:8080/getAllStudentDetails")
    .then((res) => res.json())
    .then((response) => {
      if (response.statuscode === 200) {
        displayStudents(response.data);
      } else {
        showMessageModal("Failed to load students: " + response.msg);
        
      }
    })
    .catch((error) => console.error("Error updating course:", error));
    // .catch(() => showMessageModal("Server Error"));
}

const studentName = document.getElementById("displaynameofstudents");
const coursename = document.getElementById("displaycoursesname");

function displayStudents(students) {
  studentName.innerText = "All student details....";
  const container = document.getElementById("studentsContainer");
  container.classList.add("studentsContainer1");
  container.innerHTML = "";

  students.forEach((student) => {
    const studentDiv = document.createElement("div");
    studentDiv.className = "student-card";

    const fullName = `${student.fname} ${student.lname}`;
    const imgSrc = student.img
      ? `data:image/png;base64,${student.img}`
      : "./images/149071.png";

    studentDiv.innerHTML = `
      <div class="student-header">
        <img src="${imgSrc}" alt="${fullName}" class="student-image" onclick="openModal1('${imgSrc}')" />
        <h3>${fullName}</h3>
      </div>
      <p><strong>Email:</strong> ${student.email}</p>
      <p><strong>Mobile:</strong> ${student.mobileNumber}</p>
      <p><strong>Address:</strong> ${student.address}</p>
      <p><strong>Password:</strong> ${student.password}</p>
      <div class="course-section">
        <h4>Courses Enrolled:</h4>
        ${
          student.course.length > 0
            ? `<ul>${student.course
                .map(
                  (c) =>
                    `<li><strong>${c.name}</strong> (₹${c.cost}) - ${c.duration}</li>`
                )
                .join("")}</ul>`
            : "<p>No courses enrolled.</p>"
        }
      </div>
    `;

    container.appendChild(studentDiv);
  });
}

function deleteCourse(courseId) {
  showConfirmationModal("Are you sure you want to delete this course?", () => {
    fetch(`http://localhost:8080/deleteCourseById/${courseId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((response) => {
        // showMessageModal(response.msg, () => location.reload());
       showMessageModal(response.msg ,()=>{findAllCourses()} );
      })
      .catch(() => showMessageModal("Failed to delete course."));
  });
}

function findAllCourses() {
  coursename.innerText = "All Courses";
  const courseContainer = document.getElementById("courseContainer");
  courseContainer.classList.add("courseContainer1");
  courseContainer.innerHTML = "";

  fetch("http://localhost:8080/findAllCoursesByAdmin")
    .then((res) => res.json())
    .then((data) => {
      if (data.statuscode === 200) {
        const courses = data.data;

        if (courses.length === 0) {
          courseContainer.innerHTML = "<p>No courses found.</p>";
        } else {
          courses.forEach((course) => {
            console.log(course.cid)
            const courseCard = document.createElement("div");
            courseCard.className = "course-card";

            courseCard.innerHTML = `
              <h3>${course.name}</h3>
              <p><strong>Course ID:</strong> ${course.cid}</p>
              <p><strong>Cost:</strong> ₹${course.cost}</p>
              <p><strong>Duration:</strong> ${course.duration}</p>
              <div class="action-buttons">
                <button onclick="updateCourse(${course.cid})">Update</button>
                <button onclick="deleteCourse(${course.cid})" class="delete">Delete${course.cid}</button>
              </div>
            `;
            
            courseContainer.appendChild(courseCard);
          });
        }
      } else {
        courseContainer.innerHTML = "<p>Failed to fetch courses.</p>";
      }
    })
    .catch(() => {
      courseContainer.innerHTML = "<p>Error loading courses.</p>";
    });
}

// Modal Helpers
function showConfirmationModal(message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  confirmMessage.textContent = message;
  modal.classList.remove("hidden");

  const newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

  newConfirmBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    onConfirm();
  });

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };
}

function showMessageModal(message, callback = null) {
  const modal = document.getElementById("messageModal");
  const messageText = document.getElementById("messageText");
  const closeBtn = document.getElementById("messageCloseBtn");

  messageText.textContent = message;
  modal.classList.remove("hidden");

  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

  newCloseBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (callback) callback();
  });
}

const profileIcon = document.getElementById("profileIcon");
const dropdownMenu = document.getElementById("dropdownMenu");

profileIcon.addEventListener("click", () => {
  dropdownMenu.style.display =
    dropdownMenu.style.display === "block" ? "none" : "block";
});

// Hide dropdown if clicked outside
window.addEventListener("click", (event) => {
  if (
    !profileIcon.contains(event.target) &&
    !dropdownMenu.contains(event.target)
  ) {
    dropdownMenu.style.display = "none";
  }
});

function logout() {
  showConfirmationModal("❗ Are you sure you want to logout?", () => {
    // Confirmed: perform logout
    localStorage.removeItem("studentData");
    showMessageModal("👋 Logged out successfully", () => {
      window.location.href = "adminsigin.html";
    });
  });
}

// Modal handling
const updateCourseModal = document.getElementById("updateCourseModal");
const updateCourseForm = document.getElementById("updateCourseForm");
const updateCid = document.getElementById("updateCid");
const updateName = document.getElementById("updateName");
const updateCost = document.getElementById("updateCost");
const updateDuration = document.getElementById("updateDuration");

function closeUpdateModal() {
  updateCourseModal.classList.add("hidden");
}

function openUpdateModal(courseId) {
  fetch(`http://localhost:8080/findCourseById/${courseId}`)
    .then((response) => response.json())
    .then((data) => {
      const course = data.data[0];
      updateCid.value = course.cid;
      updateName.value = course.name;
      updateCost.value = course.cost;
      updateDuration.value = course.duration;
      updateCourseModal.classList.remove("hidden");
    })
    .catch((error) => console.error("Error fetching course:", error));
}

updateCourseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const course = {
    cid: updateCid.value,
    name: updateName.value,
    cost: updateCost.value,
    duration: updateDuration.value,
  };

  fetch("http://localhost:8080/updateCourse", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(course),
  })
    .then((response) => response.json())
    .then((data) => {
      showMessageModal(data.msg);
      closeUpdateModal();
      findAllCourses(); // Refresh the course list
    })
    .catch((error) => console.error("Error updating course:", error));
});

// Example updateCourse function to attach to Update button
function updateCourse(courseId) {
  openUpdateModal(courseId);
}

// DOM references for Add Course Modal
const addCourseModal = document.getElementById("addCourseModal");
const addCourseForm = document.getElementById("addCourseForm");
const newName = document.getElementById("newName");
const newCost = document.getElementById("newCost");
const newDuration = document.getElementById("newDuration");

// Open the add course modal
function addACourse() {
  addCourseModal.classList.remove("hidden");
  // Clear form fields
  addCourseForm.reset();
}

// Close the add course modal
function closeAddCourseModal() {
  addCourseModal.classList.add("hidden");
}

// Handle course form submission
addCourseForm.addEventListener("submit", function (event) {
  event.preventDefault();

  // Build the course object
  const newCourse = {
    name: newName.value,
    cost: parseFloat(newCost.value),
    duration: newDuration.value
  };

  // Send POST request (as an array with one course, matching backend API)
  fetch("http://localhost:8080/saveCourse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify([newCourse])
  })
    .then(res => res.json())
    .then(response => {
      if (response.statuscode === 201) {
        showMessageModal(response.msg);
        closeAddCourseModal();
        findAllCourses(); 
      } else {
        showMessageModal("Failed to add course: " + response.msg);
      }
    })
    .catch(() => showMessageModal("Server error while adding course."));
});


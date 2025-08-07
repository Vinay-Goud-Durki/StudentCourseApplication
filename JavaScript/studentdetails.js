// Load student data from localStorage
const studentData = JSON.parse(localStorage.getItem("studentData"))?.data;
console.log(localStorage.getItem("studentData"));
if (studentData) {
  document.getElementById("studentName").innerText = studentData.fname+" "+studentData.lname;
  document.getElementById("studentId").innerText = studentData.sid;
  document.getElementById("studentEmail").innerText = studentData.email;
  document.getElementById("studentMobile").innerText = studentData.mobileNumber;
  document.getElementById("studentAddress").innerText = studentData.address;

  // Set image (if available)
  const imageElement = document.getElementById("studentImage");
  const imageElementProfile=document.getElementById("profileIcon");
  if (studentData.img) {
    imageElement.src = `data:image/jpeg;base64,${studentData.img}`;
    imageElementProfile.src=`data:image/jpeg;base64,${studentData.img}`;
  } else {
    // imageElement.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    // imageElementProfile.src="https://cdn-icons-png.flaticon.com/512/149/149071.png";
    imageElement.src="./images/149071.png";
    imageElementProfile.src="./images/149071.png";
  }

  // Populate courses
  const courseList = document.getElementById("courseList");
  // courseList.innerHTML = "";
  console.log(studentData.course.length)
  if(studentData.course.length===0){
    courseList.innerHTML="<strong><p style='color: red;'>Your not not subscribed to any course. To subscribe click the subscribe button</p></strong>";
  }else{
  studentData.course.forEach(course => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${course.name}</strong> - ₹${course.cost} (Ends: ${course.duration})
    `;
    courseList.appendChild(li);
  });
}
} else {
  alert("No student data found. Please log in again.");
  window.location.href = "signin.html";
}

// Action button methods (stub examples)
async function updateStudent() {
  window.location.href = "updatedetailsstudent.html";
}

async function updateImage() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.click();

  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:8080/uploadImage/${studentData.sid}`, {
        method: "PUT",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to update image.");
      }

      const data = await response.json();
      localStorage.setItem("studentData", JSON.stringify(data));

      showMessageModal("✅ Image updated successfully!", () => {
        location.reload();
      });

    } catch (error) {
      showMessageModal("❌ Error updating image: " + error.message);
    }
  };
}


function deleteAccount() {
  showConfirmationModal("❗ Are you sure you want to delete your account? This action is irreversible.", async () => {
    const student = JSON.parse(localStorage.getItem("studentData"))?.data;

    if (!student || !student.sid) {
      showMessageModal("❌ Student ID not found. Please log in again.", () => {
        window.location.href = "signin.html";
      });
      return;
    }

    try {
       const response = await fetch(`http://localhost:8080/deletestudentById/${student.sid}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        if (response.status === 503) {
          localStorage.removeItem("studentData");
          showMessageModal("⚠️ Account deleted, but confirmation email failed to send.", () => {
            window.location.href = "signin.html";
          });
        } else {
          throw new Error("Failed to delete account.");
        }
        return;
      }

      // Success case
      localStorage.removeItem("studentData");
      showMessageModal("🗑️ Account deleted successfully.", () => {
        window.location.href = "signin.html";
      });

    } catch (error) {
      showMessageModal("❌ Error deleting account: " + error.message);
    }
  });
}

function viewAllCourses() {
  window.location.href = "viewallcourses.html";
}

const profileIcon = document.getElementById("profileIcon");
const dropdownMenu = document.getElementById("dropdownMenu");

profileIcon.addEventListener("click", () => {
  dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
});

// Hide dropdown if clicked outside
window.addEventListener("click", (event) => {
  if (!profileIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
    dropdownMenu.style.display = "none";
  }
});

function logout() {
  showConfirmationModal(
    "❗ Are you sure you want to logout?",
    () => {
      // Confirmed: perform logout
      localStorage.removeItem("studentData");
      showMessageModal("👋 Logged out successfully", () => {
        window.location.href = "signin.html";
      });
    }
  );
}


function fetchImage() {
  const modal = document.getElementById("imageModal");
  const popupImage = document.getElementById("popupImage");

  // Set image source
  popupImage.src = document.getElementById("studentImage").src;

  // Show modal
  modal.style.display = "block";
}

document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("imageModal").style.display = "none";
});

function triggerUpload() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.click();

  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`http://localhost:8080/uploadImage/${studentData.sid}`, {
        method: "PUT",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload image.");
      }

      const data = await response.json();
      localStorage.setItem("studentData", JSON.stringify(data));
      
      showMessageModal("✅ Image uploaded successfully.", () => {
        location.reload();
      });

    } catch (error) {
      showMessageModal("❌ Error uploading image: " + error.message);
    }
  };
}

async function deleteImage() {
  showConfirmationModal("🧹 Are you sure you want to delete your profile image?", async () => {
    try {
      const response = await fetch(`http://localhost:8080/deleteStudentImage/${studentData.sid}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to delete image.");
      }

      const data = await response.json();

      if (!data || !data.data) {
        throw new Error("No student data returned after image deletion.");
      }

      // Success: Update localStorage and show modal
      localStorage.setItem("studentData", JSON.stringify(data));
      showMessageModal("🧹 Image deleted successfully.", () => {
        location.reload();
      });

    } catch (error) {
      showMessageModal("❌ Error deleting image: " + error.message);
    }
  });
}


function showConfirmationModal(message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const confirmMessage = document.getElementById("confirmMessage");
  const confirmBtn = document.getElementById("confirmBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  confirmMessage.textContent = message;
  modal.classList.remove("hidden");

  // Remove old event listeners by cloning the confirm button
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

  // Replace old click listener
  const newCloseBtn = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);

  newCloseBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (callback) callback(); // e.g., redirect or reload after closing
  });
}



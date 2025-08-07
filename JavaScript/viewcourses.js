// viewcourses.js (with custom confirmation modal)

const studentData = JSON.parse(localStorage.getItem("studentData"))?.data;
if (!studentData) {
  window.location.href = "signin.html";
}

document.getElementById("studentName").innerText = `${studentData.fname} ${studentData.lname}`;
document.getElementById("studentId").innerText = studentData.sid;
document.getElementById("studentEmail").innerText = studentData.email;
document.getElementById("studentMobile").innerText = studentData.mobileNumber;
document.getElementById("studentAddress").innerText = studentData.address;

let allCourses = [];
let subscribedCourseIds = studentData.course.map(c => c.cid);

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

function showLoader(message = "Please wait...") {
  const loader = document.createElement("div");
  loader.id = "loaderOverlay";
  loader.innerHTML = `<div class='loader-box'><div class='spinner'></div><p>${message}</p></div>`;
  document.body.appendChild(loader);
}

function hideLoader() {
  const loader = document.getElementById("loaderOverlay");
  if (loader) loader.remove();
}

function showConfirmModal(message, onConfirm) {
  const modal = document.createElement("div");
  modal.id = "confirmModal";
  modal.innerHTML = `
    <div class="confirm-box">
      <p>${message}</p>
      <div class="modal-buttons">
        <button id="confirmYes">Yes</button>
        <button id="confirmNo">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("confirmYes").onclick = () => {
    modal.remove();
    onConfirm();
  };
  document.getElementById("confirmNo").onclick = () => modal.remove();
}

function renderCourses() {
  const subscribedDiv = document.getElementById("subscribedCourses");
  const allDiv = document.getElementById("allCourses");
  const searchQuery = document.getElementById("searchBox").value.toLowerCase();

  subscribedDiv.innerHTML = "";
  allDiv.innerHTML = "";

  const subscribedCourses = allCourses.filter(c => subscribedCourseIds.includes(c.cid));
  if (subscribedCourses.length === 0) {
    subscribedDiv.innerHTML = `<p style='color: red;'>Not subscribed to any course.</p>`;
  } else {
    subscribedCourses.forEach(course => {
      subscribedDiv.innerHTML += `
        <div class="course-item">
          <label><input type="checkbox" value="${course.cid}" class="subscribed-checkbox" /> ${course.name}</label>
          <span>₹${course.cost} | Ends: ${course.duration}</span>
        </div>`;
    });
  }

  const filteredCourses = allCourses.filter(course => course.name.toLowerCase().includes(searchQuery));
  filteredCourses.forEach(course => {
    const isSubscribed = subscribedCourseIds.includes(course.cid);
    allDiv.innerHTML += `
      <div class="course-item">
        <label><input type="checkbox" value="${course.cid}" class="all-checkbox" ${isSubscribed ? "disabled" : ""}/> ${course.name}</label>
        <span>${isSubscribed ? "✅ Subscribed" : `₹${course.cost} | Ends: ${course.duration}`}</span>
      </div>`;
  });
}

async function fetchCourses() {
  showLoader("Loading courses...");
  try {
    const response = await fetch("http://localhost:8080/findAllCoursesByStudent");
    const result = await response.json();
    allCourses = result.data || [];
    renderCourses();
  } catch (error) {
    showToast("❌ Failed to fetch courses.");
  } finally {
    hideLoader();
  }
}

document.getElementById("searchBox").addEventListener("input", renderCourses);

document.getElementById("addSelectedBtn").addEventListener("click", () => {
  const checkboxes = document.querySelectorAll(".all-checkbox:checked");
  const courseIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
  if (courseIds.length === 0) return showToast("⚠️ No course selected.");

  showConfirmModal("Are you sure you want to add selected course(s)?", async () => {
    showLoader("Adding course(s)...");
    try {
      const res = await fetch(`http://localhost:8080/addCourseToStudent/${studentData.sid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseIds)
      });
      const updated = await res.json();
      localStorage.setItem("studentData", JSON.stringify(updated));
      subscribedCourseIds = updated.data.course.map(c => c.cid);
      showToast("✅ Course(s) added successfully.");
      renderCourses();
    } catch (error) {
      showToast("❌ Failed to add course(s).");
    } finally {
      hideLoader();
    }
  });
});

document.getElementById("removeSelectedBtn").addEventListener("click", () => {
  const checkboxes = document.querySelectorAll(".subscribed-checkbox:checked");
  const courseIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
  if (courseIds.length === 0) return showToast("⚠️ No course selected to remove.");

  showConfirmModal("Are you sure you want to remove selected course(s)?", async () => {
    showLoader("Removing course(s)...");
    try {
      const res = await fetch(`http://localhost:8080/removeCourseFromStudent/${studentData.sid}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseIds)
      });
      const updated = await res.json();
      localStorage.setItem("studentData", JSON.stringify(updated));
      subscribedCourseIds = updated.data.course.map(c => c.cid);
      showToast("🗑️ Course(s) removed successfully.");
      renderCourses();
    } catch (error) {
      showToast("❌ Failed to remove course(s).");
    } finally {
      hideLoader();
    }
  });
});

fetchCourses();

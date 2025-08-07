// updatedetailsstudent.js (Refactored with popups instead of alerts and verified logic)

const student = JSON.parse(localStorage.getItem("studentData"))?.data;

if (!student) {
  showMessageModal("❌ No student data found. Redirecting...", () => {
    window.location.href = "signin.html";
  });
}

// Populate form
const sid = document.getElementById("sid");
sid.value = student.sid;
document.getElementById("fname").value = student.fname;
document.getElementById("lname").value = student.lname;
document.getElementById("email").value = student.email;
document.getElementById("password").value = student.password;
document.getElementById("address").value = student.address;
document.getElementById("mobileNumber").value = student.mobileNumber;

if (student.img) {
  document.getElementById("imagePreview").src = `data:image/jpeg;base64,${student.img}`;
}

let selectedFile = null;

document.getElementById("imageInput").addEventListener("change", function () {
  const file = this.files[0];
  selectedFile = null;

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (file) {
    if (!allowedTypes.includes(file.type)) {
      showMessageModal("❌ Invalid file type. Only JPEG, PNG, JPG, or WEBP allowed.");
      return;
    }

    if (file.size > maxSize) {
      showMessageModal("❌ Image size should be less than 2MB.");
      return;
    }

    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("imagePreview").src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("updateForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const updatedData = {
    sid: student.sid,
    fname: document.getElementById("fname").value.trim(),
    lname: document.getElementById("lname").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    address: document.getElementById("address").value.trim(),
    mobileNumber: document.getElementById("mobileNumber").value.trim(),
    course: student.course || [] // Preserve subscribed courses
  };

  try {
    const res = await fetch("http://localhost:8080/studentupdate", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });

    if (!res.ok) {
      if (res.status === 503) {
        const updatedStudent = await res.json();
        throw new Error("updation done but email was not sent due to network issue");
      } else {
        throw new Error("Failed to update details");
      }
    }

    let updatedStudent = await res.json();

    if (selectedFile !== null) {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const imgRes = await fetch(`http://localhost:8080/uploadImage/${student.sid}`, {
        method: "PUT",
        body: formData
      });

      if (!imgRes.ok) throw new Error("Image upload failed");

      const updatedWithImg = await imgRes.json();
      localStorage.setItem("studentData", JSON.stringify(updatedWithImg));
    } else {
      localStorage.setItem("studentData", JSON.stringify(updatedStudent));
    }

    showMessageModal("✅ Student updated successfully!", () => {
      window.location.href = "studentdetails.html";
    });

  } catch (err) {
    if (err.message.includes("email was not sent")) {
      showMessageModal("✅ Data updated, but email not sent due to network issues.", () => {
        window.location.href = "studentdetails.html";
      });
    } else {
      showMessageModal("❌ Update failed: " + err.message);
    }
  }
});

// function showMessageModal(message, callback = null) {
//   let modal = document.getElementById("messageModal");
//   if (!modal) {
//     modal = document.createElement("div");
//     modal.id = "messageModal";
//     modal.classList.add("modal-overlay");
//     modal.innerHTML = `
//       <div class="modal-box">
//         <p id="messageText"></p>
//         <div class="modal-buttons" style="justify-content: center;">
//           <button id="messageCloseBtn">OK</button>
//         </div>
//       </div>`;
//     document.body.appendChild(modal);
//   }


//   const messageText = modal.querySelector("#messageText");
//   const closeBtn = modal.querySelector("#messageCloseBtn");

//   messageText.textContent = message;
//   modal.classList.remove("hidden");

//   const newClose = closeBtn.cloneNode(true);
//   closeBtn.parentNode.replaceChild(newClose, closeBtn);

//   newClose.addEventListener("click", () => {
//     modal.classList.add("hidden");
//     if (callback) callback();
//   });
// }

// popup.js

function showMessageModal(message, callback = null) {
  const modal = document.getElementById("messageModal");
  const messageText = document.getElementById("messageText");
  const closeBtn = document.getElementById("messageCloseBtn");

  if (!modal || !messageText || !closeBtn) {
    console.error("❌ Modal structure not found. Make sure popup.html is included in the page.");
    return;
  }

  messageText.textContent = message;
  modal.classList.remove("hidden");

  const newClose = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newClose, closeBtn);

  newClose.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (callback) callback();
  });
}


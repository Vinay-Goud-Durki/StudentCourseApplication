const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const form = document.querySelector("form");

// Toggle visibility for main password
togglePassword.addEventListener("click", function () {
  const type =
    password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

// Toggle visibility for confirm password
toggleConfirmPassword.addEventListener("click", function () {
  const type =
    confirmPassword.getAttribute("type") === "password" ? "text" : "password";
  confirmPassword.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const passwordVal = password.value.trim();
  const confirmPasswordVal = confirmPassword.value.trim();
  const mobileNoVal = document.getElementById("mobileNo").value.trim();

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const validationnotcrrt = document.getElementById("validationnotcrrt");
  const passcrrtindi = document.getElementById("passcrrtornot");
  const docreset = document.getElementById("reset");

  // Validate password strength
  if (!regex.test(passwordVal)) {
    validationnotcrrt.innerHTML =
      "❌ Password must contain at least:<br>• 8 characters<br>• 1 uppercase letter<br>• 1 lowercase letter<br>• 1 number<br>• 1 special character (@$!%*?#&)";
    return;
  } else {
    validationnotcrrt.innerHTML = "";
  }

  if (passwordVal !== confirmPasswordVal) {
    passcrrtindi.innerHTML = "<strong>Passwords don't match</strong><br>";
    docreset.style.display = "block";
    return;
  }

  if (!/^[6-9][0-9]{9}$/.test(mobileNoVal)) {
    showMessageModal(
      "❌ Invalid mobile number. Must start with 6-9 and be 10 digits."
    );
    return;
  }

  const mobileNoLong = Number(BigInt(mobileNoVal));

  const formData = {
    fname: document.getElementById("fname").value.trim(),
    lname: document.getElementById("lname").value.trim(),
    email: document.getElementById("email").value.trim(),
    // mobileNo: mobileNoLong,
    mobileNumber: mobileNoLong,
    address: document.getElementById("address").value.trim(),
    password: passwordVal,
  };

  fetch("http://localhost:8080/saveAdmin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then(async (response) => {
      // Parse JSON body – always!
      const data = await response.json(); // Check your API's logic error/codes
      if (!response.ok || (data.statuscode && data.statuscode !== 200)) {
        // Show backend error message if present, fallback to generic
        throw new Error(data.msg || data.data || "Unknown error");
      }
      return data;
    })
    .then((data) => {
      showMessageModal("✅ Sign-up successful!", () => {
        form.reset();
        window.location.href = "signin.html";
      });
    })
    .catch((error) => {
      // Show backend message if provided
      showMessageModal("❌ Sign-up failed: " + error.message);
    });
});

function resetpage() {
  password.value = "";
  confirmPassword.value = "";
  document.getElementById("passcrrtornot").innerHTML = "";
  document.getElementById("validationnotcrrt").innerHTML = "";
  document.getElementById("reset").style.display = "none";
}

function showMessageModal(message, callback = null) {
  let modal = document.getElementById("messageModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "messageModal";
    modal.classList.add("modal-overlay");
    modal.innerHTML = `
      <div class="modal-box">
        <p id="messageText"></p>
        <div class="modal-buttons" style="justify-content: center;">
          <button id="messageCloseBtn">OK</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }

  const messageText = modal.querySelector("#messageText");
  const closeBtn = modal.querySelector("#messageCloseBtn");

  messageText.textContent = message;
  modal.classList.remove("hidden");

  const newClose = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newClose, closeBtn);

  newClose.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (callback) callback();
  });
}

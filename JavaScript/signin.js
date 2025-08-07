let generatedOTP;
// Toggle visibility for password
document.getElementById("togglePassword").addEventListener("click", function () {
  const password = document.getElementById("password");
  const type = password.getAttribute("type") === "password" ? "text" : "password";
  password.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});

// Toggle visibility for confirm password
document.getElementById("toggleConfirmPassword").addEventListener("click", function () {
  const confirmPassword = document.getElementById("confirmPassword");
  const type = confirmPassword.getAttribute("type") === "password" ? "text" : "password";
  confirmPassword.setAttribute("type", type);
  this.classList.toggle("fa-eye");
  this.classList.toggle("fa-eye-slash");
});



// Generate and show random 5-digit OTP
// const generatedOTP = Math.floor(10000 + Math.random() * 90000);
// document.getElementById("randomNumber").textContent = generatedOTP;

// Function to generate and display a new OTP
function regenerateOTP() {
  generatedOTP = Math.floor(10000 + Math.random() * 90000);
  document.getElementById("randomNumber").textContent = generatedOTP;
}
// Call it initially to show OTP on load
regenerateOTP();


document.getElementById("signinForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const otpInput = document.getElementById("otpInput").value.trim();

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{8,}$/;
  const validationnotcrrt=document.getElementById("validationnotcrrt");
  // Validate password strength
  if (!passwordRegex.test(password)) {
    //alert("❌ Password must contain at least:\n• 8 characters\n• 1 uppercase letter\n• 1 lowercase letter\n• 1 number\n• 1 special character (@$!%*?#&)");
    validationnotcrrt.innerHTML="❌ Password must contain at least:<br>• 8 characters<br>• 1 uppercase letter<br>• 1 lowercase letter<br>• 1 number<br>• 1 special character (@$!%*?#&)";
    return;
  }else{
    validationnotcrrt.innerHTML="validation done correct";
  }
    const passcrrtindi=document.getElementById("passcrrtornot");
    const docreset=document.getElementById("reset");
  // Validate password match
  if (password !== confirmPassword) {
    // alert("❌ Passwords do not match.");
    // return;
    passcrrtindi.innerHTML="<strong>passwards don't match</strong><br>";
    docreset.style.display="block";
    return;
  }

  const otpMatchOrNot=document.getElementById("otpMatchOrNot");
  // Validate OTP
  if (otpInput !== generatedOTP.toString()) {
    // alert("❌ OTP does not match.");
    otpMatchOrNot.innerText="❌ OTP does not match.";
    return;
  }else{
    otpMatchOrNot.innerText = ""; // Clear error if passed
  }




  // If all validations pass
  //alert("✅ All validations passed. You can proceed with login or submission.");
  // Continue to call fetch() or submit the form here
    // Prepare login data
  const email = document.getElementById("email").value.trim();
  const loginData = {
    email: email,
    password: password
  };

  // Send POST request to backend
  fetch("http://localhost:8080/studentlogin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(loginData)
  })
  // .then(response => {
  //   console.log( JSON.stringify(response));
  //   console.log( JSON.stringify(data));
  //   if (!response.ok) {
  //    console.log( JSON.stringify(response));
  //     throw new Error("❌ Invalid credentials or server error");
  //   }
  //   return response.json();
  // })
  .then(async response => {
  const result = await response.json();
    console.log(result);
  if (!response.ok) {
    // Manually throw error object with result
    throw { response: result };
  }

  return result;
})

  // .then(data => {
  //   console.log("✅ Login Response:", data);

  //   // Optional: Store response in localStorage
  //   localStorage.setItem("studentData", JSON.stringify(data));
    
  //   // Example: Store specific fields if needed
  //   // localStorage.setItem("studentId", data.data.id);
  //   // localStorage.setItem("studentName", data.data.fname);

  //   alert("✅ Login successful!");
        
  //   // Redirect to another page (e.g., dashboard)
  //   window.location.href = "studentdetails.html";
  // })

  .then(data => {
  console.log("✅ Login Response:", data);

  // Store in localStorage
  localStorage.setItem("studentData", JSON.stringify(data));

  // Show success message in modal, then redirect
  showMessageModal("✅ Login successful!", () => {
    window.location.href = "studentdetails.html";
  });
})

.catch(async (error) => {
  let errorMsg = "❌ Login failed. Please try again.";

  try {
    // Handle Axios-style error with response.data
    if (error?.response?.data) {
      errorMsg = error.response.data;

      if (errorMsg.toLowerCase().includes("email")) {
        errorMsg = "❌ Email is not registered. Please check your email.";
      } else if (errorMsg.toLowerCase().includes("password")) {
        errorMsg = "❌ Incorrect password.";
      } else {
        errorMsg = "❌ Login failed: " + errorMsg;
      }
    }
  } catch (e) {
    console.error("Unexpected error format:", e);
  }

  // Show the error message on the screen (inline or modal)
  const errorDiv = document.getElementById("loginErrorMsg");
  if (errorDiv) {
    errorDiv.innerText = errorMsg;
    showMessageModal(errorMsg);
  } else {
    // Fallback modal or alert
    showMessageModal(errorMsg);  // Optional: use modal instead of alert
  }
});

});

function resetpage() {
      window.location.reload();   
    return;
}

function showMessageModal(message, callback = null) {
  const modal = document.getElementById("messageModal");
  const text = document.getElementById("messageText");
  const closeBtn = document.getElementById("messageCloseBtn");

  text.textContent = message;
  modal.classList.remove("hidden");

  const newClose = closeBtn.cloneNode(true);
  closeBtn.parentNode.replaceChild(newClose, closeBtn);

  newClose.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (callback) callback();
  });
}




// Helper for popup modal
function showFpMessage(msg, callback = null) {
  const modal = document.getElementById("fpMessageModal");
  const text = document.getElementById("fpMessageText");
  const btn = document.getElementById("fpMessageCloseBtn");
  if (!modal) alert(msg);
  text.innerHTML = msg;
  modal.classList.remove("hidden");
  const nbtn = btn.cloneNode(true);
  btn.parentNode.replaceChild(nbtn, btn);
  nbtn.onclick = () => {
    modal.classList.add("hidden");
    if (callback) callback();
  };
}

// DOMs
const emailForm   = document.getElementById("emailForm");
const otpForm     = document.getElementById("otpForm");
const resetForm   = document.getElementById("resetForm");
const fpEmail     = document.getElementById("fpEmail");
const fpOtp       = document.getElementById("fpOtp");
const resendOtpBtn = document.getElementById("resendOtpBtn");

// Track for our requests
let verifiedEmail = null; // email that is being processed

// 1. Send OTP
emailForm.addEventListener("submit", async function(e){
  e.preventDefault();
  const email = fpEmail.value.trim();
  if (!email) return showFpMessage("Please enter an email.");
  try {
    const res = await fetch("http://localhost:8080/otpGenerationForForgotPasswordAdmin", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email})
    });
    const data = await res.json();
    if (data.statuscode === 200) {
      showFpMessage("✅ OTP sent to your email!", () => {
        emailForm.classList.add("hidden");
        otpForm.classList.remove("hidden");
        verifiedEmail = email;
      });
    } else {
      showFpMessage("❌ " + (data.msg || "Failed to send OTP. Try again."));
    }
  } catch (err) {
    showFpMessage("❌ Unable to send OTP. Try later.");
  }
});

// 2. Resend OTP
resendOtpBtn.addEventListener("click", async function() {
  if (!verifiedEmail) return showFpMessage("No email to resend OTP for.");
  try {
    const res = await fetch("http://localhost:8080/otpGenerationForForgotPasswordAdmin", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email: verifiedEmail})
    });
    const data = await res.json();
    if (data.statuscode === 200) {
      showFpMessage("✅ New OTP sent to your email.");
    } else {
      showFpMessage("❌ " + (data.msg || "Failed to resend OTP."));
    }
  } catch {
    showFpMessage("❌ Could not resend OTP. Try later.");
  }
});

// 3. Verify OTP
document.getElementById("verifyOtpBtn").addEventListener("click", async function() {
  const otp = fpOtp.value.trim();
  if (!otp || !/^\d{6}$/.test(otp)) 
    return showFpMessage("Please enter a valid 6-digit OTP.");
  try {
    const url = `http://localhost:8080/verifyOtpAdmin/${otp}/?email=${encodeURIComponent(verifiedEmail)}`;
    const res = await fetch(url, { method: "POST" });
    const data = await res.json();
    if (data.statuscode === 200) {
      showFpMessage("✅ OTP verified. Please set your new password.", () => {
        otpForm.classList.add("hidden");
        resetForm.classList.remove("hidden");
      });
    } else {
      showFpMessage("❌ Incorrect OTP. Try again.");
    }
  } catch {
    showFpMessage("❌ Could not verify OTP. Try again.");
  }
});

// 4. Set new password
resetForm.addEventListener("submit", async function(e){
  e.preventDefault();
  const pw1 = document.getElementById("newPassword").value.trim();
  const pw2 = document.getElementById("confirmPassword").value.trim();
  if (!pw1 || !pw2) return showFpMessage("Please enter both password fields.");
  if (pw1 !== pw2) return showFpMessage("Passwords do not match.");
  if (pw1.length < 6) return showFpMessage("Password should be at least 6 characters.");

  try {
    const res = await fetch("http://localhost:8080/updatePasswordAdmin", {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({email: verifiedEmail, password: pw1})
    });
    const data = await res.json();
    if (data.statuscode === 200) {
      showFpMessage("✅ Password reset successful! Please login.", () => {
        window.location.href = "adminsigin.html";
      });
    } else {
      showFpMessage("❌ " + (data.msg || "Failed to reset password."));
    }
  } catch {
    showFpMessage("❌ Could not reset your password. Try later.");
  }
});
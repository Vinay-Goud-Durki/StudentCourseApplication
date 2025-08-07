// Retrieve admin object from localStorage
const admin = JSON.parse(localStorage.getItem("adminData")) || JSON.parse(localStorage.getItem("adminDetails"));
if (!admin) {
  showMessageModal("❌ No Admin data found to prefill the form. <br> Redirecting...", () => {
    window.location.href = "adminsignin.html";
  });
}

// Prefill form
document.getElementById("admId").value = admin.admId || admin.sid || "";
document.getElementById("fname").value = admin.fname || "";
document.getElementById("lname").value = admin.lname || "";
document.getElementById("email").value = admin.email || "";
document.getElementById("password").value = admin.password || "";
document.getElementById("address").value = admin.address || "";
document.getElementById("mobileNumber").value = admin.mobileNumber || "";

// Prefill image preview if any
if (admin.img) {
  document.getElementById("imagePreview").src = `data:image/jpeg;base64,${admin.img}`;
}

let selectedFile = null;

// Image input & preview
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

  // Build the updated data object for admin
  const updatedData = {
    admId: parseInt(document.getElementById("admId").value),
    fname: document.getElementById("fname").value.trim(),
    lname: document.getElementById("lname").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value.trim(),
    address: document.getElementById("address").value.trim(),
    mobileNumber: document.getElementById("mobileNumber").value.trim(),
    // img: admin.img,   // DON'T send 'img' here; image handled via separate API
  };

  try {
    // 1. Update admin details (without image)
    const res = await fetch("http://localhost:8080/updateAdmin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData)
    });
    const result = await res.json();

    if (result.statuscode !== 200) {
      throw new Error(result.msg || "Update failed");
    }

    // 2. If image chosen, upload image
    let updatedAdmin = result.data;
    if (selectedFile !== null) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const imgRes = await fetch(`http://localhost:8080/uploadAdminImage/${updatedAdmin.admId}`, {
        method: "PUT",
        body: formData
      });
      if (!imgRes.ok) throw new Error("Image upload failed");
      const imgResult = await imgRes.json();
      // store new object with potentially new `img` property
      updatedAdmin = imgResult.data;
    }

    // Update both possible keys, for consistency
    localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
    localStorage.setItem("adminDetails", JSON.stringify(updatedAdmin));

    showMessageModal("✅ Admin details updated successfully!", () => {
      window.location.href = "admindetails.html";
    });
  }
  catch (err) {
    showMessageModal("❌ Update failed: " + (err.message || "Unknown error"));
  }
});

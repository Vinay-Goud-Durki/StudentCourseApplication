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


const form = document.querySelector(".form-upload-file");

const input = document.getElementById("file");

input.addEventListener("change", () => {
  form.submit();
});

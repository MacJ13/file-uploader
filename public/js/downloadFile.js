const fileList = document.querySelector(".file-list");

fileList.addEventListener("click", (e) => {
  const downloadBtn = e.target.closest(".btn-download");

  if (!downloadBtn);

  const fileId = downloadBtn.dataset.id;
  const fileName = downloadBtn.dataset.filename;

  const a = document.createElement("a");
  a.href = `\\file\\${fileId}\\download`;
  a.download = fileName;

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

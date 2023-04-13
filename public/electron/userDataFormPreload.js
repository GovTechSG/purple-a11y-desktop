const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const elements = Array.from(document.getElementsByTagName("p"));
    elements.forEach((e) => {
      if (e.innerText.startsWith("Response ID: ")) {
        ipcRenderer.send("userDataFormSubmitted");
        observer.disconnect();
      }
    });
  });

  observer.observe(document.getElementById("root"), {
    subtree: true,
    childList: true,
  });
});

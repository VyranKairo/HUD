document.addEventListener("DOMContentLoaded", () => {
  const editPopup = document.getElementById("edit-popup");
  const widgets = [
    { id: "container", el: document.querySelector(".container") },
    { id: "todo-wrapper", el: document.querySelector(".todo-wrapper") },
  ];

  // FIXED: Default to true so widgets are locked on page load
  let isLocked = true;

  // Apply initial locked state to UI
  widgets.forEach((w) => {
    w.el.classList.add("is-locked");
  });

  // Hotkey Ctrl + Alt + E to toggle Edit Mode
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === "e") {
      e.preventDefault();
      isLocked = !isLocked;

      widgets.forEach((w) => {
        w.el.classList.toggle("is-locked", isLocked);
      });

      if (editPopup) {
        // Show popup when we are in edit mode (isLocked is false)
        editPopup.classList.toggle("show", !isLocked);
      }

      console.log("Edit Mode Active:", !isLocked);
    }
  });

  // Initialize positions ONLY if they haven't been moved before
  if (!localStorage.getItem("container")) {
    const container = widgets[0].el;
    container.style.top = "5px";
    container.style.left = "50%";
    container.style.transform = "translateX(-50%)";
  }

  if (!localStorage.getItem("todo-wrapper")) {
    const todoWrapper = widgets[1].el;
    todoWrapper.style.top = "150px";
    todoWrapper.style.left = "67%";
  }

  // Load saved positions
  widgets.forEach((w) => {
    const savedPos = JSON.parse(localStorage.getItem(w.id));
    if (savedPos) {
      w.el.style.top = savedPos.top;
      w.el.style.left = savedPos.left;
    }
  });

  function makeDraggable(widget) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    const element = widget.el;

    element.onmousedown = (e) => {
      // Only drag if isLocked is false
      if (isLocked) return;

      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "BUTTON"
      ) {
        return;
      }
      e.preventDefault();
      element.style.transition = "none";
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmousemove = dragElement;
      document.onmouseup = stopDragging;
      element.style.transform = "none";
    };

    function dragElement(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
    }

    function stopDragging() {
      document.onmousemove = null;
      document.onmouseup = null;
      element.style.transition = "0.5s ease-in-out";
      localStorage.setItem(
        widget.id,
        JSON.stringify({
          top: element.style.top,
          left: element.style.left,
        }),
      );
    }
    widget.el.style.cursor = "move";
  }

  widgets.forEach((w) => {
    setTimeout(() => {
      w.el.classList.add("is-visible");
    }, 50);
  });

  widgets.forEach((w) => makeDraggable(w));
});

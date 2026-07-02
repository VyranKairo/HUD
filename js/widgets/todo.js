const todoList = document.getElementById("todoList");
const popupInput = document.getElementById("popupTodoInput");
const dayPopup = document.getElementById("day-task-popup");
const popupTitle = document.getElementById("popup-date-title");

window.selectedDateStr = new Date().toISOString().split("T")[0];

window.selectDate = function (dateString) {
  window.selectedDateStr = dateString;
  loadTasks();

  if (typeof renderCalendar === "function" && !isYearView) {
    renderCalendar();
  }
};

function selectDate(dateString) {
  window.selectedDateStr = dateString;
  loadTasks();
}

function advanceRecurrence(task, baseDateStr) {
  const baseDate = new Date(baseDateStr);

  const parts = task.recurrence.split("-");
  const type = parts[0];
  const interval = parts[1] ? parseInt(parts[1], 10) : 1;

  switch (type) {
    case "daily":
      baseDate.setDate(baseDate.getDate() + interval);
      break;
    case "weekly":
      baseDate.setDate(baseDate.getDate() + 7 * interval);
      break;
    case "monthly":
      baseDate.setMonth(baseDate.getMonth() + interval);
      break;
    case "yearly":
      baseDate.setFullYear(baseDate.getFullYear() + interval);
      break;
    default:
      return;
  }

  const nextKey = baseDate.toISOString().split("T")[0];
  const allTasks = JSON.parse(localStorage.getItem("keyed_tasks")) || {};
  if (!allTasks[nextKey]) allTasks[nextKey] = [];

  const exists = allTasks[nextKey].some(
    (t) => t.text === task.text && t.startTime === task.startTime,
  );
  if (!exists) {
    allTasks[nextKey].push({
      text: task.text,
      taskDate: nextKey,
      startTime: task.startTime,
      recurrence: task.recurrence,
      completed: false,
    });
    localStorage.setItem("keyed_tasks", JSON.stringify(allTasks));
  }
}

function retractRecurrence(task, baseDateStr) {
  const baseDate = new Date(baseDateStr);
  const parts = task.recurrence.split("-");
  const type = parts[0];
  const interval = parts[1] ? parseInt(parts[1], 10) : 1;

  switch (type) {
    case "daily":
      baseDate.setDate(baseDate.getDate() + interval);
      break;
    case "weekly":
      baseDate.setDate(baseDate.getDate() + 7 * interval);
      break;
    case "monthly":
      baseDate.setMonth(baseDate.getMonth() + interval);
      break;
    case "yearly":
      baseDate.setFullYear(baseDate.getFullYear() + interval);
      break;
    default:
      return;
  }

  const nextKey = baseDate.toISOString().split("T")[0];
  const allTasks = JSON.parse(localStorage.getItem("keyed_tasks")) || {};

  if (allTasks[nextKey]) {
    allTasks[nextKey] = allTasks[nextKey].filter(
      (t) => !(t.text === task.text && t.startTime === task.startTime),
    );
    if (allTasks[nextKey].length === 0) {
      delete allTasks[nextKey];
    }
    localStorage.setItem("keyed_tasks", JSON.stringify(allTasks));
  }
}

function initTimeDropdowns() {
  const hourOptionsContainer = document.querySelector(
    "#dropdown-startHour .dropdown-options",
  );
  const minOptionsContainer = document.querySelector(
    "#dropdown-startMin .dropdown-options",
  );

  hourOptionsContainer.innerHTML = "";
  for (let h = 1; h <= 12; h++) {
    const hrStr = String(h).padStart(2, "0");
    const item = document.createElement("div");
    item.className =
      "dropdown-item" + (hrStr === "06" ? " option-selected" : "");
    item.textContent = hrStr;
    item.onclick = () => selectCustomOption("dropdown-startHour", hrStr);
    hourOptionsContainer.appendChild(item);
  }

  minOptionsContainer.innerHTML = "";
  for (let m = 0; m < 60; m++) {
    const minStr = String(m).padStart(2, "0");
    const item = document.createElement("div");
    item.className =
      "dropdown-item" + (minStr === "00" ? " option-selected" : "");
    item.textContent = minStr;
    item.onclick = () => selectCustomOption("dropdown-startMin", minStr);
    minOptionsContainer.appendChild(item);
  }
}

window.toggleCustomDropdown = function (dropdownId) {
  const el = document.getElementById(dropdownId);
  const isOpen = el.classList.contains("open");

  document
    .querySelectorAll(".custom-dropdown")
    .forEach((d) => d.classList.remove("open"));

  if (!isOpen) {
    el.classList.add("open");

    const selectedItem = el.querySelector(".option-selected");
    const container = el.querySelector(".dropdown-options");
    if (selectedItem && container) {
      container.scrollTop = selectedItem.offsetTop - container.offsetTop - 40;
    }
  }
};

window.selectCustomOption = function (
  dropdownId,
  displayLabel,
  hiddenValue = null,
) {
  const el = document.getElementById(dropdownId);
  const trigger = el.querySelector(".dropdown-trigger");

  trigger.textContent = displayLabel;
  el.dataset.value = hiddenValue !== null ? hiddenValue : displayLabel;

  el.querySelectorAll(".dropdown-item").forEach((item) => {
    item.classList.remove("option-selected");
    if (item.textContent === displayLabel) {
      item.classList.add("option-selected");
    }
  });

  el.classList.remove("open");
};

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-dropdown")) {
    document
      .querySelectorAll(".custom-dropdown")
      .forEach((d) => d.classList.remove("open"));
  }
});

function addPopupTask() {
  if (popupInput.value.trim() === "") return;

  const hr =
    document.getElementById("dropdown-startHour").dataset.value || "06";
  const mn = document.getElementById("dropdown-startMin").dataset.value || "00";
  const ampm =
    document.getElementById("dropdown-startAmpm").dataset.value || "AM";
  const startTimeStr = `${hr}:${mn} ${ampm}`;

  const recurrenceVal =
    document.getElementById("dropdown-recurrence").dataset.value || "none";

  const taskData = {
    text: popupInput.value,
    taskDate: window.selectedDateStr,
    startTime: startTimeStr,
    recurrence: recurrenceVal,
    completed: false,
  };

  createTasks(taskData);
  saveTasks();

  popupInput.value = "";
  selectCustomOption("dropdown-startHour", "06");
  selectCustomOption("dropdown-startMin", "00");
  selectCustomOption("dropdown-startAmpm", "AM");
  selectCustomOption("dropdown-recurrence", "NONE", "none");

  closeDayPopup();
}

popupInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addPopupTask();
});

window.openDayPopup = function (dateString) {
  window.selectedDateStr = dateString;
  loadTasks();

  const formattedDate = new Date(dateString)
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
  popupTitle.textContent = `ADD TASK FOR ${formattedDate}`;
  dayPopup.classList.remove("hidden");
  popupInput.focus();
};

window.closeDayPopup = function () {
  dayPopup.classList.add("hidden");
};

function advanceRecurrence(task, baseDateStr) {
  const baseDate = new Date(baseDateStr);

  switch (task.recurrence) {
    case "daily":
      baseDate.setDate(baseDate.getDate() + 1);
      break;
    case "weekly":
      baseDate.setDate(baseDate.getDate() + 7);
      break;
    case "monthly":
      baseDate.setMonth(baseDate.getMonth() + 1);
      break;
    case "yearly":
      baseDate.setFullYear(baseDate.getFullYear() + 1);
      break;
    default:
      return;
  }

  const nextKey = baseDate.toISOString().split("T")[0];
  const allTasks = JSON.parse(localStorage.getItem("keyed_tasks")) || {};
  if (!allTasks[nextKey]) allTasks[nextKey] = [];

  allTasks[nextKey].push({
    text: task.text,
    taskDate: nextKey,
    startTime: task.startTime,
    recurrence: task.recurrence,
    completed: false,
  });

  localStorage.setItem("keyed_tasks", JSON.stringify(allTasks));
}

function createTasks(task) {
  const li = document.createElement("li");
  li.dataset.taskDate = task.taskDate || window.selectedDateStr;
  li.dataset.startTime = task.startTime || "06:00 AM";
  li.dataset.recurrence = task.recurrence || "none";

  const contentWrapper = document.createElement("div");
  contentWrapper.style.display = "flex";
  contentWrapper.style.flexDirection = "column";

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = task.text;
  if (task.completed) taskText.classList.add("completed");

  contentWrapper.appendChild(taskText);

  const itemDateObj = new Date(li.dataset.taskDate);
  const formattedDateLabel = itemDateObj
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    .toUpperCase();

  let metaPieces = [];
  metaPieces.push(`DATE: ${formattedDateLabel}`);
  metaPieces.push(`START: ${li.dataset.startTime}`);

  if (task.recurrence && task.recurrence !== "none") {
    const parts = task.recurrence.split("-");
    const type = parts[0].toUpperCase();
    const interval = parts[1] ? parts[1] : null;

    if (interval && interval !== "1") {
      metaPieces.push(
        `⟳ ${type} (EVERY ${interval} ${type === "DAILY" ? "DAYS" : type.replace("LY", "S")})`,
      );
    } else {
      metaPieces.push(`⟳ ${type}`);
    }
  }

  const metaSpan = document.createElement("span");
  metaSpan.className = "task-meta";
  metaSpan.textContent = metaPieces.join("  |  ");
  contentWrapper.appendChild(metaSpan);

  const actions = document.createElement("div");
  actions.className = "actions";

  const doneBtn = document.createElement("span");
  doneBtn.className = "done-btn";
  doneBtn.textContent = task.completed ? "↻" : "✓";

  const delBtn = document.createElement("span");
  delBtn.className = "del-btn";
  delBtn.textContent = "×";

  actions.appendChild(doneBtn);
  actions.appendChild(delBtn);
  li.appendChild(contentWrapper);
  li.appendChild(actions);
  todoList.appendChild(li);

  doneBtn.addEventListener("click", () => {
    if (taskText.classList.contains("completed")) {
      taskText.classList.remove("completed");
      doneBtn.textContent = "✓";
      saveTasks();

      if (li.dataset.recurrence !== "none") {
        retractRecurrence(
          {
            text: taskText.textContent,
            startTime: li.dataset.startTime,
            recurrence: li.dataset.recurrence,
          },
          li.dataset.taskDate,
        );
      }
    } else {

      taskText.classList.add("completed");
      doneBtn.textContent = "↻";

      if (li.dataset.recurrence !== "none") {
        advanceRecurrence(
          {
            text: taskText.textContent,
            startTime: li.dataset.startTime,
            recurrence: li.dataset.recurrence,
          },
          li.dataset.taskDate,
        );

        li.style.opacity = "0";
        setTimeout(() => {
          li.remove();
          saveTasks();
        }, 200);
      } else {

        saveTasks();
      }
    }
  });

  delBtn.addEventListener("click", () => {
    li.style.opacity = "0";
    setTimeout(() => {
      li.remove();
      saveTasks();
    }, 200);
  });
}

function saveTasks() {
  const allTasks = JSON.parse(localStorage.getItem("keyed_tasks")) || {};
  const currentDayTasks = [];

  document.querySelectorAll("#todoList li").forEach((li) => {
    currentDayTasks.push({
      text: li.querySelector(".task-text").textContent,
      taskDate: li.dataset.taskDate,
      startTime: li.dataset.startTime,
      recurrence: li.dataset.recurrence || "none",
      completed: li.querySelector(".task-text").classList.contains("completed"),
    });
  });

  if (currentDayTasks.length > 0) {
    allTasks[window.selectedDateStr] = currentDayTasks;
  } else {
    delete allTasks[window.selectedDateStr];
  }
  localStorage.setItem("keyed_tasks", JSON.stringify(allTasks));
}

function loadTasks() {
  todoList.innerHTML = "";
  const allTasks = JSON.parse(localStorage.getItem("keyed_tasks")) || {};
  const tasks = allTasks[window.selectedDateStr] || [];
  tasks.forEach((task) => {
    createTasks(task);
  });
}

document.getElementById("dropdown-startHour").dataset.value = "06";
document.getElementById("dropdown-startMin").dataset.value = "00";
document.getElementById("dropdown-startAmpm").dataset.value = "AM";
document.getElementById("dropdown-recurrence").dataset.value = "none";

initTimeDropdowns();
loadTasks();

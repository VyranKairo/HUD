const calendarEl = document.getElementById("calendar-grid");
const monthYearEl = document.getElementById("month-year");
const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");
// New reference
const yearSelectorEl = document.getElementById("year-selector");

let currentDate = new Date();
let isYearView = false;
let decadeStart = 0;

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

// Render Month View
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();

  calendarEl.style.opacity = "0";
  calendarEl.style.transition = "opacity 0.2s ease";

  setTimeout(() => {
    monthYearEl.textContent = new Date(year, month)
      .toLocaleDateString("en-GB", { month: "long", year: "numeric" })
      .toUpperCase();

    calendarEl.innerHTML = "";
    const dayLabels = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    dayLabels.forEach((label) => {
      const dayLabel = document.createElement("div");
      dayLabel.className = "day-label";
      dayLabel.textContent = label;
      calendarEl.appendChild(dayLabel);
    });

    const firstDay = getFirstDayOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);

    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.className = "calendar-day empty";
      calendarEl.appendChild(emptyCell);
    }

    // Inside renderCalendar() in calendar.js, replace the day rendering loop with this:
    for (let day = 1; day <= daysInMonth; day++) {
      const dayCell = document.createElement("div");
      dayCell.className = "calendar-day";
      dayCell.textContent = day;

      const paddedMonth = String(month + 1).padStart(2, "0");
      const paddedDay = String(day).padStart(2, "0");
      const targetDateStr = `${year}-${paddedMonth}-${paddedDay}`;

      // If this cell matches today's actual date, mark it
      if (
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        dayCell.classList.add("today");
      }

      // FIXED: If this cell matches the globally selected date, make it glow/active
      if (targetDateStr === window.selectedDateStr) {
        dayCell.classList.add("selected-day");
      }

      // SINGLE CLICK: Select, switch style, and load tasks
      dayCell.addEventListener("click", () => {
        // Remove selected styling from any other cell first
        document.querySelectorAll(".calendar-day").forEach((cell) => {
          cell.classList.remove("selected-day");
        });

        // Add selected styling to this cell
        dayCell.classList.add("selected-day");

        if (typeof window.selectDate === "function") {
          window.selectDate(targetDateStr);
        }
      });

      // DOUBLE CLICK: Open popup
      dayCell.addEventListener("dblclick", () => {
        if (typeof window.openDayPopup === "function") {
          window.openDayPopup(targetDateStr);
        }
      });

      calendarEl.appendChild(dayCell);
    }
    calendarEl.style.opacity = "1";
  }, 200);
}

// Render Decade View
function renderYearView() {
  yearSelectorEl.style.opacity = "0";
  yearSelectorEl.style.transition = "opacity 0.2s ease";

  setTimeout(() => {
    monthYearEl.textContent = `${decadeStart} - ${decadeStart + 9}`;
    yearSelectorEl.innerHTML = "";

    for (let i = 0; i <= 9; i++) {
      const year = decadeStart + i;
      const yearBtn = document.createElement("button");
      yearBtn.className = "year-btn";
      yearBtn.textContent = year;

      if (year === currentDate.getFullYear()) {
        yearBtn.classList.add("current-year");
      }

      yearBtn.addEventListener("click", () => {
        currentDate.setFullYear(year);
        toggleView();
      });
      yearSelectorEl.appendChild(yearBtn);
    }
    yearSelectorEl.style.opacity = "1";
  }, 200);
}

function toggleView() {
  isYearView = !isYearView;
  if (isYearView) {
    decadeStart = Math.floor(currentDate.getFullYear() / 10) * 10;
    calendarEl.style.display = "none";
    yearSelectorEl.style.display = "grid";
    renderYearView();
  } else {
    yearSelectorEl.style.display = "none";
    calendarEl.style.display = "grid";
    renderCalendar();
  }
}

// Event Listeners
monthYearEl.addEventListener("click", toggleView);

prevBtn.addEventListener("click", () => {
  if (isYearView) {
    decadeStart -= 10;
    renderYearView();
  } else {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  }
});

nextBtn.addEventListener("click", () => {
  if (isYearView) {
    decadeStart += 10;
    renderYearView();
  } else {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  }
});

renderCalendar();

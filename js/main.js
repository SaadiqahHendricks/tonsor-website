
/* =========================================
   TONSOR BARBERSHOP
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   1. MOBILE NAVIGATION
========================================= */

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", isOpen);
  });

  // Close menu when a navigation link is clicked
  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}


/* =========================================
   2. AUTOMATIC FOOTER YEAR
========================================= */

const yearElement = document.getElementById("year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* =========================================
   3. SCROLL REVEAL ANIMATIONS
========================================= */

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12
    }
  );

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach(element => {
    element.classList.add("visible");
  });
}


/* =========================================
   4. BOOKING FORM ELEMENTS
========================================= */

const bookingForm = document.getElementById("bookingForm");

const serviceSelect = document.getElementById("service");
const extraTimeCheckbox = document.getElementById("extraTime");
const bookingDateInput = document.getElementById("bookingDate");

const timeSlotsContainer = document.getElementById("timeSlots");
const selectedTimeInput = document.getElementById("selectedTime");


/* =========================================
   5. OPENING HOURS
========================================= */

// JavaScript days:
// Sunday = 0
// Monday = 1
// Tuesday = 2
// Wednesday = 3
// Thursday = 4
// Friday = 5
// Saturday = 6

const openingHours = {
  1: { start: 9, end: 18 },
  2: { start: 9, end: 18 },
  3: { start: 9, end: 18 },
  4: { start: 9, end: 18 },
  5: { start: 9, end: 18 },
  6: { start: 9, end: 15 }
};


/* =========================================
   6. APPOINTMENT SETTINGS
========================================= */

// Standard appointment: 60 minutes
// Extra finishing touches: 90 minutes

const STANDARD_DURATION = 60;
const EXTRA_DURATION = 90;


/* =========================================
   7. SET MINIMUM BOOKING DATE
========================================= */

if (bookingDateInput) {
  const today = new Date();

  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  bookingDateInput.min = localToday;
}


/* =========================================
   8. FORMAT TIME
========================================= */

function formatTime(hour, minute = 0) {
  const formattedHour = String(hour).padStart(2, "0");
  const formattedMinute = String(minute).padStart(2, "0");

  return `${formattedHour}:${formattedMinute}`;
}


/* =========================================
   9. GENERATE AVAILABLE TIME SLOTS
========================================= */

function generateTimeSlots() {

  if (!serviceSelect || !bookingDateInput || !timeSlotsContainer) {
    return;
  }

  const selectedService = serviceSelect.value;
  const selectedDate = bookingDateInput.value;

  // Reset previously selected time
  if (selectedTimeInput) {
    selectedTimeInput.value = "";
  }

  timeSlotsContainer.innerHTML = "";

  // Customer must select a service and date
  if (!selectedService || !selectedDate) {
    showSlotsMessage("Select a service and date to view available times.");
    return;
  }

  // Prevent invalid dates
  const dateParts = selectedDate.split("-").map(Number);

  const selectedDateObject = new Date(
    dateParts[0],
    dateParts[1] - 1,
    dateParts[2]
  );

  // Check Sunday
  const dayOfWeek = selectedDateObject.getDay();

  if (dayOfWeek === 0) {
    showSlotsMessage("TONSOR is closed on Sundays. Please choose another day.");
    return;
  }

  // Get opening hours
  const hours = openingHours[dayOfWeek];

  if (!hours) {
    showSlotsMessage("No appointments are available on this date.");
    return;
  }

  // Determine appointment duration
  const appointmentDuration = extraTimeCheckbox.checked
    ? EXTRA_DURATION
    : STANDARD_DURATION;

  const durationInHours = appointmentDuration / 60;

  // Get current time
  const now = new Date();

  const isToday =
    selectedDateObject.getFullYear() === now.getFullYear() &&
    selectedDateObject.getMonth() === now.getMonth() &&
    selectedDateObject.getDate() === now.getDate();

  let availableSlots = [];

  // Generate hourly appointment starts
  for (
    let hour = hours.start;
    hour + durationInHours <= hours.end;
    hour++
  ) {

    const slotTime = formatTime(hour);

    // Check whether appointment is in the past
    if (isToday) {

      const slotDateTime = new Date(
        selectedDateObject.getFullYear(),
        selectedDateObject.getMonth(),
        selectedDateObject.getDate(),
        hour,
        0
      );

      if (slotDateTime <= now) {
        continue;
      }
    }

    availableSlots.push(slotTime);
  }

  // No remaining appointments
  if (availableSlots.length === 0) {
    showSlotsMessage("No appointment times are available for this date. Please choose another day.");
    return;
  }

  // Display available appointment buttons
  availableSlots.forEach(time => {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "time-slot";
    button.textContent = time;

    button.addEventListener("click", () => {

      // Remove previous selection
      document.querySelectorAll(".time-slot").forEach(slot => {
        slot.classList.remove("selected");
      });

      // Select current time
      button.classList.add("selected");

      // Save selected time
      selectedTimeInput.value = time;

    });

    timeSlotsContainer.appendChild(button);

  });

}


/* =========================================
   10. DISPLAY SLOT MESSAGES
========================================= */

function showSlotsMessage(message) {

  if (!timeSlotsContainer) {
    return;
  }

  const paragraph = document.createElement("p");

  paragraph.className = "slots-message";
  paragraph.textContent = message;

  timeSlotsContainer.appendChild(paragraph);
}


/* =========================================
   11. UPDATE APPOINTMENTS WHEN DETAILS CHANGE
========================================= */

if (serviceSelect) {
  serviceSelect.addEventListener("change", generateTimeSlots);
}

if (bookingDateInput) {
  bookingDateInput.addEventListener("change", generateTimeSlots);
}

if (extraTimeCheckbox) {
  extraTimeCheckbox.addEventListener("change", generateTimeSlots);
}


/* =========================================
   12. BOOKING FORM VALIDATION
========================================= */

if (bookingForm) {

  bookingForm.addEventListener("submit", event => {

    event.preventDefault();

    // Check service
    if (!serviceSelect.value) {
      alert("Please select a service.");
      serviceSelect.focus();
      return;
    }

    // Check date
    if (!bookingDateInput.value) {
      alert("Please select an appointment date.");
      bookingDateInput.focus();
      return;
    }

    // Check selected time
    if (!selectedTimeInput.value) {
      alert("Please select an available appointment time.");
      timeSlotsContainer.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
      return;
    }

    // Check customer details
    const customerName = document.getElementById("customerName");
    const customerEmail = document.getElementById("customerEmail");
    const customerPhone = document.getElementById("customerPhone");

    if (!customerName.value.trim()) {
      alert("Please enter your full name.");
      customerName.focus();
      return;
    }

    if (!customerEmail.value.trim() || !customerEmail.checkValidity()) {
      alert("Please enter a valid email address.");
      customerEmail.focus();
      return;
    }

    if (!customerPhone.value.trim()) {
      alert("Please enter your phone number.");
      customerPhone.focus();
      return;
    }

    // Demo confirmation only
    alert(
      "Your booking details have been completed!\n\n" +
      "Service: " + serviceSelect.options[serviceSelect.selectedIndex].text + "\n" +
      "Date: " + bookingDateInput.value + "\n" +
      "Time: " + selectedTimeInput.value + "\n\n" +
      "This is a demonstration only. Your appointment has not yet been submitted to TONSOR."
    );

  });

}


/* =========================================
   END OF TONSOR JAVASCRIPT
========================================= */

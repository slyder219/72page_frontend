let initialized = false;

function initSiteUi() {
  if (initialized) return;
  initialized = true;

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute("aria-expanded", "false");
      nav.classList.remove("open");
    };

    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!nav.contains(target) && !menuButton.contains(target)) {
        closeMenu();
      }
    });
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    document.querySelectorAll(".section").forEach((section, index) => {
      section.classList.add("reveal");
      section.style.transitionDelay = `${index * 60}ms`;
      observer.observe(section);
    });
  }

  const contactForm = document.querySelector(".form");
  const formStatus = document.querySelector("#form-status");

  if (contactForm instanceof HTMLFormElement) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = contactForm.querySelector("#name")?.value?.trim() || "";
      const email = contactForm.querySelector("#email")?.value?.trim() || "";
      const message = contactForm.querySelector("#message")?.value?.trim() || "";

      if (!name || !email || !message) {
        if (formStatus) {
          formStatus.textContent = "Please fill out all required fields.";
        }
        return;
      }

      const subject = encodeURIComponent(`Website inquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
      );

      if (formStatus) {
        formStatus.textContent = "Opening your email app to send this message...";
      }

      window.location.href = `mailto:hello@72degreeseast.com?subject=${subject}&body=${body}`;
    });
  }
}

document.addEventListener("partials:loaded", initSiteUi);
document.addEventListener("DOMContentLoaded", initSiteUi);

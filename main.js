let menuBound = false;
let formBound = false;
let countUpBound = false;

function formatCountValue(value, format, suffix) {
  let displayValue;

  if (format === "compact") {
    displayValue = new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 0,
    }).format(value);
  } else {
    displayValue = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(value);
  }

  return `${displayValue}${suffix}`;
}

function animateCountUp(element) {
  if (element.dataset.counted === "true") return;
  element.dataset.counted = "true";

  const target = Number.parseInt(element.dataset.target || "0", 10);
  const suffix = element.dataset.suffix || "";
  const format = element.dataset.format || "plain";

  if (!Number.isFinite(target) || target <= 0) {
    element.textContent = formatCountValue(0, format, suffix);
    return;
  }

  const duration = 1600;
  const startTime = performance.now();

  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(target * eased);

    element.textContent = formatCountValue(current, format, suffix);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };

  window.requestAnimationFrame(step);
}

function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
}

function initSiteUi() {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (!menuBound && menuButton && nav) {
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

    menuBound = true;
  }

  if (!countUpBound) {
    const counters = Array.from(document.querySelectorAll(".countup"));

    if (counters.length > 0) {
      if ("IntersectionObserver" in window) {
        const counterObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;
              animateCountUp(entry.target);
              observer.unobserve(entry.target);
            });
          },
          { threshold: 0.35 }
        );

        counters.forEach((counter) => {
          if (isInViewport(counter)) {
            animateCountUp(counter);
            return;
          }

          counterObserver.observe(counter);
        });
      } else {
        counters.forEach((counter) => {
          animateCountUp(counter);
        });
      }

      countUpBound = true;
    }
  }

  const contactForm = document.querySelector(".form");
  const formStatus = document.querySelector("#form-status");

  if (!formBound && contactForm instanceof HTMLFormElement) {
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

      const recipientEmail =
        typeof window.siteMetadata?.email === "string" && window.siteMetadata.email.trim()
          ? window.siteMetadata.email.trim()
          : "hello@72degreeseast.com";

      window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
    });

    formBound = true;
  }
}

document.addEventListener("partials:loaded", initSiteUi);
document.addEventListener("DOMContentLoaded", initSiteUi);

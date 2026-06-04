async function loadPartials() {
  const body = document.body;
  const base = body.dataset.base || "";
  const activePage = body.dataset.page || "";

  const headerMount = document.querySelector("#site-header");
  const footerMount = document.querySelector("#site-footer");

  if (!headerMount && !footerMount) return;

  try {
    if (headerMount) {
      const headerRes = await fetch(`${base}partials/header.html`);
      const headerHtmlRaw = await headerRes.text();
      const headerHtml = headerHtmlRaw.replaceAll("__BASE__", base);
      headerMount.innerHTML = headerHtml;

      if (activePage) {
        const active = headerMount.querySelector(`[data-nav="${activePage}"]`);
        if (active) active.classList.add("active");
      }
    }

    if (footerMount) {
      const footerRes = await fetch(`${base}partials/footer.html`);
      const footerHtml = await footerRes.text();
      footerMount.innerHTML = footerHtml;
    }

    document.dispatchEvent(new CustomEvent("partials:loaded"));
  } catch (err) {
    console.error("Failed to load partials", err);
  }
}

loadPartials();

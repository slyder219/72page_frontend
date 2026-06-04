const DEFAULT_SITE_METADATA = {
  phone: "+1 609 436 0132",
  address: "1800 E State St Suite 168C, Hamilton Twp, NJ 08609",
  email: "hello@72degreeseast.com",
  website: "https://72degreeseast.com",
};

function normalizeWebsiteUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) {
    return DEFAULT_SITE_METADATA.website;
  }

  const trimmed = rawUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function toTelHref(phone) {
  if (typeof phone !== "string") {
    return "tel:+16094360132";
  }

  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "tel:+16094360132";
}

function getWebsiteHost(website) {
  try {
    return new URL(website).host;
  } catch {
    return "72degreeseast.com";
  }
}

function applySiteMetadata(root, metadata) {
  if (!root) return;

  const website = normalizeWebsiteUrl(metadata.website);
  const websiteHost = getWebsiteHost(website);

  root.querySelectorAll("[data-meta-text='phone']").forEach((node) => {
    node.textContent = metadata.phone;
  });

  root.querySelectorAll("[data-meta-text='address']").forEach((node) => {
    node.textContent = metadata.address;
  });

  root.querySelectorAll("[data-meta-text='email']").forEach((node) => {
    node.textContent = metadata.email;
  });

  root.querySelectorAll("[data-meta-text='websiteHost']").forEach((node) => {
    node.textContent = websiteHost;
  });

  root.querySelectorAll("[data-meta-href='phone']").forEach((node) => {
    if (node instanceof HTMLAnchorElement) {
      node.href = toTelHref(metadata.phone);
    }
  });

  root.querySelectorAll("[data-meta-href='email']").forEach((node) => {
    if (node instanceof HTMLAnchorElement) {
      node.href = `mailto:${metadata.email}`;
    }
  });

  root.querySelectorAll("[data-meta-href='website']").forEach((node) => {
    if (node instanceof HTMLAnchorElement) {
      node.href = website;
    }
  });
}

async function getSiteMetadata(base) {
  try {
    if (!window.SITE_METADATA) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${base}assets/metadata.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("metadata.js failed to load"));
        document.head.appendChild(script);
      });
    }

    if (window.SITE_METADATA && typeof window.SITE_METADATA === "object") {
      const metadata = window.SITE_METADATA;
      return {
        phone:
          typeof metadata.phone === "string" && metadata.phone.trim()
            ? metadata.phone.trim()
            : DEFAULT_SITE_METADATA.phone,
        address:
          typeof metadata.address === "string" && metadata.address.trim()
            ? metadata.address.trim()
            : DEFAULT_SITE_METADATA.address,
        email:
          typeof metadata.email === "string" && metadata.email.trim()
            ? metadata.email.trim()
            : DEFAULT_SITE_METADATA.email,
        website: normalizeWebsiteUrl(metadata.website || DEFAULT_SITE_METADATA.website),
      };
    }
  } catch (err) {
    console.warn("Failed to load metadata.js, trying metadata.json", err);
  }

  try {
    const response = await fetch(`${base}assets/metadata.json`, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Metadata fetch failed: ${response.status}`);
    }

    const json = await response.json();
    return {
      phone: typeof json.phone === "string" && json.phone.trim() ? json.phone.trim() : DEFAULT_SITE_METADATA.phone,
      address: typeof json.address === "string" && json.address.trim() ? json.address.trim() : DEFAULT_SITE_METADATA.address,
      email: typeof json.email === "string" && json.email.trim() ? json.email.trim() : DEFAULT_SITE_METADATA.email,
      website: normalizeWebsiteUrl(json.website || DEFAULT_SITE_METADATA.website),
    };
  } catch (err) {
    console.warn("Failed to load metadata.json, using defaults", err);
    return { ...DEFAULT_SITE_METADATA };
  }
}

async function loadPartials() {
  const body = document.body;
  const base = body.dataset.base || "";
  const activePage = body.dataset.page || "";

  const headerMount = document.querySelector("#site-header");
  const footerMount = document.querySelector("#site-footer");

  if (!headerMount && !footerMount) return;

  try {
    const siteMetadata = await getSiteMetadata(base);
    window.siteMetadata = siteMetadata;

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

    applySiteMetadata(document, siteMetadata);

    document.dispatchEvent(new CustomEvent("partials:loaded"));
  } catch (err) {
    console.error("Failed to load partials", err);
  }
}

loadPartials();

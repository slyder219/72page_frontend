import { useEffect, useState } from "react";
import { contact, services } from "./data.js";

const route = window.location.pathname.split("/").filter(Boolean).at(-1) || "index.html";
const serviceSlug = window.location.pathname.includes("/services/") ? route.replace(".html", "") : null;

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const active = serviceSlug || route === "services.html" ? "services" : route.replace(".html", "");
  const links = [["Home", "/index.html", "index"], ["About", "/about.html", "about"], ["Services", "/services.html", "services"], ["Contact", "/contact.html", "contact"]];
  return <>
    <div className="topline"><div><span>New Jersey, USA</span><a href={contact.phoneHref}>{contact.phone}</a></div></div>
    <header className="site-header">
      <a className="brand" href="/index.html"><img src="/assets/72_logo.jpg" alt="72 Degrees East" /><span>72° East</span></a>
      <button className="menu" type="button" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button>
      <nav id="navigation" className={open ? "open" : ""} aria-label="Primary navigation">
        {links.map(([label, href, key]) => <a key={key} className={active === key ? "active" : ""} href={href}>{label}</a>)}
      </nav>
    </header>
  </>;
}

function Footer() {
  return <footer>
    <div className="footer-main">
      <div><a className="brand footer-brand" href="/index.html"><img src="/assets/72_logo.jpg" alt="" /><span>72° East</span></a><p>Trading, distribution, and operational execution for businesses moving across borders.</p></div>
      <div><p className="footer-label">Explore</p><a href="/about.html">About</a><a href="/services.html">Services</a><a href="/contact.html">Contact</a></div>
      <div><p className="footer-label">Connect</p><a href={contact.phoneHref}>{contact.phone}</a><a href={`mailto:${contact.email}`}>{contact.email}</a></div>
    </div>
    <div className="footer-bottom"><span>© 2026 72 Degrees East Inc.</span><span>Global reach. Grounded execution.</span></div>
  </footer>;
}

function Layout({ children }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return <><Header /><main>{children}</main><Footer /></>;
}

function Button({ href, children, secondary = false }) {
  return <a className={`button ${secondary ? "secondary" : ""}`} href={href}>{children}<Arrow /></a>;
}

function Home() {
  return <Layout>
    <section className="hero home-hero">
      <div className="hero-copy"><p className="kicker">Global trading & distribution</p><h1>Built to move business <em>forward.</em></h1><p className="lead">We connect brands, products, and markets through dependable distribution and hands-on operational execution across emerging economies.</p><div className="actions"><Button href="/services.html">Explore our services</Button><Button href="/contact.html" secondary>Start a conversation</Button></div></div>
      <div className="hero-visual"><img src="/assets/photos/warehouse-2048x1365.jpg" alt="Modern distribution warehouse" /><div className="floating-card"><span>Operating across</span><strong>25+ countries</strong></div></div>
    </section>
    <section className="metrics" aria-label="Company scale"><div><strong>500+</strong><span>Brands</span></div><div><strong>50K+</strong><span>Products</span></div><div><strong>65K+</strong><span>Sq. ft. warehouse</span></div><div><strong>100+</strong><span>Clients</span></div></section>
    <section className="intro section"><div><p className="kicker">What we do</p><h2>Your operational partner for growth across borders.</h2></div><div><p className="large-copy">From sourcing and distribution to packing and export dispatch, we bring the practical infrastructure and responsive service businesses need to expand with confidence.</p><Button href="/about.html" secondary>Meet 72° East</Button></div></section>
    <section className="service-preview section"><div className="section-heading"><div><p className="kicker">Capabilities</p><h2>One partner. Many moving parts.</h2></div><Button href="/services.html" secondary>View all services</Button></div><div className="service-grid">{services.slice(0, 6).map((service, i) => <ServiceCard service={service} index={i} key={service.slug} />)}</div></section>
    <Cta />
  </Layout>;
}

function ServiceCard({ service, index }) {
  return <a className="service-card" href={`/services/${service.slug}.html`}><span className="service-number">0{index + 1}</span><div><h3>{service.title}</h3><p>{service.summary}</p></div><Arrow /></a>;
}

function Services() {
  return <Layout><PageHero kicker="Our capabilities" title={<>The work behind <em>reliable growth.</em></>} text="Flexible operational support for businesses that need products sourced, handled, checked, packed, and moved with care." />
    <section className="services-list section">{services.map((service, i) => <ServiceCard service={service} index={i} key={service.slug} />)}</section><Cta /></Layout>;
}

function PageHero({ kicker, title, text }) {
  return <section className="page-hero"><p className="kicker">{kicker}</p><h1>{title}</h1><p className="lead">{text}</p></section>;
}

function About() {
  return <Layout><PageHero kicker="About 72° East" title={<>Global ambition.<br /><em>Practical execution.</em></>} text="We are an international business house focused on trading, distribution, and developing businesses in emerging economies." />
    <section className="image-statement section"><img src="/assets/photos/about.jpg" alt="Global logistics operations" /><div><p className="kicker">Who we serve</p><h2>Built for businesses ready to cross borders.</h2><p>We support brands and partners looking for dependable import-export execution, fast communication, and scalable operating support across the Middle East, Africa, and the Indian Subcontinent.</p></div></section>
    <section className="values section"><article><span>01</span><h3>Execution first</h3><p>Strategy matters, but follow-through is what moves goods and grows businesses.</p></article><article><span>02</span><h3>Clear communication</h3><p>Responsive, structured updates keep complex cross-border work understandable.</p></article><article><span>03</span><h3>Built to scale</h3><p>Flexible infrastructure supports brands from early market entry through wider expansion.</p></article></section>
    <section className="statement section"><p className="kicker">Our difference</p><h2>We simplify cross-border operations so our partners can focus on where they’re going next.</h2></section><Cta /></Layout>;
}

function ServiceDetail({ service }) {
  if (!service) return <Layout><PageHero kicker="Not found" title="That page does not exist." text="Return to our services to find what you need." /></Layout>;
  return <Layout><section className="detail-hero"><img src={service.image} alt="" /><div><p className="kicker">{service.eyebrow}</p><h1>{service.title}</h1><p className="lead">{service.summary}</p><Button href="/contact.html">Talk to our team</Button></div></section>
    <section className="detail-copy section"><div><p className="kicker">Service scope</p><h2>Handled with care, from start to finish.</h2></div><p className="large-copy">{service.detail}</p></section>
    {service.steps && <section className="process section">{service.steps.map((step, i) => <article key={step}><span>0{i + 1}</span><h3>{step}</h3></article>)}</section>}
    {service.gallery && <section className={`gallery section ${service.gallery.length === 1 ? "single" : ""}`}>{service.gallery.map((image, i) => <img src={image} alt={`${service.title} operations ${i + 1}`} key={image} />)}</section>}
    <Cta /></Layout>;
}

function Contact() {
  const [status, setStatus] = useState("");
  function submit(event) { event.preventDefault(); const form = new FormData(event.currentTarget); const name = form.get("name"); const email = form.get("email"); const message = form.get("message"); setStatus("Opening your email app…"); window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(`Website inquiry from ${name}`)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`; }
  return <Layout><PageHero kicker="Start a conversation" title={<>Let’s move your business <em>forward.</em></>} text="Tell us what you are sourcing, shipping, packing, or building. Our team will get back to you quickly." />
    <section className="contact-layout section"><div className="contact-details"><h2>Business contact</h2><div><span>Call</span><a href={contact.phoneHref}>{contact.phone}</a></div><div><span>Email</span><a href={`mailto:${contact.email}`}>{contact.email}</a></div><div><span>Visit</span><p>{contact.address}</p></div></div>
      <form onSubmit={submit}><label>Name<input name="name" required placeholder="Your full name" /></label><label>Email<input name="email" type="email" required placeholder="you@company.com" /></label><label>How can we help?<textarea name="message" required placeholder="Tell us about your requirements, destinations, and timeline." /></label><button className="button" type="submit">Send inquiry <Arrow /></button><p className="form-status" aria-live="polite">{status}</p></form></section>
  </Layout>;
}

function Cta() {
  return <section className="cta section"><div><p className="kicker">Let’s work together</p><h2>Ready to move?</h2></div><Button href="/contact.html">Start a conversation</Button></section>;
}

export default function App() {
  if (serviceSlug) return <ServiceDetail service={services.find((item) => item.slug === serviceSlug)} />;
  if (route === "about.html") return <About />;
  if (route === "services.html") return <Services />;
  if (route === "contact.html") return <Contact />;
  return <Home />;
}

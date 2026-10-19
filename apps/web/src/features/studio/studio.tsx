import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleHelp,
  Code2,
  Disc3,
  Folder,
  HardDrive,
  Layers3,
  Menu,
  Moon,
  Sun,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  BriefcaseBusiness,
} from "lucide-react";
import { products, type Product } from "./products";
import "./studio.css";

function Brand() {
  return (
    <a href="/" className="studio-brand" aria-label="SkyCanvas Studio home">
      <span className="brand-mark">
        <Layers3 size={24} strokeWidth={1.7} />
      </span>
      <span>
        skycanvas<span className="brand-studio">studio</span>
      </span>
    </a>
  );
}
function StudioThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = !mounted || resolvedTheme === "dark";
  return (
    <button
      type="button"
      className="studio-theme-toggle"
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function StudioLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="studio">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="studio-nav wrap">
        <Brand />
        <button
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          aria-label="Main navigation"
          className={open ? "nav-links is-open" : "nav-links"}
        >
          <a href="/#products" onClick={() => setOpen(false)}>
            Our software
          </a>
          <a href="/#about" onClick={() => setOpen(false)}>
            The studio
          </a>
          <a
            href="https://github.com/khalids01"
            target="_blank"
            rel="noreferrer"
          >
            GitHub <ArrowUpRight size={13} />
          </a>
        </nav>
        <div className="nav-actions">
          <StudioThemeToggle />
          <a className="nav-cta" href="/#products">
            Find your next tool <ArrowUpRight size={15} />
          </a>
        </div>
      </header>
      {children}
      <footer className="studio-footer wrap">
        <div className="footer-top">
          <div>
            <Brand />
            <p>Thoughtful software. A little more possibility.</p>
          </div>
          <div>
            <span className="eyebrow">THE TOOLBOX</span>
            {products.map((p) => (
              <Link key={p.slug} to="/products/$slug" params={{ slug: p.slug }}>
                {p.name} <ArrowUpRight size={12} />
              </Link>
            ))}
          </div>
          <div>
            <span className="eyebrow">ELSEWHERE</span>
            <a
              href="https://github.com/khalids01"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={12} />
            </a>
            <a href="mailto:khalidcode03@gmail.com">
              Get in touch <ArrowUpRight size={12} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SkyCanvas Studio</span>
          <span>
            Built with care. Always evolving.{" "}
            <span className="tiny-star">✳</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
function ProductIcon({ product }: { product: Product }) {
  return (
    <span className={`product-icon ${product.tone}`}>
      {product.slug === "disk-vacuum" ? (
        <Disc3 size={26} />
      ) : (
        <BriefcaseBusiness size={25} />
      )}
    </span>
  );
}
function WindowBar({ title }: { title: string }) {
  return (
    <div className="window-bar">
      <span className="window-dots">
        <i />
        <i />
        <i />
      </span>
      <span>{title}</span>
      <span>↗</span>
    </div>
  );
}
export function ProductPreview({ kind }: { kind: string }) {
  return kind === "disk-vacuum" ? (
    <div
      className="app-window disk-window"
      aria-label="Illustrative DiskVacuum storage view"
    >
      <WindowBar title="DiskVacuum" />
      <div className="disk-body">
        <aside>
          <span className="preview-label">WORKSPACE</span>
          <span className="sidebar-active">
            <HardDrive size={12} /> Overview
          </span>
          <span>
            <Folder size={12} /> All files
          </span>
          <span>
            <Layers3 size={12} /> Duplicates
          </span>
          <span>
            <Search size={12} /> Large files
          </span>
          <span className="sidebar-bottom">
            <ShieldCheck size={12} /> On your device
          </span>
        </aside>
        <div className="disk-main">
          <div className="preview-heading">
            A little breathing room.
            <Sparkles size={14} />
          </div>
          <div className="storage-line">
            <strong>
              128.4 <small>GB used</small>
            </strong>
            <span>256 GB total</span>
          </div>
          <div className="storage-meter">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="treemap">
            <div>
              Applications <b>48.2 GB</b>
            </div>
            <div>
              Documents <b>32.8 GB</b>
            </div>
            <div>
              Media <b>28.6 GB</b>
            </div>
            <div>
              Other <b>18.8 GB</b>
            </div>
          </div>
          <div className="preview-note">
            <span className="status-dot" /> Your files. Your control.
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div
      className="app-window job-window"
      aria-label="Illustrative Job Agent shortlist view"
    >
      <WindowBar title="Job Agent" />
      <div className="job-body">
        <div className="job-toolbar">
          <span className="job-avatar">K</span>
          <div>
            <strong>Your next chapter</strong>
            <span>A more intentional job search</span>
          </div>
          <span className="profile-pill">
            <Check size={10} /> Career profile
          </span>
        </div>
        <div className="job-tabs">
          <span>
            My shortlist <b>3</b>
          </span>
          <span>Career profile</span>
          <span>Applications</span>
        </div>
        {[
          {
            title: "Frontend Engineer",
            company: "Example company · Remote",
            tag: "Saved",
            color: "purple",
          },
          {
            title: "Product Engineer",
            company: "Example studio · Hybrid",
            tag: "Review",
            color: "orange",
          },
          {
            title: "Software Developer",
            company: "Example team · Remote",
            tag: "Saved",
            color: "green",
          },
        ].map((j, i) => (
          <div className="job-row" key={j.title}>
            <span className={`company-icon ${j.color}`}>
              {["a", "✳", "◈"][i]}
            </span>
            <div>
              <strong>{j.title}</strong>
              <span>{j.company}</span>
            </div>
            <span className="job-tag">{j.tag}</span>
            <ArrowUpRight size={13} />
          </div>
        ))}
        <div className="preview-note">
          <ShieldCheck size={12} /> Your next move stays yours.
        </div>
      </div>
    </div>
  );
}
export function StudioHome() {
  return (
    <StudioLayout>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="status-dot" /> INDEPENDENT SOFTWARE STUDIO
            </span>
            <h1>
              Small tools.
              <br />
              More <em>possibility.</em>
            </h1>
            <p>
              We build thoughtful software for the things you do every day. Less
              friction. More focus. A little room to do your best work.
            </p>
            <div className="hero-actions">
              <a className="button button-dark" href="#products">
                Explore our software <ArrowRight size={17} />
              </a>
              <a className="text-link" href="#about">
                Meet the studio <ArrowUpRight size={15} />
              </a>
            </div>
            <div className="hero-footnote">
              <span className="mini-icons">
                <Disc3 />
                <BriefcaseBusiness />
              </span>
              <span>One studio. A growing collection of useful things.</span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Illustration of a connected collection of software tools"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-star star-one">✳</span>
            <span className="art-star star-two">✧</span>
            <span className="orbit-dot" />
            <div className="floating-note note-top">
              <span className="status-dot" /> Made for your everyday.
            </div>
            <div className="art-tile tile-disk">
              <Disc3 strokeWidth={1.25} />
              <span>DiskVacuum</span>
              <ArrowUpRight size={16} />
            </div>
            <div className="art-tile tile-job">
              <BriefcaseBusiness strokeWidth={1.3} />
              <span>Job Agent</span>
              <ArrowUpRight size={16} />
            </div>
            <div className="art-tile tile-next">
              <span>✳</span>
              <small>What’s next?</small>
            </div>
            <div className="floating-note note-bottom">
              <span>↳</span> A bit less busy. A lot more useful.
            </div>
          </div>
        </section>
        <div className="values-strip">
          <div className="wrap">
            <span>
              <Layers3 size={16} /> Purpose-built, never overbuilt
            </span>
            <span>
              <ShieldCheck size={16} /> Respect for your data
            </span>
            <span>
              <Code2 size={16} /> Crafted with care
            </span>
          </div>
        </div>
        <section id="products" className="products-section wrap">
          <div className="section-heading">
            <div>
              <span className="eyebrow">THE GROWING TOOLBOX</span>
              <h2>
                Good software.
                <br />
                Real, everyday problems.
              </h2>
            </div>
            <p>
              Different tools, one shared idea: software should make your day
              feel a little lighter.
            </p>
          </div>
          <div className="product-grid">
            {products.map((product) => (
              <article className="product-card" key={product.slug}>
                <div className={`product-visual ${product.tone}`}>
                  <div className="visual-top">
                    <span className="product-category">{product.category}</span>
                    <span className="visual-number">
                      0{products.indexOf(product) + 1}
                    </span>
                  </div>
                  <ProductPreview kind={product.slug} />
                  <span className="illustration-caption">
                    ILLUSTRATIVE PRODUCT VIEW
                  </span>
                </div>
                <div className="product-content">
                  <div className="product-title">
                    <ProductIcon product={product} />
                    <h3>{product.name}</h3>
                    <span className={`status-badge ${product.tone}`}>
                      <span />
                      {product.status}
                    </span>
                  </div>
                  <p>{product.summary}</p>
                  <div className="product-card-bottom">
                    <Link to="/products/$slug" params={{ slug: product.slug }}>
                      Meet {product.name} <ArrowUpRight size={17} />
                    </Link>
                    <span>
                      {product.slug === "disk-vacuum"
                        ? "Desktop utility"
                        : "Desktop assistant"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="more-tools">
            <span className="more-symbol">✳</span>
            <div>
              <strong>There’s more on the canvas.</strong>
              <p>
                We’re always exploring what could make everyday work better.
              </p>
            </div>
            <a
              href="https://github.com/khalids01"
              target="_blank"
              rel="noreferrer"
            >
              Follow what we’re building <ArrowUpRight size={16} />
            </a>
          </div>
        </section>
        <section id="about" className="about-section wrap">
          <div className="about-intro">
            <span className="eyebrow">
              A SMALL STUDIO. A SIMPLE PHILOSOPHY.
            </span>
            <h2>
              Made to be useful.
              <br />
              <em>Built to feel human.</em>
            </h2>
            <p>
              SkyCanvas Studio is an independent software studio by Khalid. We
              turn the little frustrations of daily work into focused tools,
              each with a clear purpose and room to grow.
            </p>
            <a className="text-link" href="mailto:khalidcode03@gmail.com">
              Say hello <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="principles">
            {[
              {
                icon: Layers3,
                n: "01",
                title: "Do one thing thoughtfully.",
                text: "Focused tools that solve a real problem, without adding another layer of complexity.",
              },
              {
                icon: ShieldCheck,
                n: "02",
                title: "Keep you in control.",
                text: "Clear choices, honest data practices, and actions you can understand before you take them.",
              },
              {
                icon: Sparkles,
                n: "03",
                title: "Keep making it better.",
                text: "Software is a work in progress. We build, listen, and improve with care.",
              },
            ].map((v) => (
              <div className="principle" key={v.n}>
                <v.icon size={21} />
                <div>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
                <span>{v.n}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="faq-section wrap">
          <div>
            <span className="eyebrow">A FEW THINGS TO KNOW</span>
            <h2>Glad you asked.</h2>
            <CircleHelp size={36} strokeWidth={1} />
          </div>
          <div className="faqs">
            {[
              {
                q: "What is SkyCanvas Studio?",
                a: "An independent software studio and the shared home for our apps. You can explore every product, find release links, and follow development here.",
              },
              {
                q: "Are the apps ready to use?",
                a: "DiskVacuum is in early access, with Linux locally verified and other platforms in preview. Job Agent is in development. Each product page explains its current availability.",
              },
              {
                q: "Do I need an account or subscription?",
                a: "No account is needed to explore the studio or access the linked public releases. Shared accounts, subscriptions, and paid plans are not offered on this site yet.",
              },
              {
                q: "Where can I get help or share an idea?",
                a: "Use the GitHub issue links on each product page for bugs and requests, or the studio’s email link for a conversation.",
              },
            ].map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <span>+</span>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="closing wrap">
          <span className="eyebrow">A LITTLE LESS FRICTION STARTS HERE</span>
          <h2>
            Find a tool. Make some room.
            <br />
            <em>See what’s possible.</em>
          </h2>
          <a className="button button-dark" href="#products">
            Find your next tool <ArrowUpRight size={17} />
          </a>
          <span className="closing-star">✳</span>
          <ArrowDown className="closing-arrow" size={38} strokeWidth={1} />
        </section>
      </main>
    </StudioLayout>
  );
}
export function ProductPage({ product }: { product: Product }) {
  return (
    <StudioLayout>
      <main id="main" className="product-page wrap">
        <a className="back-link" href="/#products">
          ← All software
        </a>
        <section className="detail-hero">
          <div>
            <div className="detail-identity">
              <ProductIcon product={product} />
              <span>{product.name}</span>
              <span className={`status-badge ${product.tone}`}>
                {product.status}
              </span>
            </div>
            <h1>{product.headline}</h1>
            <p>{product.description}</p>
            <a
              className="button button-dark"
              href={product.href}
              target="_blank"
              rel="noreferrer"
            >
              {product.action}
              <ArrowUpRight size={17} />
            </a>
            <span className="availability">{product.availability}</span>
          </div>
          <div className={`detail-preview ${product.tone}`}>
            <ProductPreview kind={product.slug} />
            <span className="illustration-caption">
              ILLUSTRATIVE PRODUCT VIEW · SAMPLE DATA
            </span>
          </div>
        </section>
        <section className="detail-features">
          {product.features.map((f, i) => (
            <article key={f.title}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{f.title}</h2>
              <p>{f.text}</p>
            </article>
          ))}
        </section>
        <section className="detail-notes">
          <div>
            <ShieldCheck size={25} />
            <h2>Your data, explained.</h2>
            <p>{product.privacy}</p>
          </div>
          <div>
            <span className="eyebrow">CURRENT AVAILABILITY</span>
            <h2>A work in progress.</h2>
            <p>{product.note}</p>
            <a
              className="text-link"
              href={`${product.repository}/issues`}
              target="_blank"
              rel="noreferrer"
            >
              Report an issue <ArrowUpRight size={15} />
            </a>
            <a
              className="text-link"
              href={product.repository}
              target="_blank"
              rel="noreferrer"
            >
              <Code2 size={15} /> View source
            </a>
          </div>
        </section>
        <div className="detail-next">
          <span>Keep exploring the toolbox</span>
          {products
            .filter((p) => p.slug !== product.slug)
            .map((p) => (
              <Link key={p.slug} to="/products/$slug" params={{ slug: p.slug }}>
                {p.name} <ArrowRight size={20} />
              </Link>
            ))}
        </div>
      </main>
    </StudioLayout>
  );
}

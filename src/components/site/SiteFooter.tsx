export function SiteFooter() {
  return (
    <footer className="site-footer reference-footer">
      <div className="footer-signature">
        <p>Tona Coffee</p>
        <span>African-led specialty coffee · Addis Ababa, Ethiopia</span>
      </div>
      <nav className="footer-nav" aria-label="Footer navigation">
        <a href="/#story">About</a>
        <a href="/#coffee">Coffee</a>
        <a href="/#business">For business</a>
        <a href="/#contact">Contact</a>
        <a href="/#feedback">Feedback</a>
      </nav>
      <div className="footer-meta">
        <a href="mailto:info@tonacoffee.et">info@tonacoffee.et</a>
        <p>© {new Date().getFullYear()} Tona Coffee</p>
      </div>
    </footer>
  );
}

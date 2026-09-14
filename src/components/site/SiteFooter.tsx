export function SiteFooter() {
  return (
    <footer className="site-footer reference-footer">
      <div className="footer-signature">
        <p>Tona Coffee</p>
        <span>African-led specialty coffee · Addis Ababa, Ethiopia</span>
      </div>
      <div className="footer-meta">
        <a href="mailto:hello@tonacoffee.com">hello@tonacoffee.com</a>
        <p>© {new Date().getFullYear()} Tona Coffee</p>
      </div>
    </footer>
  );
}

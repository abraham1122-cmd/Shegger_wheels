


export default function Navbar() {
  return (
    <header className="site-header">
      <nav className="container navbar" aria-label="Main navigation">
        <a href="/" className="brand" aria-label="Good Journey home">
          <span className="brand-mark">Sw</span>
          <span className="brand-name">
            Shegger-Wheels
            <small>CAR SHARING, MADE LOCAL</small>
          </span>
        </a>
      
        <div className="nav-links">
            <a href="/home">Home</a>
          <a href="/cars">Find a car</a>
          <a href="/cars#how-it-works">How it works</a>
          <a href="/signup?role=owner">List your car</a>
        </div>

        <div className="nav-actions">
          <a href="/signin" className="signin-link">
            Sign in
          </a>
          <a href="/signup" className="button button-primary nav-cta">
            Get started <span>↗</span>
          </a>
        </div>

      </nav>
    </header>
  );
}



export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="/" className="brand brand-light">
            <span className="brand-mark">Sw</span>
            <span className="brand-name">
              good journey
              <small>CAR SHARING, MADE LOCAL</small>
            </span>
          </a>
          <p>
            Good cars. Local people.
            <br />
            A better way to get there.
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <a href="/cars">Find a car</a>
          <a href="/#how-it-works">How it works</a>
          <a href="/signUp?role=owner">Become a host</a>
        </div>

        <div>
          <h3>Your account</h3>
          
          <a href="/signin">SignIn</a>
          <a href="/signUp">signUp</a>
        </div>

        <div>
          <h3>Need a hand?</h3>
          <a href="/#faq">Frequently asked questions</a>
          <a href="sheggerwheels@gmail.com">Contact us</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 Shegger-Wheels.</span>
        <div>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  );
}

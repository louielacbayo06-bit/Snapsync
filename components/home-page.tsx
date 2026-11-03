import Link from 'next/link';
import { Icon, type IconName } from './icon';

const features: { icon: IconName; label: string }[] = [
  { icon: 'layout', label: 'Custom layouts' },
  { icon: 'sparkles', label: 'Pose ideas' },
  { icon: 'heart', label: 'Partner sync' },
  { icon: 'cloud', label: 'My gallery' },
];

export function HomePage({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link aria-label="Go to SnapSync home" className="brand" href="/">
          <span className="brand-mark">
            <Icon className="brand-icon" name="camera" />
          </span>
          <span>Snap<span className="brand-accent">Sync</span></span>
        </Link>
        <Link className="topbar-note" href="/gallery">
          <span className="topbar-note-dot" />
          My gallery
        </Link>
      </header>

      <main className="landing">
        <section aria-labelledby="hero-title" className="hero">
          <div className="eyebrow">
            <span className="eyebrow-sparkle"><Icon name="sparkles" /></span>
            Your moment. Perfectly in sync.
          </div>
          <h1 id="hero-title">
            Big smiles.
            <br />
            <span>Zero distance.</span>
          </h1>
          <p className="hero-copy">
            The feel-good photo booth for you and your favorite people — together
            in one frame, wherever you are.
          </p>

          <div aria-label="Choose your photo booth" className="mode-grid">
            <Link className="mode-card mode-card-solo" href="/booth">
              <div className="card-topline">
                <span className="card-kicker">JUST YOU</span>
                <span className="card-number">01</span>
              </div>
              <span className="card-icon card-icon-solo">
                <Icon name="camera" />
              </span>
              <h2>Solo Booth</h2>
              <p>Jump straight in and make some camera magic.</p>
              <span className="card-action">
                Start solo <Icon className="action-arrow" name="arrow" />
              </span>
            </Link>

            <Link className="mode-card mode-card-duo" href="/booth?mode=duo">
              <div className="card-topline">
                <span className="card-kicker">BETTER TOGETHER</span>
                <span className="card-number">02</span>
              </div>
              <span className="card-icon card-icon-duo">
                <Icon name="users" />
              </span>
              <h2>Duo Remote</h2>
              <p>Share a room code, see each other live, and capture photos together.</p>
              <span className="card-action">
                Create a room <Icon className="action-arrow" name="arrow" />
              </span>
            </Link>
          </div>
        </section>

        <section aria-label="SnapSync features" className="feature-row" id="features">
          {features.map(({ icon, label }) => (
            <div className="feature" key={label}>
              <span className="feature-icon"><Icon name={icon} /></span>
              <span>{label}</span>
            </div>
          ))}
        </section>
      </main>

      <footer className="page-footer">
        <span className="footer-message">
          <Icon name="heart" /> Little moments, a little closer.
        </span>
        <span
          aria-label={isConnected ? 'Supabase connected' : 'Database connection failed'}
          className={`connection-status ${isConnected ? 'is-connected' : 'is-disconnected'}`}
          title={isConnected ? 'Supabase connected' : 'Database connection failed'}
        >
          <span className="connection-dot" />
          {isConnected ? 'All systems ready' : 'Connection issue'}
        </span>
      </footer>
    </div>
  );
}

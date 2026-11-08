import { site } from '../content/site';

export function Header() {
  return (
    <>
      <a className="brand" href="/">
        {site.name}
      </a>
      <nav className="nav" aria-label="Primary">
        {site.nav.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
    </>
  );
}

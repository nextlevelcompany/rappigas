'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav({ setMobileToggle }) {
  const pathname = usePathname();

  const closeMobile = () => {
    if (setMobileToggle) setMobileToggle(false);
  };

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
    { name: 'Cobertura', href: '/cobertura' },
    { name: 'Fidelidad (Premios)', href: '/fidelidad' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <ul className="cs_nav_list fw-medium">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <li
            key={item.href}
            className={active ? 'active current-menu-item' : ''}
          >
            <Link
              href={item.href}
              onClick={closeMobile}
              style={{
                color: active ? '#FF5722' : undefined,
                fontWeight: active ? '700' : '500',
                transition: 'all 0.25s ease',
              }}
            >
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

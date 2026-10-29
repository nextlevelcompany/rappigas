'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav({ setMobileToggle }) {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState(false);

  const closeMobile = () => {
    if (setMobileToggle) setMobileToggle(false);
    setOpenSubmenu(false);
  };

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
    { name: 'Cobertura', href: '/cobertura' },
    {
      name: 'Premios',
      href: '/premios',
      subItems: [
        { name: 'Premios', href: '/premios' },
        { name: 'Catálogo', href: '/premios/catalogo' },
      ],
    },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
  ];

  const isActive = (item) => {
    if (item.href === '/') return pathname === '/';
    if (pathname === item.href) return true;
    if (item.subItems?.some((sub) => pathname === sub.href)) return true;
    return pathname.startsWith(item.href);
  };

  return (
    <ul className="cs_nav_list fw-medium">
      {navItems.map((item) => {
        const active = isActive(item);
        const hasChildren = Boolean(item.subItems?.length);

        if (hasChildren) {
          return (
            <li
              key={item.href}
              className={`menu-item-has-children ${active ? 'active current-menu-item' : ''}`}
            >
              <Link
                href={item.href}
                onClick={closeMobile}
                style={{
                  color: active ? '#FF5722' : '#1E293B',
                  fontWeight: active ? '700' : '500',
                  transition: 'all 0.25s ease',
                }}
              >
                {item.name}
              </Link>
              <span
                className={`cs-munu_dropdown_toggle ${openSubmenu ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenSubmenu(!openSubmenu);
                }}
              />
              <ul className={openSubmenu ? 'd-block' : ''}>
                {item.subItems.map((sub) => {
                  const subActive = pathname === sub.href;
                  return (
                    <li key={sub.href}>
                      <Link
                        href={sub.href}
                        onClick={closeMobile}
                        style={{
                          color: subActive ? '#FF5722' : '#1E293B',
                          fontWeight: subActive ? '700' : '500',
                          padding: '10px 20px',
                          display: 'block',
                        }}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        }

        return (
          <li
            key={item.href}
            className={active ? 'active current-menu-item' : ''}
          >
            <Link
              href={item.href}
              onClick={closeMobile}
              style={{
                color: active ? '#FF5722' : '#1E293B',
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

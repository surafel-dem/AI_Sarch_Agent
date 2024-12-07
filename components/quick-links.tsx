'use client';

import { ArrowUpRight } from 'lucide-react';

const quickLinks = [
  {
    title: "Used Cars",
    href: "/search?type=used",
  },
  {
    title: "New Cars",
    href: "/search?type=new",
  },
  {
    title: "Electric Vehicles",
    href: "/search?type=electric",
  },
  {
    title: "Popular Deals",
    href: "/search?sort=popular",
  },
];

export function QuickLinks() {
  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto px-4">
      {quickLinks.map((link) => (
        <a
          key={link.title}
          href={link.href}
          className="group flex items-center gap-1 px-2.5 py-0.5 bg-purple-100/5 hover:bg-purple-100/10 rounded-full backdrop-blur-sm border border-purple-100/20 transition-all"
        >
          <span className="text-slate-700 text-xs font-medium">{link.title}</span>
          <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      ))}
    </div>
  );
}

import { QuickLinks } from '@/components/quick-links';

export default function Home() {
  return (
	<main>
	  <div className="py-8">
		<QuickLinks />
	  </div>
	  {/* Rest of your home page content */}
	</main>
  );
}
export interface Project {
  name: string;
  href: string;
  blurb: string;
}

export const featured: Project[] = [
  {
    name: 'horizon-engine',
    href: 'https://github.com/jackthepunished/horizon-engine',
    blurb: "A C++20 game engine I'm building ground-up — Vulkan deferred renderer, ECS, the whole pipeline. The one closest to where I'm headed.",
  },
  {
    name: 'brokkr',
    href: 'https://github.com/jackthepunished/brokkr',
    blurb: 'A distributed build & compute grid in Rust, speaking REAPI v2 — my deep end at making a pile of machines behave like one.',
  },
  {
    name: 'void',
    href: 'https://github.com/jackthepunished/void',
    blurb: 'A graph-based, infinitely zoomable knowledge OS in Rust — what if your notes never hit a wall?',
  },
];

export const more: Project[] = [
  {
    name: 'pelage-furr',
    href: 'https://github.com/jackthepunished/pelage-furr',
    blurb: 'real-time D3D12 fur renderer with shell layers — graphics math that ends up looking soft',
  },
  {
    name: 'VirtualNestVM',
    href: 'https://github.com/jackthepunished/VirtualNestVM',
    blurb: 'a 16-bit virtual CPU in C, built from nothing to see how silicon really thinks',
  },
  {
    name: 'webserver-project',
    href: 'https://github.com/jackthepunished/webserver-project',
    blurb: 'a tiny TCP/HTTP server in C — sockets all the way down, no frameworks',
  },
  {
    name: 'option-converge',
    href: 'https://github.com/jackthepunished/option-converge',
    blurb: 'a C++ option-pricing & convergence toolkit where numerical methods meet finance',
  },
];

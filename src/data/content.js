// ─────────────────────────────────────────────────────────────
// BLACKSITE content file.
// Everything personal lives here. Edit this file to change the
// name, the copy, the contact links, and the project archive.
// Leave a value as null to keep its "pending" state on the page.
// ─────────────────────────────────────────────────────────────

export const identity = {
  // Main name, shown large in the hero and in the top bar.
  name: 'Bader Alsaqr',
  // Arabic name, shown in the identity section and the footer.
  nameAr: 'بدر الصقر',
  label: 'Creative technologist / digital explorer',
  // Portraits live in public/portrait/ (hero-*.{avif,webp,jpg}, about-*.{avif,webp,jpg}).
  // Replace those files with new photos of the same names and sizes to update them.
  // Plain-words location for the clock panel. null hides the line.
  location: null,
};

export const profile = {
  summary:
    'A technology-focused creative. I spend my time building for the web, testing interaction ideas, and learning the tools that shape how people use screens.',
  interests: [
    { key: 'WEB_DEVELOPMENT', note: 'Building sites and small tools that load fast and hold up on any screen.' },
    { key: 'INTERACTIVE_DESIGN', note: 'Interfaces that respond to the person using them, with motion that explains.' },
    { key: 'ARTIFICIAL_INTELLIGENCE', note: 'How AI tools change the way things get made, and where they fall short.' },
    { key: '3D_EXPERIENCES', note: 'Real-time graphics in the browser: geometry, light, shaders.' },
    { key: 'DIGITAL_TOOLS', note: 'Trying new software early and keeping what earns a place in the workflow.' },
  ],
  direction:
    'Interfaces that feel engineered instead of decorated. Every effect should carry information or set a mood on purpose.',
};

// Contact channels. null = not configured yet (shown as PENDING, never a dead link).
export const contact = {
  email: null, // 'you@example.com'
  channels: [
    { label: 'GITHUB', url: 'https://github.com/Spaceneverever', handle: '@Spaceneverever' },
    { label: 'LINKEDIN', url: null, handle: null },
    { label: 'X / TWITTER', url: null, handle: null },
  ],
};

// Project archive.
// status: 'LIVE_ON_SITE' (it runs on this page), 'PLACEHOLDER' (reserved slot, not real work yet),
//         or 'PUBLISHED' (a finished, real project with a url).
export const projects = [
  {
    id: 'OP-001',
    title: 'BLACKSITE',
    category: 'WEB_ARCHITECTURE',
    stack: ['Vite', 'Vanilla JS', 'GSAP', 'Three.js', 'CSS'],
    status: 'LIVE_ON_SITE',
    summary: 'This portfolio. A personal system interface with a boot sequence, a live 3D core, and a local terminal.',
    brief:
      'Build a personal site that feels like opening a private machine, while staying fast, readable, and usable with a keyboard or with motion turned off.',
    notes: [
      'One content file drives the name, copy, links, and this archive.',
      'Heavy 3D code loads after first paint, with a fallback when WebGL is missing.',
      'Reduced motion skips the boot and pins every animation to its final state.',
    ],
    link: { label: 'YOU ARE INSIDE IT', href: '#top' },
    visual: 'grid',
    size: 'xl',
  },
  {
    id: 'OP-002',
    title: 'CORE_SHADER',
    category: '3D_LAB',
    stack: ['Three.js', 'GLSL', 'GSAP ScrollTrigger'],
    status: 'LIVE_ON_SITE',
    summary: 'The object in the hero. A noise-displaced sphere with a wire shell, a point cloud, and scroll-driven states.',
    brief: 'Make one digital object that reacts to the pointer and changes behavior as the page scrolls.',
    notes: [
      'Vertex shader displaces an icosphere with 3D simplex noise.',
      'Fresnel rim light gives the surface a metal edge without textures.',
      'Scroll progress drives distortion, scale, and the shell rotation.',
    ],
    link: { label: 'VIEW THE CORE', href: '#top' },
    visual: 'sphere',
    size: 'md',
  },
  {
    id: 'OP-003',
    title: 'SIGNAL_FIELD',
    category: 'VISUAL_SYSTEMS',
    stack: ['Canvas 2D', 'Flow fields'],
    status: 'LIVE_ON_SITE',
    summary: 'A particle field that follows a moving vector field. Three dials change its frequency, drift, and color.',
    brief: 'A small visual instrument you can play with in the lab.',
    notes: [
      'Particles trace a noise-based vector field and leave fading trails.',
      'Dials are native range inputs, so they work with the keyboard.',
      'Pauses itself when scrolled out of view.',
    ],
    link: { label: 'OPEN IN THE LAB', href: '#lab' },
    visual: 'flow',
    size: 'md',
  },
  {
    id: 'OP-004',
    title: 'SHELL_SIM',
    category: 'INTERACTIVE_EXPERIMENTS',
    stack: ['Vanilla JS'],
    status: 'LIVE_ON_SITE',
    summary: 'A simulated terminal with a short list of commands. It runs in the page and touches nothing outside it.',
    brief: 'Let visitors move around the site by typing, the way they would on a real machine.',
    notes: [
      'Commands are a fixed list in a JavaScript object. Nothing is executed.',
      'Arrow keys recall history. Tab completes commands.',
      'Can open archive entries and jump to sections.',
    ],
    link: { label: 'OPEN IN THE LAB', href: '#lab' },
    visual: 'term',
    size: 'sm',
  },
  {
    id: 'OP-005',
    title: 'RESERVED SLOT',
    category: 'AI_WORKFLOWS',
    stack: ['To be decided'],
    status: 'PLACEHOLDER',
    summary: 'An open slot for a future AI workflow project. Nothing has been built here yet.',
    brief: 'Reserved. Replace this entry in src/data/content.js when a real project is ready.',
    notes: ['No public build yet.'],
    link: null,
    visual: 'empty',
    size: 'sm',
  },
  {
    id: 'OP-006',
    title: 'RESERVED SLOT',
    category: 'INTERACTIVE_EXPERIMENTS',
    stack: ['To be decided'],
    status: 'PLACEHOLDER',
    summary: 'An open slot for the next experiment. Nothing has been built here yet.',
    brief: 'Reserved. Replace this entry in src/data/content.js when a real project is ready.',
    notes: ['No public build yet.'],
    link: null,
    visual: 'empty',
    size: 'sm',
  },
];

// Skills. "using" lists only what shows up in my own code (my repositories and this site).
// "exploring" is for things I'm learning or want to learn, kept visibly separate.
// No levels, percentages, or ratings on purpose.
export const skills = {
  groups: [
    { name: 'Web development', using: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Vite', 'Tailwind CSS'], exploring: ['Next.js'] },
    { name: 'Creative development', using: ['Three.js', 'WebGL / GLSL', 'GSAP', 'Framer Motion', 'Canvas 2D'], exploring: ['React Three Fiber'] },
    { name: 'Backend & data', using: ['Node.js', 'Express', 'PostgreSQL', 'Drizzle ORM', 'Supabase'], exploring: [] },
    { name: 'UI & interaction', using: ['Interface design', 'Interaction design', 'Responsive design'], exploring: ['Visual systems'] },
    { name: 'AI & automation', using: ['AI API integration', 'AI-assisted development'], exploring: ['Workflow automation'] },
    { name: 'Tools & workflow', using: ['Git', 'GitHub', 'ESLint'], exploring: ['Figma'] },
  ],
};

// Topics. My repositories don't carry GitHub topic tags yet, so this is a
// hand-kept interest map, not a ranking. Edit freely.
// explore: true marks a topic I'm interested in but haven't built with yet.
export const topics = [
  { tag: 'javascript' },
  { tag: 'typescript' },
  { tag: 'react' },
  { tag: 'vite' },
  { tag: 'tailwindcss' },
  { tag: 'nodejs' },
  { tag: 'postgresql' },
  { tag: 'supabase' },
  { tag: 'threejs' },
  { tag: 'webgl' },
  { tag: 'gsap' },
  { tag: 'framer-motion' },
  { tag: 'creative-coding' },
  { tag: 'ai-tools' },
  { tag: 'ui-design' },
  { tag: 'web-development' },
  { tag: 'nextjs', explore: true },
  { tag: 'generative-art', explore: true },
  { tag: 'automation', explore: true },
  { tag: 'open-source', explore: true },
];

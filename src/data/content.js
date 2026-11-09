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
  // The About portrait lives in public/portrait/ (about-*.{avif,webp,jpg}).
  // Replace those files with new photos of the same names and sizes to update them.
  // Plain-words location for the clock panel. null hides the line.
  location: null,
};

export const profile = {
  // The large opening line of the About section.
  summary:
    'I build where software, AI and design meet, and I care about the details that make technology feel effortless.',
  // The longer story under it. One string per paragraph. Facts only: edit freely.
  story: [
    'My work sits across information technology and artificial intelligence. I specialise in developing hospital and healthcare systems, and in 2025 I delivered the AI-supported system for Doha Clinic. Alongside that I build full-stack web applications and AI-powered interfaces: I have built an AI chat dashboard that talks to large language models, a management system on TypeScript, Express and PostgreSQL, and React apps backed by Supabase. This site, with its real-time 3D core, is one of them.',
    'Much of my time goes into how AI is changing the craft itself: agents that plan and use tools, open multimodal models, and AI-assisted development. I test these tools in my own workflow and keep only what holds up.',
    'Security comes with the territory. As AI systems gain access to data and tools, I follow how teams audit them, protect them, and keep people in control. That is the standard I hold my own work to.',
  ],
  // Awards and milestones, in my own words. Newest first.
  recognition: [
    { year: '2025', title: 'Doha Clinic', detail: 'Hospital systems development specialist. Delivered the Doha Clinic system, supported by AI.' },
    { year: '2024', title: 'IT Consultant Award', detail: 'University of Toronto, for technical consulting skills.' },
    { year: '2018', title: 'First place, speed writing', detail: 'Accredited by Harvard University.' },
  ],
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
  email: 'bader9292a@gmail.com',
  // Extra links shown under the email. Left empty on purpose: email is the one way in.
  channels: [],
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
// size sets how much room a group gets on the page: 'lg', 'md' or 'sm'.
export const skills = {
  groups: [
    { name: 'Web development', size: 'lg', using: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Vite', 'Tailwind CSS'], exploring: ['Next.js'] },
    { name: 'Creative development', size: 'lg', using: ['Three.js', 'WebGL / GLSL', 'GSAP', 'Framer Motion', 'Canvas 2D'], exploring: ['React Three Fiber'] },
    { name: 'Backend & data', size: 'md', using: ['Node.js', 'Express', 'PostgreSQL', 'Drizzle ORM', 'Supabase'], exploring: [] },
    { name: 'AI & automation', size: 'md', using: ['AI API integration', 'AI-assisted development'], exploring: ['Workflow automation'] },
    { name: 'UI & interaction', size: 'sm', using: ['Interface design', 'Interaction design', 'Responsive design'], exploring: ['Visual systems'] },
    { name: 'Tools & workflow', size: 'sm', using: ['Git', 'GitHub', 'ESLint'], exploring: ['Figma'] },
  ],
};

// Top GitHub topics: themes I follow and learn from. These are other people's
// open-source projects, not my own work. Descriptions are paraphrased from each
// repository's README. Tags link to the repository they come from; a tag with
// no url stays plain text.
export const topics = {
  themes: [
    {
      name: 'AI agents & autonomous systems',
      label: 'agents',
      repo: 'openclaw/openclaw',
      url: 'https://github.com/openclaw/openclaw',
      about: 'An open-source AI assistant that runs on your own devices and works inside the chat apps you already use, with swappable models and agent harnesses.',
      tags: ['ai-agents', 'autonomous-systems'],
    },
    {
      name: 'Multimodal AI & open models',
      label: 'multimodal',
      repo: 'QwenLM/Qwen2.5-Omni',
      url: 'https://github.com/QwenLM/Qwen2.5-Omni',
      about: 'An end-to-end multimodal model from the Qwen team that takes text, images, audio and video, and answers in text or natural speech.',
      tags: ['multimodal-ai', 'open-source-models'],
    },
    {
      name: 'Developer tools & AI workflows',
      label: 'dev tools',
      repo: 'lbjlaq/Antigravity-Manager',
      url: 'https://github.com/lbjlaq/Antigravity-Manager',
      about: 'A desktop app (Tauri, Rust, React) for managing AI service accounts and translating requests between different provider APIs.',
      tags: ['developer-tools', 'ai-workflows'],
    },
    {
      name: 'Application security & audit automation',
      label: 'appsec',
      repo: 'cloudflare/security-audit-skill',
      url: 'https://github.com/cloudflare/security-audit-skill',
      about: "A coding-agent skill from Cloudflare that runs a staged security audit: reconnaissance, hunting, independent validation and verified reporting.",
      tags: ['security-auditing', 'application-security', 'automation'],
    },
  ],
  // Shared across every theme above, so not tied to one repository.
  shared: ['open-source'],
};

// Reading list: articles and papers worth your time. Every link was checked when added.
// note is my own one-line reason to read it.
export const reading = [
  {
    title: 'Building effective agents',
    source: 'Anthropic',
    year: '2024',
    topic: 'Agents',
    url: 'https://www.anthropic.com/research/building-effective-agents',
    note: 'The clearest case for simple, composable agent patterns over heavy frameworks.',
  },
  {
    title: 'LLM Powered Autonomous Agents',
    source: "Lilian Weng · Lil'Log",
    year: '2023',
    topic: 'Agents',
    url: 'https://lilianweng.github.io/posts/2023-06-23-agent/',
    note: 'The map everyone still uses: planning, memory and tool use, explained end to end.',
  },
  {
    title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
    source: 'Yao et al. · arXiv',
    year: '2022',
    topic: 'Research',
    url: 'https://arxiv.org/abs/2210.03629',
    note: 'The paper behind the think, act, observe loop inside most modern agents.',
  },
  {
    title: 'Effective context engineering for AI agents',
    source: 'Anthropic',
    year: '2025',
    topic: 'Agents',
    url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
    note: 'Why what you put in front of a model matters as much as the model itself.',
  },
  {
    title: 'The lethal trifecta for AI agents',
    source: 'Simon Willison',
    year: '2025',
    topic: 'Security',
    url: 'https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/',
    note: 'Private data, untrusted content and outside access: the combination to never ship.',
  },
  {
    title: 'Build your own vulnerability harness',
    source: 'Cloudflare Blog',
    year: '2026',
    topic: 'Security',
    url: 'https://blog.cloudflare.com/build-your-own-vulnerability-harness',
    note: 'How AI agents find, verify and triage real vulnerabilities at scale.',
  },
  {
    title: 'Qwen2.5-Omni: See, Hear, Talk, Write, Do It All',
    source: 'Qwen Team',
    year: '2025',
    topic: 'Multimodal',
    url: 'https://qwenlm.github.io/blog/qwen2.5-omni/',
    note: 'One open model that takes text, images, audio and video, and answers in speech.',
  },
  {
    title: 'What is the Model Context Protocol?',
    source: 'Model Context Protocol',
    year: null,
    topic: 'Tools',
    url: 'https://modelcontextprotocol.io/introduction',
    note: 'The open standard that lets AI apps plug into tools and data, like USB-C for AI.',
  },
  {
    title: 'The Illustrated Transformer',
    source: 'Jay Alammar',
    year: '2018',
    topic: 'Foundations',
    url: 'https://jalammar.github.io/illustrated-transformer/',
    note: 'The visual explanation of attention that made transformers click for a generation.',
  },
  {
    title: 'Best practices for Claude Code',
    source: 'Anthropic',
    year: null,
    topic: 'Workflow',
    url: 'https://www.anthropic.com/engineering/claude-code-best-practices',
    note: 'Practical habits for working with an AI coding agent day to day.',
  },
];

// Library: books and governance documents worth keeping on the shelf.
// url: null keeps a book on the shelf without a link (no checked page for it yet).
export const library = [
  {
    name: 'Artificial intelligence',
    books: [
      { title: 'Human Compatible', author: 'Stuart Russell', year: '2019', url: 'https://en.wikipedia.org/wiki/Human_Compatible', note: 'How to build AI that stays on our side, by design.' },
      { title: 'The Alignment Problem', author: 'Brian Christian', year: '2020', url: 'https://en.wikipedia.org/wiki/The_Alignment_Problem', note: 'Why teaching machines our values is harder than it looks.' },
      { title: 'Life 3.0', author: 'Max Tegmark', year: '2017', url: 'https://en.wikipedia.org/wiki/Life_3.0', note: 'The big questions once intelligence is no longer only human.' },
      { title: 'Deep Learning', author: 'Goodfellow, Bengio & Courville', year: '2016', url: 'https://www.deeplearningbook.org/', note: 'The foundations of modern AI, free to read online.' },
      { title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', year: '2020', url: 'https://aima.cs.berkeley.edu/', note: 'The standard textbook of the field, now in its fourth edition.' },
    ],
  },
  {
    name: 'Governance & ethics',
    books: [
      { title: 'The Age of AI', author: 'Kissinger, Schmidt & Huttenlocher', year: '2021', url: null, note: 'What AI means for knowledge, power and the people who govern.' },
      { title: 'The Coming Wave', author: 'Mustafa Suleyman', year: '2023', url: 'https://en.wikipedia.org/wiki/Mustafa_Suleyman', note: 'A builder of AI on why powerful technology must be contained.' },
      { title: 'Atlas of AI', author: 'Kate Crawford', year: '2021', url: 'https://en.wikipedia.org/wiki/Atlas_of_AI', note: 'The hidden costs behind AI: data, labour and the planet.' },
      { title: 'Weapons of Math Destruction', author: "Cathy O'Neil", year: '2016', url: 'https://en.wikipedia.org/wiki/Weapons_of_Math_Destruction', note: 'How unchecked algorithms can deepen inequality.' },
      { title: 'AI Ethics Principles', author: 'SDAIA · Saudi Arabia', year: null, url: 'https://sdaia.gov.sa/', note: "Saudi Arabia's national principles for responsible AI.", doc: true },
      { title: 'AI Risk Management Framework', author: 'NIST', year: '2023', url: 'https://www.nist.gov/itl/ai-risk-management-framework', note: 'A practical framework for finding and managing AI risk.', doc: true },
      { title: 'EU Artificial Intelligence Act', author: 'European Union', year: '2024', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', note: 'The first broad law that regulates AI by level of risk.', doc: true },
      { title: 'OECD AI Principles', author: 'OECD', year: '2019', url: 'https://oecd.ai/en/ai-principles', note: 'The first intergovernmental standard for trustworthy AI.', doc: true },
    ],
  },
];

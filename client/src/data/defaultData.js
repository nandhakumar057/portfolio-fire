/**
 * Fallback content shown when the API is unreachable.
 * Mirrors server/src/config/seedData.js — keep the two in sync.
 */

const projects = [
  {
    title: 'Food Delivery App Redesign',
    description:
      'Redesigned a food delivery app with a focus on usability — built mobile UI screens in Figma, simplified the checkout flow to cut user journey steps, and shipped a high-fidelity interactive prototype.',
    category: 'UI/UX Design',
    status: 'Completed',
    duration: '2024',
    image: '',
    icon: 'layout',
    gradient: 'neutral',
    technologies: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    features: [
      'Designed user-friendly mobile UI screens in Figma',
      'Improved the checkout flow and reduced user journey steps',
      'Created a high-fidelity prototype with transitions',
    ],
    screenshots: [],
    github: '',
    demo: '',
    documentation: '',
    featured: true,
  },
  {
    title: 'Personal Portfolio Website',
    description:
      'Built this portfolio with HTML and CSS after completing a certified bootcamp — showcases UI/UX design case studies and coding skills with responsive layouts for desktop and mobile.',
    category: 'Web Development',
    status: 'Completed',
    duration: '2025',
    image: '',
    icon: 'rocket',
    gradient: 'neutral',
    technologies: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
    features: [
      'Built with HTML and CSS after a certified bootcamp',
      'Showcases UI/UX design case studies and coding skills',
      'Responsive layouts for desktop and mobile',
    ],
    screenshots: [],
    github: '',
    demo: '',
    documentation: '',
    featured: true,
  },
];

const certifications = [
  {
    title: 'HTML & CSS Bootcamp',
    issuer: 'LetsUpgrade',
    date: 'Aug 2025',
    credentialurl: '',
    icon: 'code',
    category: 'Web Development',
  },
  {
    title: 'Figma Design Challenge',
    issuer: 'Completed',
    date: '2024',
    credentialurl: '',
    icon: 'sparkles',
    category: 'Design',
  },
  {
    title: 'College Hackathon Participant',
    issuer: 'College Event',
    date: '2025',
    credentialurl: '',
    icon: 'award',
    category: 'Hackathon',
  },
];

const skills = [
  { name: 'Figma', category: 'Design Tools', level: 88, icon: 'palette' },
  { name: 'Adobe XD', category: 'Design Tools', level: 80, icon: 'layout' },
  { name: 'Photoshop', category: 'Design Tools', level: 76, icon: 'palette' },
  { name: 'Illustrator', category: 'Design Tools', level: 72, icon: 'pen' },
  { name: 'User Flows', category: 'Prototyping & Wireframing', level: 85, icon: 'route' },
  { name: 'Wireframes', category: 'Prototyping & Wireframing', level: 86, icon: 'layout' },
  { name: 'Interactive Prototypes', category: 'Prototyping & Wireframing', level: 82, icon: 'sparkles' },
  { name: 'HTML', category: 'Web Technologies', level: 92, icon: 'code' },
  { name: 'CSS', category: 'Web Technologies', level: 88, icon: 'palette' },
  { name: 'JavaScript', category: 'Web Technologies', level: 70, icon: 'braces' },
  { name: 'Usability Testing', category: 'Research', level: 80, icon: 'message' },
  { name: 'Persona Creation', category: 'Research', level: 84, icon: 'brain' },
  { name: 'User Interviews', category: 'Research', level: 82, icon: 'message' },
  { name: 'Collaboration', category: 'Soft Skills', level: 92, icon: 'zap' },
  { name: 'Creativity', category: 'Soft Skills', level: 94, icon: 'sparkles' },
  { name: 'Problem-Solving', category: 'Soft Skills', level: 88, icon: 'brain' },
];

const achievements = [
  {
    title: 'College Hackathon Participant',
    description: 'Participated in a college-level hackathon, collaborating with a team to build and present a working prototype.',
    date: '2025',
    category: 'Hackathon',
    icon: 'trophy',
  },
  {
    title: 'Poster & Banner Design',
    description: 'Designed posters and digital banners for college events and cultural programmes.',
    date: '2024 - 2025',
    category: 'Creative',
    icon: 'presentation',
  },
  {
    title: 'Tech & Design Clubs',
    description: 'Active participant in technical and design clubs, contributing to events and design activities.',
    date: '2024 - present',
    category: 'Club',
    icon: 'users',
  },
  {
    title: 'Creative Volunteering',
    description: 'Volunteered in creative and cultural activities across campus events.',
    date: '2024 - present',
    category: 'Volunteering',
    icon: 'medal',
  },
];

const blog_posts = [
  {
    title: 'My Journey into UI/UX Design',
    slug: 'my-journey-into-ui-ux-design',
    excerpt:
      'How a Computer Science student fell in love with design — from first wireframes in Figma to building interactive prototypes and running usability tests.',
    content:
      "Design was never on my radar when I started engineering. I loved building things, but the way an interface feels — the flow, the spacing, the micro-interactions — is what kept me coming back.\n\nMy first steps\n\nIt started with Figma. I opened a canvas, dragged a few rectangles and fell into a rabbit hole. From there I learned the fundamentals: typography, colour, hierarchy, and layout grids.\n\nLearning by redesigning\n\nThe fastest way I improved was redesigning apps I used every day. I would pick one flow, map it out, spot the friction and rebuild it. That is exactly how my food delivery app redesign project began.\n\nWhere it is going\n\nToday I pair design thinking with real code — HTML, CSS and JavaScript — so I can take a concept from wireframe to working interface. That combination is what I want to build my career on.",
    category: 'Design',
    tags: ['UI/UX', 'Figma', 'Design', 'Learning'],
    cover: '',
    author: 'Nandhakumar Thirunavukkarasu',
    featured: true,
    status: 'published',
    views: 0,
  },
  {
    title: 'Redesigning a Food Delivery App',
    slug: 'redesigning-a-food-delivery-app',
    excerpt:
      'A case study of my food delivery app redesign — how I mapped the user journey, simplified the checkout flow and prototyped the new screens.',
    content:
      "Every redesign starts with a problem. For the food delivery app I chose, the problem was a checkout flow with too many steps and a user journey that lost people along the way.\n\nMapping the journey\n\nI started by mapping the current user flow, identifying where users dropped off. The checkout asked for too much information too early.\n\nThe redesign\n\nI redesigned the mobile UI screens in Figma with a cleaner visual hierarchy, consolidated the checkout into fewer steps and introduced clearer progress feedback.\n\nThe prototype\n\nThe final deliverable was a high-fidelity interactive prototype with transitions, tested with a few peers to validate the flow. The lesson: small interface changes can have an outsized effect on the user journey.",
    category: 'Design',
    tags: ['UI/UX', 'Figma', 'Prototyping', 'Case Study'],
    cover: '',
    author: 'Nandhakumar Thirunavukkarasu',
    featured: false,
    status: 'published',
    views: 0,
  },
  {
    title: 'Learning HTML & CSS with LetsUpgrade',
    slug: 'learning-html-css-with-letsupgrade',
    excerpt:
      'The HTML & CSS Bootcamp with LetsUpgrade taught me to build responsive layouts from scratch — here is what the experience was like.',
    content:
      "Before the LetsUpgrade HTML & CSS Bootcamp, I knew what good design looked like but not how to build it. The bootcamp closed that gap.\n\nStructured learning\n\nThe bootcamp took me from the absolute basics of markup to responsive layouts, semantic HTML and modern CSS techniques — all through hands-on projects.\n\nBuilding real things\n\nThe projects were the best part. Building pages from scratch made the concepts stick, and by the end I could turn a design into a working responsive page.\n\nNext steps\n\nThat foundation is what this very portfolio website is built on. HTML and CSS remain my most comfortable tools, and they are the starting point for everything else I am learning.",
    category: 'Web Development',
    tags: ['HTML', 'CSS', 'Bootcamp', 'Learning'],
    cover: '',
    author: 'Nandhakumar Thirunavukkarasu',
    featured: false,
    status: 'published',
    views: 0,
  },
];

const profile = {
  name: 'Nandhakumar Thirunavukkarasu',
  role: 'Computer Science Engineering Student',
  roles: ['UI/UX Designer', 'Web Developer', 'CSE Student'],
  tagline: 'Designing engaging user experiences and building responsive web solutions.',
  about:
    'Motivated and creative B.E. Computer Science and Engineering student with a strong interest in UI/UX design and web development. Skilled in HTML, CSS and design tools, I love turning ideas into clean, usable interfaces.',
  location: 'Arakkonam, Tamil Nadu, India',
  email: 'nandha.t2006@gmail.com',
  photo: '/profile.jpg',
  resumeUrl: '/resume.pdf',
  socials: {
    github: 'https://github.com/nandhakumar057',
    linkedin: 'https://www.linkedin.com/in/nandhakumar-t',
    instagram: '',
    email: 'mailto:nandha.t2006@gmail.com',
    phone: 'tel:+917550125448',
  },
  stats: { projects: 2, certifications: 3, technologies: 16, hackathons: 1 },
  education: [
    {
      degree: 'B.E. — Computer Science and Engineering',
      institution: 'Anna University · GRT Institute of Engineering and Technology',
      years: '2024 – 2028',
      description:
        'Pursuing a B.E. in Computer Science and Engineering with a strong focus on UI/UX design, web development and building real-world projects.',
    },
  ],
  goals:
    'To secure a UI/UX design or web development internship where I can apply design thinking and prototyping skills to real products, grow as a designer-developer and gain valuable industry exposure.',
  careerObjective:
    'Seeking a UI/UX internship to apply design thinking and prototyping skills in building engaging user experiences, while continuously improving my web development abilities and gaining industry exposure.',
  whyHireMe: [
    {
      title: 'Design Thinking',
      description:
        "I approach every problem from the user's perspective — mapping journeys, spotting friction and designing solutions that feel effortless.",
    },
    {
      title: 'Design + Code',
      description:
        'I design in Figma and build with HTML, CSS and JavaScript, so I can take a concept from wireframe to working interface.',
    },
    {
      title: 'User Research',
      description:
        'I run usability tests, create personas and interview users to make decisions based on evidence, not guesswork.',
    },
    {
      title: 'Quick Learning',
      description:
        'From bootcamps to design challenges, I pick up new tools and workflows fast — and I love doing it.',
    },
    {
      title: 'Creativity & Collaboration',
      description:
        'I bring creativity to teams, design club activities and college events, and I collaborate well with others.',
    },
  ],
  interests: 'UI/UX Design, Web Development, Prototyping, User Research, Design Tools, Responsive Design',
  values: 'User-First Thinking, Creativity, Attention to Detail, Continuous Learning, Collaboration',
};

export const defaultData = { projects, certifications, skills, achievements, blog_posts, profile };

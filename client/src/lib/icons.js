import {
  Code,
  Palette,
  Braces,
  Atom,
  Wind,
  LayoutGrid,
  Server,
  Route,
  Terminal,
  Coffee,
  Database,
  Zap,
  Cloud,
  GitBranch,
  Github,
  PenTool,
  Send,
  Brain,
  Sparkles,
  MessageSquare,
  Shield,
  GraduationCap,
  MapPin,
  BookOpen,
  Trophy,
  Medal,
  Users,
  Presentation,
  Rocket,
  Award,
  Bot,
} from 'lucide-react';

/** Keys stored in skill records → lucide icon */
export const skillIcons = {
  code: Code,
  palette: Palette,
  braces: Braces,
  atom: Atom,
  wind: Wind,
  layout: LayoutGrid,
  server: Server,
  route: Route,
  terminal: Terminal,
  coffee: Coffee,
  database: Database,
  zap: Zap,
  cloud: Cloud,
  git: GitBranch,
  github: Github,
  pen: PenTool,
  send: Send,
  brain: Brain,
  sparkles: Sparkles,
  message: MessageSquare,
  bot: Bot,
};
export const fallbackSkillIcon = Code;

/** Keys stored in project records → lucide icon */
export const projectIcons = {
  shield: Shield,
  graduation: GraduationCap,
  map: MapPin,
  layout: LayoutGrid,
  rocket: Rocket,
  brain: Brain,
  bot: Bot,
};
export const fallbackProjectIcon = Rocket;

/** Keys stored in certification records → lucide icon */
export const certIcons = {
  cloud: Cloud,
  brain: Brain,
  code: Code,
  coffee: Coffee,
  python: Terminal,
  award: Award,
  sparkles: Sparkles,
};
export const fallbackCertIcon = Award;

/** Keys stored in achievement records → lucide icon */
export const achievementIcons = {
  trophy: Trophy,
  book: BookOpen,
  medal: Medal,
  users: Users,
  presentation: Presentation,
  rocket: Rocket,
};
export const fallbackAchievementIcon = Trophy;

/** Gradient keys → monochrome cover gradients (premium black theme) */
export const gradients = {
  neutral: 'from-white/[0.12] via-white/[0.05] to-transparent',
  slate: 'from-white/[0.08] to-transparent',
  dark: 'from-[#2B2B2B] to-[#181818]',
};
export const fallbackGradient = 'from-white/[0.12] via-white/[0.05] to-transparent';

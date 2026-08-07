import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Github,
  ExternalLink,
  FileText,
  FolderGit2,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { projectIcons, fallbackProjectIcon, gradients, fallbackGradient } from '../lib/icons';

/** Upgraded project card with category, status, duration, features and links. */
export default function ProjectCard({ project, index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = projectIcons[project.icon] || fallbackProjectIcon;
  const gradient = gradients[project.gradient] || fallbackGradient;
  const features = Array.isArray(project.features) ? project.features : [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      whileHover={{ y: -6 }}
      className="group card flex flex-col overflow-hidden transition-all duration-300 hover:border-white/40 hover:shadow-2xl hover:shadow-white/5"
    >
      {/* Cover */}
      <div
        className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        <div className="absolute inset-0 bg-grid opacity-40" />
        {project.image ? (
          <img
            src={project.image}
            alt={project.title}
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-150" />
            <Icon
              size={64}
              className="relative text-white/90 drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"
            />
          </>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {project.category && (
            <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              {project.category}
            </span>
          )}
          {project.status && (
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${
                project.status === 'Completed'
                  ? 'bg-white text-black'
                  : 'border border-white/30 bg-black/60 text-white'
              }`}
            >
              {project.status}
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-white">
            {project.title}
          </h3>
          {project.duration && (
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
              <Clock size={12} /> {project.duration}
            </p>
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted">{project.description}</p>

        {(features.length > 0 && expanded) || features.length <= 3 ? (
          <ul className="space-y-1.5 text-sm text-accent">
            {features.slice(0, expanded ? features.length : 3).map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white" />
                {f}
              </li>
            ))}
          </ul>
        ) : null}

        {features.length > 3 && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-muted transition-colors hover:text-white"
          >
            {expanded ? (
              <>
                Show less <ChevronUp size={13} />
              </>
            ) : (
              <>
                View features <ChevronDown size={13} />
              </>
            )}
          </button>
        )}

        <div className="flex flex-wrap gap-1.5">
          {(project.technologies || []).slice(0, 6).map((tech) => (
            <span key={tech} className="chip">
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-edge pt-4">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-white"
            >
              <Github size={16} /> Code
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-white"
            >
              <ExternalLink size={16} /> Demo
            </a>
          )}
          {project.documentation && (
            <a
              href={project.documentation}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-white"
            >
              <FileText size={16} /> Docs
            </a>
          )}
          {!project.github && !project.demo && !project.documentation && (
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <FolderGit2 size={16} /> Links coming soon
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

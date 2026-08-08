import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Rocket, Send, CalendarDays } from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Timeline from '../components/Timeline';
import usePageMeta from '../hooks/usePageMeta';
import { getProfile, apiErrorMessage } from '../api';
import DataNotice from '../components/DataNotice';

export default function Experience() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const loadProfile = () => {
    setError('');
    getProfile()
      .then(setProfile)
      .catch((err) => setError(apiErrorMessage(err)));
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageMeta({
    title: 'Experience | Nandhakumar Thirunavukkarasu',
    description:
      'Experience, internships and roles of Nandhakumar Thirunavukkarasu — UI/UX design and web development.',
  });

  const experience = profile?.experience || [];

  return (
    <PageWrap>
      <section className="container-px py-16">
        {error && <DataNotice message={error} onRetry={loadProfile} className="mb-8" />}
        <SectionHeading
          eyebrow="Career"
          title="Experience"
          subtitle="Internships, projects and roles that shaped how I build and design."
        />

        {experience.length === 0 ? (
          <Reveal>
            <div className="card mx-auto max-w-2xl p-10 text-center">
              <span className="icon-chip mx-auto mb-4">
                <Rocket size={22} />
              </span>
              <h3 className="font-display text-lg font-semibold">
                Early in my career — open to opportunities
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                {profile?.careerObjective ||
                  "I'm a B.E. Computer Science student focused on UI/UX design and web development, currently open to internships and entry-level roles."}
              </p>
              <Link to="/contact" className="btn-primary mt-6">
                <Send size={16} /> Get in touch
              </Link>
            </div>
          </Reveal>
        ) : (
          <Timeline
            items={experience}
            renderItem={(exp) => (
              <div className="card h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-lg hover:shadow-white/5">
                <span className="icon-chip mb-4">
                  <Briefcase size={20} />
                </span>
                <h3 className="font-display text-lg font-semibold">{exp.title}</h3>
                {exp.company && <p className="mt-1 text-sm text-accent">{exp.company}</p>}
                {exp.years && (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    <CalendarDays size={12} /> {exp.years}
                  </p>
                )}
                {exp.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{exp.description}</p>
                )}
              </div>
            )}
          />
        )}
      </section>
    </PageWrap>
  );
}

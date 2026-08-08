import { useEffect, useState } from 'react';
import { GraduationCap, BookOpen, CalendarDays } from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Timeline from '../components/Timeline';
import usePageMeta from '../hooks/usePageMeta';
import { getProfile, apiErrorMessage } from '../api';
import DataNotice from '../components/DataNotice';

export default function Education() {
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
    title: 'Education | Nandhakumar Thirunavukkarasu',
    description:
      'Education and academic journey of Nandhakumar Thirunavukkarasu — B.E. Computer Science and Engineering student.',
  });

  const education = profile?.education || [];

  return (
    <PageWrap>
      <section className="container-px py-16">
        {error && <DataNotice message={error} onRetry={loadProfile} className="mb-8" />}
        <SectionHeading
          eyebrow="My journey"
          title="Education"
          subtitle="The academic foundation behind my design and development work."
        />

        {education.length === 0 ? (
          <Reveal>
            <div className="card mx-auto max-w-xl p-10 text-center">
              <span className="icon-chip mx-auto mb-4">
                <BookOpen size={22} />
              </span>
              <h3 className="font-display text-lg font-semibold">Education details coming soon</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                I&apos;m currently pursuing my B.E. in Computer Science and Engineering — full
                academic details will be published here shortly.
              </p>
            </div>
          </Reveal>
        ) : (
          <Timeline
            items={education}
            renderItem={(edu) => (
              <div className="card h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-lg hover:shadow-white/5">
                <span className="icon-chip mb-4">
                  <GraduationCap size={20} />
                </span>
                <h3 className="font-display text-lg font-semibold">{edu.degree}</h3>
                <p className="mt-1 text-sm text-accent">{edu.institution}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                  <CalendarDays size={12} /> {edu.years}
                </p>
                {edu.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted">{edu.description}</p>
                )}
              </div>
            )}
          />
        )}
      </section>
    </PageWrap>
  );
}

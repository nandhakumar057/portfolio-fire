import { useEffect, useState } from 'react';
import {
  GraduationCap,
  Target,
  Cpu,
  HeartHandshake,
  MapPin,
  Mail,
  ArrowRight,
} from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import Avatar from '../components/Avatar';
import SocialLinks from '../components/SocialLinks';
import usePageMeta from '../hooks/usePageMeta';
import { getProfile } from '../api';

function splitList(value) {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function About() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  usePageMeta({
    title: 'About | Nandhakumar Thirunavukkarasu',
    description:
      'Learn about Nandhakumar Thirunavukkarasu — a B.E. Computer Science Engineering student focused on UI/UX design and web development.',
  });

  const interests = splitList(profile?.interests);
  const values = splitList(profile?.values);

  return (
    <PageWrap>
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="About me"
          title="Get to know me"
          subtitle="A student developer who loves turning ideas into working software."
        />

        {/* Intro */}
        <div className="grid items-center gap-12 lg:grid-cols-[auto,1fr]">
          <Reveal className="flex justify-center">
            <Avatar name={profile?.name || 'Nandhakumar Thirunavukkarasu'} photo={profile?.photo || ''} size={220} />
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="font-display text-2xl font-bold">
              Hi, I&apos;m <span className="text-white">{profile?.name || 'Nandhakumar Thirunavukkarasu'}</span>
            </h3>
            <p className="mt-4 leading-relaxed text-muted">
              {profile?.about ||
                'I am a passionate Computer Science and Engineering student with a strong interest in Full Stack Development, Artificial Intelligence, Cloud Computing and Software Engineering.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">
                <MapPin size={13} /> {profile?.location || 'Tamil Nadu, India'}
              </span>
              <span className="chip">
                <Mail size={13} /> {profile?.email}
              </span>
            </div>
            <div className="mt-6">
              <SocialLinks socials={profile?.socials || {}} />
            </div>
          </Reveal>
        </div>

        {/* Education journey */}
        <div className="mt-20">
          <SectionHeading eyebrow="My journey" title="Educational Journey" align="left" />
          <div className="space-y-6">
            {(profile?.education || []).map((edu, i) => (
              <Reveal key={`${edu.degree}-${i}`} delay={i * 0.08}>
                <div className="card flex flex-col gap-1 p-6 sm:flex-row sm:items-start sm:gap-6">
                  <span className="icon-chip h-12 w-12 shrink-0">
                    <GraduationCap size={22} />
                  </span>
                  <div>
                    <h4 className="font-display text-lg font-semibold">{edu.degree}</h4>
                    <p className="text-sm text-muted">
                      {edu.institution} <span className="text-white">· {edu.years}</span>
                    </p>
                    {edu.description && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">{edu.description}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Career goals / interests / values */}
        <div className="mt-20 grid gap-7 lg:grid-cols-3">
          <Reveal>
            <div className="card h-full p-7">
              <span className="icon-chip mb-4">
                <Target size={22} />
              </span>
              <h3 className="font-display text-lg font-semibold">Career Goals</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {profile?.goals ||
                  'To grow into a full stack developer who ships impactful products — and to specialize in AI engineering.'}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="card h-full p-7">
              <span className="icon-chip mb-4">
                <Cpu size={22} />
              </span>
              <h3 className="font-display text-lg font-semibold">Technical Interests</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span key={interest} className="chip">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="card h-full p-7">
              <span className="icon-chip mb-4">
                <HeartHandshake size={22} />
              </span>
              <h3 className="font-display text-lg font-semibold">Professional Values</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {values.map((value) => (
                  <span key={value} className="chip">
                    {value}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-16 text-center" delay={0.1}>
          <a href="/projects" className="btn-primary">
            See what I&apos;ve built <ArrowRight size={17} />
          </a>
        </Reveal>
      </section>
    </PageWrap>
  );
}

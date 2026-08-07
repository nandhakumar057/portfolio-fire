import { useEffect, useState } from 'react';
import { Palette, Server, Database, Cloud, Brain, Layers } from 'lucide-react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import SkillCard from '../components/SkillCard';
import usePageMeta from '../hooks/usePageMeta';
import { getSkills } from '../api';

const CATEGORY_ICONS = {
  Frontend: Palette,
  Backend: Server,
  Database: Database,
  'Cloud & Tools': Cloud,
  'AI & ML': Brain,
};

const CATEGORY_ORDER = ['Frontend', 'Backend', 'Database', 'Cloud & Tools', 'AI & ML'];

export default function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    getSkills().then(setSkills);
  }, []);

  usePageMeta({
    title: 'Skills | Nandhakumar Thirunavukkarasu',
    description:
      'Skills Nandhakumar Thirunavukkarasu uses for UI/UX design and web development — design tools, prototyping, web technologies and research.',
  });

  const grouped = {};
  for (const skill of skills) {
    (grouped[skill.category] = grouped[skill.category] || []).push(skill);
  }

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]).concat(
    Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c))
  );

  return (
    <PageWrap>
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Tech stack"
          title="My Skills"
          subtitle="Technologies I use to design, build and deploy modern applications."
        />

        <div className="space-y-14">
          {categories.map((category, ci) => {
            const Icon = CATEGORY_ICONS[category] || Layers;
            return (
              <div key={category}>
                <Reveal className="mb-6 flex items-center gap-3">
                  <span className="icon-chip">
                    <Icon size={18} />
                  </span>
                  <h2 className="font-display text-xl font-bold sm:text-2xl">{category}</h2>
                  <span className="h-px flex-1 bg-edge" />
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {grouped[category].map((skill, i) => (
                    <SkillCard key={skill.name} skill={skill} index={ci * 3 + i} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageWrap>
  );
}

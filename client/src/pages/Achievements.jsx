import { useEffect, useMemo, useState } from 'react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import AchievementCard from '../components/AchievementCard';
import usePageMeta from '../hooks/usePageMeta';
import { getAchievements } from '../api';

export default function Achievements() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getAchievements().then(setItems);
  }, []);

  usePageMeta({
    title: 'Achievements | Nandhakumar Thirunavukkarasu',
    description:
      'Hackathons, design challenges, clubs and creative activities that shaped the journey of Nandhakumar Thirunavukkarasu.',
  });

  const categories = useMemo(() => {
    const set = new Set(items.map((a) => a.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [items]);

  const visible = filter === 'All' ? items : items.filter((a) => a.category === filter);

  return (
    <PageWrap>
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Milestones"
          title="Achievements"
          subtitle="Hackathons, workshops, competitions and events that shaped my journey."
        />

        <Reveal className="mb-10 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                filter === cat
                  ? 'bg-white text-black'
                  : 'border border-edge text-muted hover:border-white hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </Reveal>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted">No achievements in this category yet.</p>
        ) : (
          <div className="mx-auto grid max-w-3xl gap-5">
            {visible.map((item, i) => (
              <AchievementCard key={`${item.title}-${i}`} achievement={item} index={i} />
            ))}
          </div>
        )}
      </section>
    </PageWrap>
  );
}

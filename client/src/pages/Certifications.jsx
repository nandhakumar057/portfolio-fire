import { useEffect, useState } from 'react';
import PageWrap from '../components/PageWrap';
import Reveal from '../components/Reveal';
import SectionHeading from '../components/SectionHeading';
import CertificationCard from '../components/CertificationCard';
import usePageMeta from '../hooks/usePageMeta';
import { getCertifications } from '../api';

export default function Certifications() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    getCertifications().then(setCerts);
  }, []);

  usePageMeta({
    title: 'Certifications | Nandhakumar Thirunavukkarasu',
    description:
      'Certifications earned by Nandhakumar Thirunavukkarasu — web development bootcamps, design challenges and hackathons.',
  });

  return (
    <PageWrap>
      <section className="container-px py-16">
        <SectionHeading
          eyebrow="Credentials"
          title="Certifications"
          subtitle="Courses and certifications that sharpen my skills in cloud, AI and development."
        />

        {certs.length === 0 ? (
          <p className="py-16 text-center text-muted">Certifications coming soon.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certs.map((cert, i) => (
              <CertificationCard key={`${cert.title}-${i}`} cert={cert} index={i} />
            ))}
          </div>
        )}

        <Reveal className="mt-12 text-center" delay={0.1}>
          <a
            href="https://www.credly.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-accent hover:underline hover:text-white"
          >
            View my credential profile →
          </a>
        </Reveal>
      </section>
    </PageWrap>
  );
}

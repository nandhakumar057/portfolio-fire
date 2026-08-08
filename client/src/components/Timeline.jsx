import Reveal from './Reveal';

/** Alternating vertical timeline used by the Education & Experience pages. */
export default function Timeline({ items, renderItem }) {
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Spine */}
      <div className="absolute bottom-1 left-4 top-1 w-px bg-edge sm:left-1/2 sm:-translate-x-1/2" />

      {items.map((item, i) => {
        const isLeft = i % 2 === 0;
        return (
          <Reveal key={i} delay={(i % 2) * 0.06} className="relative mb-8 sm:mb-12">
            <div
              className={`relative pl-12 sm:flex sm:pl-0 ${
                isLeft ? 'sm:justify-start' : 'sm:justify-end'
              }`}
            >
              {/* Node */}
              <span className="absolute left-4 top-7 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-accent shadow-[0_0_0_4px] shadow-white/10 sm:left-1/2" />
              {/* Card */}
              <div className={`w-full sm:w-[calc(50%-2rem)] ${isLeft ? 'sm:mr-auto' : 'sm:ml-auto'}`}>
                {renderItem(item, i)}
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

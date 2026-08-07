import { useEffect, useState } from 'react';

/**
 * Cycles through `words` with a typewriter effect.
 * Returns the currently typed substring.
 */
export default function useTypewriter(
  words,
  { typingSpeed = 85, deletingSpeed = 40, pause = 1700 } = {}
) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index % words.length];

    if (!deleting && text === word) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && text === '') {
      setDeleting(false);
      setIndex((i) => (i + 1) % words.length);
      return undefined;
    }

    const t = setTimeout(
      () => {
        setText(word.slice(0, text.length + (deleting ? -1 : 1)));
      },
      deleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, words, typingSpeed, deletingSpeed, pause]);

  return text;
}

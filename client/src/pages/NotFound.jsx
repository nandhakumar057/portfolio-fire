import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageWrap from '../components/PageWrap';
import usePageMeta from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta({ title: 'Page Not Found | Nandhakumar Thirunavukkarasu', description: 'This page does not exist.' });

  return (
    <PageWrap>
      <section className="container-px flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="font-display text-8xl font-extrabold text-white"
        >
          404
        </motion.span>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 max-w-md text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Back to Home
        </Link>
      </section>
    </PageWrap>
  );
}

import React from 'react';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2 } from 'lucide-react';
import { INITIAL_BLOG_POSTS } from '../../data/mockData';
import { SEOHead } from '../SEOHead';
import { NotFoundPage } from '../NotFoundPage';

interface ArticleDetailPageProps {
  slug: string;
  onBack: () => void;
  onSelectArticle: (slug: string) => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({
  slug,
  onBack,
  onSelectArticle,
}) => {
  const post = INITIAL_BLOG_POSTS.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!post) {
    return <NotFoundPage onGoHome={onBack} />;
  }

  const canonicalUrl = `/blog/${post.slug}`;

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      <SEOHead
        title={post.title}
        description={post.summary}
        canonicalPath={canonicalUrl}
        ogType="article"
        ogImage={post.coverImage}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.summary,
          image: post.coverImage,
          author: {
            '@type': 'Person',
            name: post.author,
          },
          publisher: {
            '@type': 'Organization',
            name: 'ORACULOS.TS',
            url: 'https://oraculos-ts.vercel.app',
          },
          datePublished: post.date,
          mainEntityOfPage: `https://oraculos-ts.vercel.app${canonicalUrl}`,
        }}
      />

      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-white/10 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao Blog
      </button>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs text-amber-400 font-semibold">
          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 uppercase tracking-wider">
            {post.category.toUpperCase()}
          </span>
          <span className="text-gray-500">•</span>
          <span className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {post.readTime} de leitura
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-light text-white leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-b border-purple-900/40 pb-4">
          <span className="flex items-center gap-1.5 text-gray-200">
            <User className="w-3.5 h-3.5 text-purple-400" />
            {post.author}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {post.date}
          </span>
        </div>
      </div>

      {/* Featured Image */}
      {post.coverImage && (
        <div className="rounded-3xl overflow-hidden border border-purple-800/40 shadow-2xl">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#150F26]/60 border border-purple-800/30 space-y-6 text-sm text-gray-200 font-light leading-relaxed whitespace-pre-line">
        {post.content.trim()}
      </div>

      {/* Tags */}
      {post.tags && (
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Tag className="w-4 h-4 text-purple-400" />
          {post.tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Related Posts */}
      <div className="pt-8 border-t border-purple-900/40 space-y-4">
        <h3 className="font-serif text-xl font-light text-white">Outros Artigos Recomendados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INITIAL_BLOG_POSTS.filter((p) => p.id !== post.id).map((other) => (
            <div
              key={other.id}
              onClick={() => onSelectArticle(other.slug)}
              className="p-4 rounded-2xl bg-[#150F26]/40 hover:bg-[#150F26] border border-purple-900/30 hover:border-amber-500/40 transition-all cursor-pointer space-y-2"
            >
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                {other.category}
              </span>
              <h4 className="text-xs font-semibold text-white line-clamp-2">
                {other.title}
              </h4>
              <p className="text-[11px] text-gray-400 line-clamp-2 font-light">
                {other.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2, Check, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { INITIAL_BLOG_POSTS } from '../../data/mockData';
import { SEOHead } from '../SEOHead';
import { NotFoundPage } from '../NotFoundPage';
import { getSafeBlogImage, handleBlogImageError } from '../../utils/blogImageUtils';

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
  const [copied, setCopied] = useState(false);
  const post = INITIAL_BLOG_POSTS.find(
    (p) => p.slug === slug || p.id === slug
  );

  if (!post) {
    return <NotFoundPage onGoHome={onBack} />;
  }

  const canonicalUrl = `/blog/${post.slug}`;
  const safeCover = getSafeBlogImage(post.coverImage, post.category);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`✨ Sabedoria dos Oráculos: ${post.title}\n\nLeia o artigo completo no Portal ORACULOS.TS:\n${window.location.href}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-16">
      <SEOHead
        title={`${post.title} | Blog ORACULOS.TS`}
        description={post.summary}
        canonicalPath={canonicalUrl}
        ogType="article"
        ogImage={safeCover}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.summary,
          image: safeCover,
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

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-[#d4af37] border border-white/10 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Blog
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShareWhatsApp}
            title="Compartilhar no WhatsApp"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium cursor-pointer transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleCopyLink}
            title="Copiar Link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-medium cursor-pointer transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

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

      {/* Featured Image - 100% Guaranteed */}
      <div className="rounded-3xl overflow-hidden border border-[#d4af37]/30 shadow-2xl bg-gray-950">
        <img
          src={safeCover}
          alt={post.altText || post.title}
          onError={(e) => handleBlogImageError(e, post.category)}
          className="w-full h-64 sm:h-80 object-cover"
        />
      </div>

      {/* Article Content */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#150F26]/60 border border-purple-800/30 space-y-6 text-sm text-gray-200 font-light leading-relaxed whitespace-pre-line">
        {post.content.trim()}
      </div>

      {/* High-Conversion CTA Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 via-[#150F26] to-purple-950/40 border border-[#d4af37]/50 shadow-2xl space-y-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold gold-accent uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Orientação Imediata ao Vivo
            </div>
            <h3 className="font-serif text-2xl text-white font-normal">
              Deseja uma consulta particular com nossas cartas sagradas?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed">
              Receba orientações claras sobre amor, caminhos financeiros e proteção com tarólogos experientes e sigilo 100% garantido.
            </p>
          </div>

          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Escolher Especialista Agora
          </button>
        </div>
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
          {INITIAL_BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 4).map((other) => (
            <div
              key={other.id}
              onClick={() => onSelectArticle(other.slug)}
              className="group p-4 rounded-2xl bg-[#150F26]/40 hover:bg-[#150F26] border border-purple-900/30 hover:border-amber-500/40 transition-all cursor-pointer flex gap-3 items-center"
            >
              <img
                src={getSafeBlogImage(other.coverImage, other.category)}
                alt={other.title}
                onError={(e) => handleBlogImageError(e, other.category)}
                className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="space-y-1 overflow-hidden">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  {other.category}
                </span>
                <h4 className="text-xs font-semibold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                  {other.title}
                </h4>
                <p className="text-[11px] text-gray-400 line-clamp-1 font-light">
                  {other.summary}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

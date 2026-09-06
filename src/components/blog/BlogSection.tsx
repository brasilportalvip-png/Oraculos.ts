import React, { useState } from 'react';
import { BookOpen, Sparkles, Clock, User, ArrowRight, X, Eye, Tag, RefreshCw, FileText, Search, ShieldCheck, MessageSquare, Flame } from 'lucide-react';
import { INITIAL_BLOG_POSTS } from '../../data/mockData';
import { BlogPost } from '../../types';
import { getSafeBlogImage, handleBlogImageError } from '../../utils/blogImageUtils';

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState<'tarot' | 'cigano' | 'mesaradionica' | 'buzios' | 'astrologia' | 'limpeza' | 'espiritualidade'>('tarot');
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedSeoData, setGeneratedSeoData] = useState<any>(null);

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery = searchQuery.trim() === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleGenerateAiPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiLoading(true);
    setGeneratedSeoData(null);
    try {
      const res = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic || 'Energia da Lua Cheia para Rituais Oraculares',
          oracleCategory: aiCategory,
        }),
      });

      const data = await res.json();
      if (data.title && data.content) {
        setGeneratedSeoData(data);
        const newPost: BlogPost = {
          id: `post-ai-${Date.now()}`,
          title: data.title,
          slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          summary: data.summary,
          content: data.content,
          category: aiCategory,
          author: 'Mestre Oracular & Sabedoria Ancestral',
          date: 'Hoje (Publicação Diária)',
          readTime: data.readTime || '4 min',
          coverImage: getSafeBlogImage(data.coverImage, aiCategory),
          tags: data.keywords || [aiCategory, 'espiritualidade', 'oraculos', 'previsoes'],
          views: 1,
        };
        setPosts([newPost, ...posts]);
      }
    } catch (err) {
      console.error('Erro ao gerar post:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 gold-accent text-xs font-bold uppercase tracking-widest">
          <BookOpen className="w-4 h-4 gold-accent" />
          Blog Espiritual & SEO Portal
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">Sabedoria dos Oráculos</h1>
        <p className="text-xs sm:text-sm text-gray-400 font-light">
          Conteúdo educativo e artigos exclusivos otimizados para mecanismos de busca sobre Tarot, Baralho Cigano e Limpeza Energética.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-5 py-2.5 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            Publicar Novo Artigo & Otimizar SEO
          </button>
        </div>
      </div>

      {/* Search & Categories Bar */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="relative max-w-md mx-auto">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar artigos por tema, oráculo ou palavra-chave..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/10 rounded-2xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {[
            { id: 'all', label: 'Todos os Artigos' },
            { id: 'tarot', label: 'Tarot' },
            { id: 'cigano', label: 'Baralho Cigano' },
            { id: 'mesaradionica', label: 'Mesa Radiônica' },
            { id: 'buzios', label: 'Jogo de Búzios' },
            { id: 'astrologia', label: 'Astrologia' },
            { id: 'limpeza', label: 'Limpeza Espiritual' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#d4af37] text-black shadow-md'
                  : 'glass-card border border-white/10 text-gray-400 hover:text-white hover:border-[#d4af37]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => {
          const isDailyFeature = index === 0 || post.date.includes('Hoje');
          return (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`group glass-card border ${
                isDailyFeature ? 'border-[#d4af37]/50 shadow-lg shadow-[#d4af37]/5' : 'border-white/10'
              } hover:border-[#d4af37] rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col justify-between hover:bg-white/[0.05]`}
            >
              <div className="space-y-4">
                {/* Cover Image - 100% Guaranteed */}
                <div className="relative h-48 overflow-hidden bg-gray-950">
                  <img
                    src={getSafeBlogImage(post.coverImage, post.category)}
                    alt={post.altText || post.title}
                    onError={(e) => handleBlogImageError(e, post.category)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-bold gold-accent uppercase rounded-full">
                      {post.category}
                    </span>
                    {isDailyFeature && (
                      <span className="px-2.5 py-1 bg-amber-500 text-black text-[10px] font-extrabold uppercase rounded-full flex items-center gap-1 shadow-md">
                        <Flame className="w-3 h-3 fill-current" />
                        Post do Dia
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Summary */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 gold-accent" />
                      {post.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {post.readTime}
                    </span>
                    <span>•</span>
                    <span className="text-[10px] text-amber-300/80 font-mono">
                      {post.date}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-light text-white group-hover:text-[#d4af37] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed font-light">
                    {post.summary}
                  </p>
                </div>
              </div>

              {/* Read More Footer */}
              <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-white/10 text-xs font-bold uppercase tracking-wider gold-accent group-hover:text-white">
                <span>Ler Artigo Completo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Post Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl glass-card border border-[#d4af37]/40 rounded-3xl p-6 sm:p-8 space-y-5 bg-[#050508]/95 text-gray-200">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-light text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 gold-accent" />
                Estúdio de Redação Oracular & Metadados SEO
              </h3>
              <p className="text-xs text-gray-400 font-light">
                Digite um tema e o artigo completo será redigido e estruturado com tags SEO e Schema.org.
              </p>
            </div>

            <form onSubmit={handleGenerateAiPost} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold">Tema ou Título Desejado</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="Ex: Como interpretar os 22 Arcanos Maiores para Amor"
                  className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1 font-semibold">Categoria</label>
                <select
                  value={aiCategory}
                  onChange={(e: any) => setAiCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black border border-white/10 rounded-xl text-xs text-white"
                >
                  <option value="tarot">Tarot</option>
                  <option value="cigano">Baralho Cigano</option>
                  <option value="mesaradionica">Mesa Radionica</option>
                  <option value="espiritualidade">Espiritualidade Geral</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-3 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando Texto e Tags SEO...
                  </span>
                ) : (
                  'Gerar Artigo e Publicar'
                )}
              </button>
            </form>

            {/* Generated SEO Metadata Preview */}
            {generatedSeoData && (
              <div className="p-4 bg-white/5 border border-[#d4af37]/30 rounded-2xl space-y-2 text-xs font-mono text-gray-300">
                <span className="text-[10px] gold-accent uppercase font-bold block">SEO Preview (Google Search Snippet)</span>
                <p className="font-bold text-emerald-400 text-sm">{generatedSeoData.metaTitle}</p>
                <p className="text-gray-400 leading-snug">{generatedSeoData.metaDescription}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {generatedSeoData.keywords?.map((kw: string) => (
                    <span key={kw} className="px-2 py-0.5 bg-white/10 rounded text-[10px] text-gray-300">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reading Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[85vh] glass-card border border-[#d4af37]/30 rounded-3xl p-6 sm:p-8 overflow-y-auto text-gray-200 space-y-6 bg-[#050508]/95">
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-gray-950">
              <img
                src={getSafeBlogImage(selectedPost.coverImage, selectedPost.category)}
                alt={selectedPost.altText || selectedPost.title}
                onError={(e) => handleBlogImageError(e, selectedPost.category)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/10 border border-white/10 gold-accent text-xs font-bold uppercase rounded-full">
                  {selectedPost.category}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {selectedPost.readTime} de leitura
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-white">{selectedPost.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Por {selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.date}</span>
                <span>•</span>
                <span>{selectedPost.views} leituras</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 leading-relaxed space-y-4 pt-2 border-t border-white/10 font-light">
              {selectedPost.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            {/* Direct Consultation CTA Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-900/30 to-amber-500/10 border border-[#d4af37]/40 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold gold-accent uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Atendimento Espiritual Sigiloso & Direto
                  </div>
                  <h4 className="font-serif text-lg text-white font-medium">
                    Quer uma resposta clara para o seu caso pessoal?
                  </h4>
                  <p className="text-xs text-gray-300 font-light">
                    Consulte nossos tarólogos e médiuns certificados no Chat ao Vivo ou Voz com até 50% de bônus na 1ª recarga.
                  </p>
                </div>
              </div>
              <a
                href="#consultores"
                onClick={() => setSelectedPost(null)}
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#d4af37] hover:bg-[#b8952b] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg cursor-pointer text-center"
              >
                <MessageSquare className="w-4 h-4" />
                Consultar Especialista em {selectedPost.category.toUpperCase()} Agora
              </a>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 gold-accent" />
              {selectedPost.tags.map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

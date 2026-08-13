import React, { useState } from 'react';
import { BookOpen, Sparkles, Clock, User, ArrowRight, X, Eye, Tag, RefreshCw, FileText, Search } from 'lucide-react';
import { INITIAL_BLOG_POSTS } from '../../data/mockData';
import { BlogPost } from '../../types';

export const BlogSection: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCategory, setAiCategory] = useState<'tarot' | 'cigano' | 'mesaradionica' | 'espiritualidade'>('tarot');
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedSeoData, setGeneratedSeoData] = useState<any>(null);

  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === selectedCategory);

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
          author: 'IA Mestre Oracular (Gemini 3.6)',
          date: 'Hoje',
          readTime: data.readTime || '4 min',
          coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
          tags: data.keywords || ['tarot', 'espiritualidade', 'seo'],
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
            Gerar Artigo com IA & Otimizar SEO
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
        {['all', 'tarot', 'cigano', 'mesaradionica'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider capitalize transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#d4af37] text-black shadow-md'
                : 'glass-card border border-white/10 text-gray-400 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'Todos os Artigos' : cat}
          </button>
        ))}
      </div>

      {/* Posts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="group glass-card border border-white/10 hover:border-[#d4af37]/60 rounded-2xl overflow-hidden transition-all cursor-pointer flex flex-col justify-between hover:bg-white/[0.05]"
          >
            <div className="space-y-4">
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden bg-gray-900">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold gold-accent uppercase rounded-full">
                  {post.category}
                </span>
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
            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-white/10 text-xs font-bold uppercase tracking-wider gold-accent group-hover:text-white">
              <span>Ler Artigo Completo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
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
                Estúdio de Conteúdo IA & Metadados SEO
              </h3>
              <p className="text-xs text-gray-400 font-light">
                Digite um tema e o modelo Gemini 3.6 criará o artigo completo junto com tags SEO e Schema.org.
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

            <img
              src={selectedPost.coverImage}
              alt={selectedPost.title}
              className="w-full h-56 object-cover rounded-2xl border border-white/10"
            />

            <div className="space-y-2">
              <span className="px-3 py-1 bg-white/10 border border-white/10 gold-accent text-xs font-bold uppercase rounded-full">
                {selectedPost.category}
              </span>
              <h2 className="font-serif text-3xl font-light text-white">{selectedPost.title}</h2>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Por {selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.date}</span>
                <span>•</span>
                <span>{selectedPost.views} visualizações</span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-gray-300 leading-relaxed space-y-4 pt-2 border-t border-white/10 font-light">
              {selectedPost.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2">
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

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { HelpdeskStorageService } from '../../services/storage';
import { KnowledgeArticle } from '../../types/helpdesk';
import { Search, BookOpen, Eye, Plus, ArrowLeft } from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { currentUser, isTechnician } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Articles list
  const [articles, setArticles] = useState<KnowledgeArticle[]>(() => {
    return HelpdeskStorageService.getKbArticles();
  });

  const categories = useMemo(() => HelpdeskStorageService.getCategories(), []);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Employees see only published
      if (currentUser.role === 'ROLE_EMPLOYEE' && art.status !== 'PUBLISHED') {
        return false;
      }

      if (categoryFilter !== 'ALL' && art.categoryId !== categoryFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return art.title.toLowerCase().includes(q) || art.content.toLowerCase().includes(q);
      }

      return true;
    });
  }, [articles, categoryFilter, search, currentUser]);

  const handleReadArticle = (article: KnowledgeArticle) => {
    // Increment view count
    const updated = articles.map((a) => (a.id === article.id ? { ...a, viewCount: a.viewCount + 1 } : a));
    setArticles(updated);
    HelpdeskStorageService.setKbArticles(updated);
    setSelectedArticle({ ...article, viewCount: article.viewCount + 1 });
  };

  // Create article form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(categories[0]?.id || '');
  const [newContent, setNewContent] = useState('');

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const cat = categories.find((c) => c.id === newCategory);
    const newArt: KnowledgeArticle = {
      id: 'kb-' + Date.now(),
      title: newTitle.trim(),
      content: newContent.trim(),
      categoryId: newCategory,
      categoryName: cat?.name || 'General',
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      status: 'PUBLISHED',
      viewCount: 0,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newArt, ...articles];
    setArticles(updated);
    HelpdeskStorageService.setKbArticles(updated);

    HelpdeskStorageService.recordAudit({
      userEmail: currentUser.email,
      action: 'KB_ARTICLE_PUBLISHED',
      resourceType: 'KNOWLEDGE_BASE',
      resourceId: newArt.id,
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
      details: `Published KB article: "${newArt.title}"`,
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Knowledge Base & Standard Procedures</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Self-service diagnostic guides, toolchain setup documentation, and corporate IT runbooks.
          </p>
        </div>

        {isTechnician && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Article</span>
          </button>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search solutions, runbooks, VPN instructions..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-md bg-white text-slate-700 focus:outline-hidden w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Articles Grid or Single Article Reader */}
      {selectedArticle ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          <div className="border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>{selectedArticle.categoryName}</span>
              <span aria-hidden="true">·</span>
              <span>Author: {selectedArticle.authorName}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {selectedArticle.viewCount} views
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">{selectedArticle.title}</h1>
          </div>

          <div className="prose prose-slate max-w-none text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans">
            {selectedArticle.content}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => handleReadArticle(art)}
              className="p-5 bg-white border border-slate-200 rounded-lg shadow-xs hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-slate-600">{art.categoryName}</span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                    <Eye className="w-3 h-3" /> {art.viewCount}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {art.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 mt-4">
                <span>By {art.authorName}</span>
                <span className="font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  Read Article &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Article Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Publish Knowledge Base Runbook</h3>
            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Article Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Setting up WireGuard VPN on Ubuntu 24.04"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-md bg-white text-slate-900"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Article Content (Markdown / Text) *</label>
                <textarea
                  rows={6}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Step-by-step resolution procedure..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

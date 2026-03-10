/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageSquare, User, Calendar, ArrowRight, Loader2 } from 'lucide-react';

// --- Types ---
interface Author {
  id: string;
  name: string;
  email: string;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  author: Author;
  _count: {
    likes: number;
    comments: number;
  };
}

interface FeedResponse {
  data: Blog[];
  meta: {
    nextCursor: string | null;
  };
}

// --- API Client ---
const api = {
  getFeed: async (cursor?: string): Promise<FeedResponse> => {
    const url = `/api/public/feed?limit=10${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch feed');
    return res.json();
  }
};

// --- Components ---

const BlogCard: React.FC<{ blog: Blog }> = ({ blog }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="group bg-white rounded-2xl border border-zinc-100 p-6 hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300"
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
        <User size={20} />
      </div>
      <div>
        <p className="text-sm font-semibold text-zinc-900">{blog.author.name || 'Anonymous'}</p>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <Calendar size={12} />
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>

    <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-indigo-600 transition-colors">
      {blog.title}
    </h3>
    
    <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-50">
      <div className="flex gap-4">
        <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
          <Heart size={16} className="text-zinc-400" />
          <span>{blog._count.likes}</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
          <MessageSquare size={16} className="text-zinc-400" />
          <span>{blog._count.comments}</span>
        </div>
      </div>
      
      <button className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:gap-2 transition-all">
        Read More <ArrowRight size={16} />
      </button>
    </div>
  </motion.div>
);

export default function App() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      try {
        setLoading(true);
        const response = await api.getFeed();
        setBlogs(response.data);
      } catch (err) {
        setError('Unable to load the feed. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
              B
            </div>
            <span className="font-bold text-xl tracking-tight">ModernBlog</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500">
            <a href="#" className="text-zinc-900">Feed</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Trending</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">About</a>
          </nav>

          <button className="bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6"
          >
            Insights for the <span className="text-indigo-600">Modern Developer</span>.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-zinc-500 max-w-2xl mx-auto"
          >
            Explore the latest in technology, design, and engineering from our community of writers.
          </motion.p>
        </div>
      </section>

      {/* Main Feed */}
      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl font-bold">Latest Stories</h2>
          <div className="flex gap-2">
            {['All', 'Tech', 'Design', 'Life'].map((tag) => (
              <button key={tag} className="px-4 py-1.5 rounded-full text-sm font-medium bg-white border border-zinc-200 hover:border-zinc-900 transition-colors">
                {tag}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={40} />
              <p className="text-zinc-500 font-medium">Curating your feed...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 text-sm font-bold text-red-700 underline underline-offset-4"
              >
                Try Again
              </button>
            </div>
          ) : blogs.length === 0 ? (
            <div className="bg-white border border-zinc-200 rounded-2xl p-20 text-center">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">No stories found</h3>
              <p className="text-zinc-500">Be the first to share your thoughts with the world.</p>
              <button className="mt-8 bg-indigo-600 text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all">
                Write a Story
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-12 bg-white">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-zinc-900 rounded flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
            <span className="font-bold text-zinc-900">ModernBlog</span>
          </div>
          <p className="text-sm text-zinc-400">© 2026 ModernBlog. Built with NestJS & React.</p>
          <div className="flex gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">GitHub</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

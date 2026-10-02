/**
 * ASTROWORLD — Blog Page
 * Insightful Vedic astrology articles on transits, yogas, dasha periods, and remedies.
 */

import React, { useState } from 'react';
import { Calendar, User, ArrowRight, Tag, BookOpen, Clock, Sparkles } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Understanding Saturn's Sade Sati: It's Not All Bad",
    excerpt: "The 7.5-year cycle of Saturn transiting adjacent to your natal Moon is often feared, but it is actually a period of immense spiritual growth and karmic balancing.",
    content: "In classical Jyotish, Sade Sati occurs when transit Saturn moves through the 12th, 1st, and 2nd houses from your natal Moon. While Saturn demands discipline and strips away superficial pretenses, native charts with strong Moon placements (like Taurus exaltation or Cancer domicile) experience Sade Sati as a period of profound mastery and societal elevation.",
    category: "Planetary Transits",
    author: "Pandit Sharma",
    date: "Oct 12, 2026",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "The 5 Pancha Mahapurusha Yogas: Are You Born for Greatness?",
    excerpt: "Pancha Mahapurusha Yogas are formed by Mars, Mercury, Jupiter, Venus, and Saturn when placed in Kendra houses in their own or exalted signs.",
    content: "According to Brihat Parashara Hora Shastra Chapter 75, the five supreme human archetypes are Ruchaka (Mars in Kendra in Aries/Scorpio/Capricorn), Bhadra (Mercury in Gemini/Virgo), Hamsa (Jupiter in Sagittarius/Pisces/Cancer), Malavya (Venus in Taurus/Libra/Pisces), and Shasha (Saturn in Capricorn/Aquarius/Libra). Each yoga bestows enduring legacy and executive authority.",
    category: "Vedic Yogas",
    author: "Dr. A. Rao",
    date: "Oct 08, 2026",
    readTime: "8 min read",
  },
  {
    id: 3,
    title: "Retrograde Planets (Vakra Grahas): Unfinished Karmic Business",
    excerpt: "When a planet appears to move backward in the night sky, its energy turns inward, demanding introspection and completion of past-life obligations.",
    content: "Parashari rules designate retrograde planets as possessing heightened Chesta Bala (motional strength). A retrograde benefic like Jupiter or Venus offers deep internal wisdom, while a retrograde malefic like Saturn or Mars demands thorough resolution of ancestral karma before physical rewards manifest.",
    category: "Karma & Reincarnation",
    author: "Priya Singh",
    date: "Sep 25, 2026",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Choosing Authentic Gemstones: Canonical Jyotish Rules",
    excerpt: "Gemstones act as optical prisms for cosmic light rays, but wearing the stone of a functional malefic can trigger unexpected obstacles.",
    content: "Classical astrology mandates that gemstones should only be worn for functional benefics and Yogakaraka planets that are weakly placed or unafflicted. Never wear stones of 6th, 8th, or 12th lords without rigorous remedial consultation.",
    category: "Classical Remedies",
    author: "Pandit Sharma",
    date: "Sep 15, 2026",
    readTime: "4 min read",
  },
];

export const BlogView: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#162058]">
          Vedic Astrology Insights &amp; Wisdom
        </h2>
        <div className="w-16 h-1 bg-orange-500 rounded-full mx-auto"></div>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
          Explore canonical interpretations, planetary transit analyses, and timeless Jyotish wisdom.
        </p>
      </div>

      {/* Selected Post Modal / Drawer */}
      {selectedPost && (
        <div className="bg-white rounded-3xl p-8 border border-amber-300 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-mono font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              {selectedPost.category}
            </span>
            <button
              onClick={() => setSelectedPost(null)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕ Close Article
            </button>
          </div>
          <h3 className="font-serif font-bold text-2xl text-[#162058]">{selectedPost.title}</h3>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>By {selectedPost.author}</span>
            <span>•</span>
            <span>{selectedPost.date}</span>
            <span>•</span>
            <span>{selectedPost.readTime}</span>
          </div>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap pt-2 border-t border-slate-100">
            {selectedPost.content}
          </div>
        </div>
      )}

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BLOG_POSTS.map((post) => (
          <div
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-400 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="font-mono text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {post.readTime}
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#162058] group-hover:text-orange-500 transition-colors mb-2">
                {post.title}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">{post.date}</span>
              <span className="font-bold text-orange-500 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                Read Article <ArrowRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

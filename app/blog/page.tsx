import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Refresh feed every hour

async function getBlogPosts() {
  try {
    const response = await fetch('https://cagetrackplayerdevelopment.substack.com/feed', {
      next: { revalidate: 3600 },
    });

    if (!response.ok) return [];

    const xml = await response.text();

    // Parse RSS XML
    const items: any[] = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g);

    if (!itemMatches) return [];

    for (const itemXml of itemMatches) {
      const title = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]
        || itemXml.match(/<title>([\s\S]*?)<\/title>/)?.[1]
        || '';

      const link = itemXml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';

      const description = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
        || itemXml.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        || '';

      const pubDate = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';

      const creator = itemXml.match(/<dc:creator><!\[CDATA\[([\s\S]*?)\]\]><\/dc:creator>/)?.[1]
        || itemXml.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/)?.[1]
        || 'CageTrack';

      // Extract first image from description
      const imageMatch = description.match(/<img[^>]+src="([^"]+)"/);
      const image = imageMatch?.[1] || null;

      // Strip HTML tags for preview text
      const plainText = description.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
      const preview = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');

      items.push({
        title,
        link,
        preview,
        image,
        pubDate,
        creator,
      });
    }

    return items;
  } catch (error) {
    return [];
  }
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 w-full z-50 px-4 py-3 bg-navy/90 backdrop-blur-xl border-b border-wheat/8">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md border-2 border-wheat flex items-center justify-center text-wheat font-display text-xs -rotate-3">CT</div>
            <span className="font-display text-lg tracking-wider">CAGETRACK</span>
          </Link>
          <Link href="/dashboard" className="text-xs text-offwhite/40 hover:text-wheat transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl mb-2">Player Development Blog</h1>
          <p className="text-offwhite/40">Tips, drills, and insights to help your player grow.</p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-xl bg-navy-light border border-wheat/8 p-8 text-center">
            <div className="w-14 h-14 rounded-xl bg-wheat/10 flex items-center justify-center mx-auto mb-4 text-2xl">📖</div>
            <h2 className="font-display text-xl mb-2">Coming Soon</h2>
            <p className="text-offwhite/40 text-sm max-w-sm mx-auto mb-4">We&apos;re working on development content for players and coaches. Check back soon!</p>
            <a href="https://cagetrackplayerdevelopment.substack.com" target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors">Subscribe on Substack</a>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <a key={i} href={post.link} target="_blank" rel="noopener noreferrer" className="block rounded-xl bg-navy-light border border-wheat/8 hover:border-wheat/20 transition-all overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  {post.image && (
                    <div className="sm:w-48 sm:flex-shrink-0">
                      <img src={post.image} alt="" className="w-full h-40 sm:h-full object-cover" />
                    </div>
                  )}
                  <div className="p-5 flex-1">
                    <h2 className="font-display text-lg tracking-wide text-wheat mb-1">{post.title}</h2>
                    <div className="flex items-center gap-2 mb-2">
                      {post.pubDate && <span className="text-[10px] text-offwhite/30">{formatDate(post.pubDate)}</span>}
                      {post.creator && <span className="text-[10px] text-offwhite/20">by {post.creator}</span>}
                    </div>
                    <p className="text-xs text-offwhite/40 leading-relaxed line-clamp-3">{post.preview}</p>
                    <span className="inline-block mt-3 text-xs text-wheat">Read more →</span>
                  </div>
                </div>
              </a>
            ))}

            <div className="text-center pt-4">
              <a href="https://cagetrackplayerdevelopment.substack.com" target="_blank" rel="noopener noreferrer" className="inline-block px-5 py-2 bg-wheat/10 border border-wheat/20 text-wheat text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-wheat/20 transition-colors">View All Posts on Substack</a>
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full z-50 bg-navy/95 backdrop-blur-xl border-t border-wheat/8 sm:hidden">
        <div className="flex justify-around py-2">
          <Link href="/dashboard" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🏠</span><span className="text-[10px] text-offwhite/30">Home</span></Link>
          <Link href="/drills" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">📋</span><span className="text-[10px] text-offwhite/30">Drills</span></Link>
          <Link href="/coaches" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">🧢</span><span className="text-[10px] text-offwhite/30">Coaches</span></Link>
          <Link href="/settings" className="flex flex-col items-center gap-0.5 px-3 py-1"><span className="text-lg">⚙️</span><span className="text-[10px] text-offwhite/30">Settings</span></Link>
        </div>
      </nav>
    </div>
  );
}

# Performance Optimization

Comprehensive guide to optimizing Next.js applications.

## Image Optimization

### Next.js Image Component

```typescript
import Image from 'next/image';

export function PostCard({ post }: { post: Post }) {
  return (
    <div>
      <Image
        src={post.coverImage}
        alt={post.title}
        width={800}
        height={400}
        priority // Load eagerly (above fold)
      />
      <h2>{post.title}</h2>
    </div>
  );
}
```

### Fill Layout

```typescript
<div style={{ position: 'relative', width: '100%', height: '400px' }}>
  <Image
    src="/hero.jpg"
    alt="Hero"
    fill
    style={{ objectFit: 'cover' }}
    sizes="100vw"
  />
</div>
```

### Responsive Images

```typescript
<Image
  src="/post-cover.jpg"
  alt="Post cover"
  width={800}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
/>
```

### Remote Images

```typescript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
        pathname: '/images/**',
      },
    ],
  },
};
```

## Code Splitting

### Dynamic Imports

```typescript
import dynamic from 'next/dynamic';

// Basic dynamic import
const Comments = dynamic(() => import('@/components/Comments'), {
  loading: () => <p>Loading comments...</p>
});

export function PostPage({ post }: { post: Post }) {
  return (
    <article>
      <Post data={post} />
      <Comments postId={post.id} />
    </article>
  );
}
```

### Disable SSR

```typescript
const Chart = dynamic(() => import('@/components/Chart'), {
  ssr: false, // Only render on client
  loading: () => <ChartSkeleton />
});
```

### Named Exports

```typescript
const UserProfile = dynamic(
  () => import('@/components/User').then(mod => mod.UserProfile),
  { loading: () => <Skeleton /> }
);
```

## Static Generation

### generateStaticParams

```typescript
// Pre-render all posts at build time
export async function generateStaticParams() {
  const posts = await getPosts();

  return posts.map((post) => ({
    id: post.id
  }));
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  return <Post data={post} />;
}
```

### Partial Pre-rendering

```typescript
// Generate top 100 posts, rest on-demand
export const dynamicParams = true; // Allow dynamic params (default)

export async function generateStaticParams() {
  const topPosts = await getTopPosts(100);

  return topPosts.map((post) => ({
    id: post.id
  }));
}
```

## Incremental Static Regeneration

### Time-Based Revalidation

```typescript
// Revalidate every hour
export const revalidate = 3600;

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}
```

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { path, tag } = await request.json();

  if (path) {
    revalidatePath(path);
  }

  if (tag) {
    revalidateTag(tag);
  }

  return Response.json({ revalidated: true, now: Date.now() });
}
```

## Caching Strategies

### Force Cache

```typescript
// Cache indefinitely
fetch('https://api.example.com/settings', {
  cache: 'force-cache'
});
```

### No Store

```typescript
// Never cache
fetch('https://api.example.com/user', {
  cache: 'no-store'
});
```

### Revalidate

```typescript
// Cache for 1 hour
fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 }
});
```

### Tagged Caching

```typescript
// Tag for selective revalidation
fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
});

// Later, revalidate
revalidateTag('posts');
```

## Streaming and Suspense

### Progressive Loading

```typescript
import { Suspense } from 'react';

export default function Dashboard() {
  return (
    <div>
      {/* Fast content loads immediately */}
      <Header />

      {/* Slow content streams in */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>
    </div>
  );
}
```

### Parallel Streaming

```typescript
export default function Page() {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent1 />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <SlowComponent2 />
      </Suspense>

      {/* Both load in parallel */}
    </div>
  );
}
```

## Font Optimization

### Google Fonts

```typescript
// app/layout.tsx
import { Inter, Roboto_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto-mono'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

### Local Fonts

```typescript
import localFont from 'next/font/local';

const myFont = localFont({
  src: './my-font.woff2',
  display: 'swap',
  variable: '--font-my-font'
});
```

## Route Segment Config

### Dynamic Rendering

```typescript
// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Force static rendering
export const dynamic = 'force-static';

// Auto (default)
export const dynamic = 'auto';

// Error on dynamic
export const dynamic = 'error';
```

### Runtime

```typescript
// Use Node.js runtime (default)
export const runtime = 'nodejs';

// Use Edge runtime
export const runtime = 'edge';
```

### Fetch Cache

```typescript
// Default fetch cache behavior
export const fetchCache = 'auto';

// Force cache all fetches
export const fetchCache = 'force-cache';

// Never cache fetches
export const fetchCache = 'force-no-store';
```

## Lazy Loading Components

### Client Components

```typescript
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  ssr: false
});

export function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <button onClick={() => setShowChart(true)}>
        Show Chart
      </button>

      {showChart && <HeavyChart />}
    </div>
  );
}
```

### Lazy Load External Libraries

```typescript
'use client';

import { useState } from 'react';

export function MarkdownEditor() {
  const [editor, setEditor] = useState<any>(null);

  const loadEditor = async () => {
    const { default: Editor } = await import('react-markdown-editor');
    setEditor(<Editor />);
  };

  return (
    <div>
      {editor || <button onClick={loadEditor}>Load Editor</button>}
    </div>
  );
}
```

## Bundle Analysis

### Setup

```bash
npm install @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
});

module.exports = withBundleAnalyzer({
  // Your Next.js config
});
```

```bash
# Analyze bundle
ANALYZE=true npm run build
```

## Performance Monitoring

### Web Vitals

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Custom Metrics

```typescript
// app/web-vitals.ts
export function reportWebVitals(metric: any) {
  console.log(metric);

  // Send to analytics
  if (metric.label === 'web-vital') {
    // Track CLS, FID, FCP, LCP, TTFB
    analytics.track('Web Vital', {
      name: metric.name,
      value: metric.value,
      id: metric.id
    });
  }
}
```

## Database Optimization

### Connection Pooling

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
```

### Query Optimization

```typescript
// Select only needed fields
const posts = await db.post.findMany({
  select: {
    id: true,
    title: true,
    excerpt: true,
    author: {
      select: {
        name: true,
        avatar: true
      }
    }
  },
  take: 10
});

// Use indexes
await db.post.findMany({
  where: {
    published: true, // Should have index
    categoryId: categoryId // Should have index
  }
});
```

## Parallel Data Fetching

### Component-Level

```typescript
export default async function Dashboard() {
  // Fetch in parallel
  const [user, posts, stats] = await Promise.all([
    getUser(),
    getPosts(),
    getStats()
  ]);

  return (
    <div>
      <UserProfile user={user} />
      <PostsList posts={posts} />
      <StatsPanel stats={stats} />
    </div>
  );
}
```

### With Suspense

```typescript
export default function Dashboard() {
  return (
    <div>
      {/* All load in parallel */}
      <Suspense fallback={<Skeleton />}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <RecentPosts />
      </Suspense>

      <Suspense fallback={<Skeleton />}>
        <Stats />
      </Suspense>
    </div>
  );
}
```

## Metadata Optimization

### Static Metadata

```typescript
export const metadata = {
  title: 'Posts',
  description: 'Browse all posts',
  openGraph: {
    title: 'Posts',
    description: 'Browse all posts',
    images: ['/og-image.jpg']
  }
};
```

### Dynamic Metadata

```typescript
export async function generateMetadata({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage]
    }
  };
}
```

## Best Practices

1. **Use Image Component**: Always use next/image for automatic optimization
2. **Implement Code Splitting**: Use dynamic imports for heavy components
3. **Static Generation**: Pre-render pages when possible
4. **Streaming**: Use Suspense for progressive loading
5. **Cache Strategically**: Choose appropriate cache settings
6. **Optimize Fonts**: Use next/font for automatic font optimization
7. **Parallel Fetching**: Fetch independent data in parallel
8. **Monitor Performance**: Track Web Vitals and Core metrics
9. **Analyze Bundles**: Regularly check bundle size
10. **Database Queries**: Optimize queries and use connection pooling

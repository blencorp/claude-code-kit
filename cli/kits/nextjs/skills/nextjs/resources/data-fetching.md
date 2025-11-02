# Data Fetching Patterns

Advanced data fetching strategies for Next.js App Router.

## Fetch API with Caching

### Basic Fetch with Revalidation

```typescript
// Revalidate every hour
const posts = await fetch('https://api.example.com/posts', {
  next: { revalidate: 3600 }
}).then(res => res.json());

// Never cache (always fresh)
const user = await fetch('https://api.example.com/user', {
  cache: 'no-store'
}).then(res => res.json());

// Cache indefinitely (until revalidated)
const settings = await fetch('https://api.example.com/settings', {
  cache: 'force-cache'
}).then(res => res.json());
```

### With Tags for Revalidation

```typescript
const posts = await fetch('https://api.example.com/posts', {
  next: {
    tags: ['posts'],
    revalidate: 3600
  }
}).then(res => res.json());

// Later, revalidate all requests tagged with 'posts'
import { revalidateTag } from 'next/cache';
revalidateTag('posts');
```

## Request Memoization

Next.js automatically memoizes fetch requests with the same URL and options:

```typescript
export default async function Page() {
  // These two fetch calls are automatically deduplicated
  const post1 = await fetch('https://api.example.com/posts/1');
  const post2 = await fetch('https://api.example.com/posts/1');

  // Only one network request is made
}
```

### Manual Memoization

For non-fetch data fetching:

```typescript
import { cache } from 'react';

const getPost = cache(async (id: string) => {
  return await db.post.findUnique({
    where: { id }
  });
});

// Usage - automatically deduplicated
const post1 = await getPost('123');
const post2 = await getPost('123'); // Returns cached result
```

## Parallel Data Fetching

### Using Promise.all

```typescript
export default async function Dashboard() {
  const [user, posts, notifications] = await Promise.all([
    getUser(),
    getPosts(),
    getNotifications()
  ]);

  return (
    <div>
      <UserInfo user={user} />
      <PostsList posts={posts} />
      <Notifications data={notifications} />
    </div>
  );
}
```

### With Error Handling

```typescript
export default async function Dashboard() {
  const results = await Promise.allSettled([
    getUser(),
    getPosts(),
    getNotifications()
  ]);

  const user = results[0].status === 'fulfilled' ? results[0].value : null;
  const posts = results[1].status === 'fulfilled' ? results[1].value : [];
  const notifications = results[2].status === 'fulfilled' ? results[2].value : [];

  return (
    <div>
      {user ? <UserInfo user={user} /> : <UserError />}
      <PostsList posts={posts} />
      <Notifications data={notifications} />
    </div>
  );
}
```

## Sequential Data Fetching

When data depends on previous results:

```typescript
export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  // Wait for post before fetching author
  const author = await getAuthor(post.authorId);

  // Wait for both before fetching related posts
  const relatedPosts = await getRelatedPosts(post.tags);

  return (
    <article>
      <Post data={post} author={author} />
      <RelatedPosts posts={relatedPosts} />
    </article>
  );
}
```

## Streaming with Suspense

### Basic Streaming

```typescript
import { Suspense } from 'react';

export default function PostsPage() {
  return (
    <div>
      <h1>Posts</h1>
      <Suspense fallback={<LoadingSkeleton />}>
        <Posts />
      </Suspense>
    </div>
  );
}

async function Posts() {
  const posts = await getPosts(); // Slow fetch
  return <PostsList posts={posts} />;
}
```

### Multiple Suspense Boundaries

```typescript
export default function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserInfo />
      </Suspense>

      <Suspense fallback={<PostsSkeleton />}>
        <RecentPosts />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </div>
  );
}

async function UserInfo() {
  const user = await getUser(); // Fast
  return <UserCard user={user} />;
}

async function RecentPosts() {
  const posts = await getPosts(); // Medium speed
  return <PostsList posts={posts} />;
}

async function Stats() {
  const stats = await calculateStats(); // Slow
  return <StatsPanel data={stats} />;
}
```

## Database Queries

### With Prisma

```typescript
import { db } from '@/lib/db';

export default async function PostsPage() {
  const posts = await db.post.findMany({
    where: { published: true },
    include: {
      author: true,
      comments: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return <PostsList posts={posts} />;
}
```

### Optimized Queries

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
  }
});

// Paginate results
const posts = await db.post.findMany({
  take: 10,
  skip: page * 10,
  orderBy: { createdAt: 'desc' }
});
```

## GraphQL Queries

```typescript
import { gql } from '@apollo/client';
import { getClient } from '@/lib/apollo-client';

const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      title
      author {
        name
      }
    }
  }
`;

export default async function PostsPage() {
  const client = getClient();
  const { data } = await client.query({
    query: GET_POSTS
  });

  return <PostsList posts={data.posts} />;
}
```

## Error Handling

### With try-catch

```typescript
export default async function PostPage({ params }: { params: { id: string } }) {
  try {
    const post = await getPost(params.id);
    return <Post data={post} />;
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error; // Caught by error.tsx
  }
}
```

### Using notFound()

```typescript
import { notFound } from 'next/navigation';

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    notFound(); // Renders not-found.tsx
  }

  return <Post data={post} />;
}
```

## Search Params

### Reading Search Params

```typescript
interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function PostsPage({ searchParams }: PageProps) {
  const query = searchParams.q as string | undefined;
  const category = searchParams.category as string | undefined;

  const posts = await getPosts({
    query,
    category
  });

  return (
    <div>
      <SearchBar defaultQuery={query} />
      <PostsList posts={posts} />
    </div>
  );
}
```

### Pagination with Search Params

```typescript
export default async function PostsPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;

  const [posts, total] = await Promise.all([
    getPosts({ page, limit }),
    getPostsCount()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <PostsList posts={posts} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
```

## Static Generation

### generateStaticParams

```typescript
// Generate static pages at build time
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

### With Dynamic Segments

```typescript
// app/posts/[category]/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    category: post.category,
    slug: post.slug
  }));
}
```

## Incremental Static Regeneration (ISR)

```typescript
export const revalidate = 3600; // Revalidate every hour

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsList posts={posts} />;
}
```

### On-Demand Revalidation

```typescript
// app/api/revalidate/route.ts
import { revalidatePath } from 'next/cache';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  if (path) {
    revalidatePath(path);
    return Response.json({ revalidated: true, now: Date.now() });
  }

  return Response.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing path to revalidate'
  });
}
```

## Loading States

### Skeleton Components

```typescript
export function PostsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-1" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      ))}
    </div>
  );
}
```

### loading.tsx

```typescript
// app/posts/loading.tsx
export default function Loading() {
  return <PostsSkeleton />;
}
```

## Best Practices

1. **Use Parallel Fetching**: Fetch independent data in parallel with Promise.all
2. **Implement Streaming**: Use Suspense for progressive loading
3. **Cache Strategically**: Choose appropriate cache settings for each request
4. **Handle Errors**: Implement proper error boundaries and fallbacks
5. **Optimize Queries**: Select only needed fields from database
6. **Use Static Generation**: Pre-render pages when possible with generateStaticParams
7. **Implement ISR**: Use revalidate for automatic cache invalidation
8. **Type Safety**: Define proper types for all data fetching functions

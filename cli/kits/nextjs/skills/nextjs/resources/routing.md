# Routing and Navigation

Comprehensive guide to Next.js App Router routing patterns.

## File-Based Routing

### Route Structure

```
app/
├── page.tsx                    # / (home)
├── about/
│   └── page.tsx               # /about
├── posts/
│   ├── page.tsx               # /posts
│   ├── [id]/
│   │   └── page.tsx           # /posts/:id
│   └── [category]/
│       └── [slug]/
│           └── page.tsx       # /posts/:category/:slug
└── (marketing)/
    ├── pricing/
    │   └── page.tsx           # /pricing (grouped without path segment)
    └── features/
        └── page.tsx           # /features
```

## Special Files

### page.tsx

Defines the UI for a route:

```typescript
export default function PostsPage() {
  return <div>Posts page</div>;
}
```

### layout.tsx

Shared UI that wraps pages:

```typescript
export default function PostsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <PostsHeader />
      {children}
      <PostsFooter />
    </div>
  );
}
```

### template.tsx

Similar to layout but creates new instance on navigation:

```typescript
export default function PostsTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="posts-wrapper">{children}</div>;
}
```

### loading.tsx

Loading UI for route segment:

```typescript
export default function Loading() {
  return <Skeleton />;
}
```

### error.tsx

Error boundary for route segment:

```typescript
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### not-found.tsx

404 UI:

```typescript
export default function NotFound() {
  return <div>404 - Page not found</div>;
}
```

## Dynamic Routes

### Single Dynamic Segment

```typescript
// app/posts/[id]/page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  return <div>Post ID: {id}</div>;
}
```

### Multiple Dynamic Segments

```typescript
// app/posts/[category]/[slug]/page.tsx
interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

export default async function PostPage({ params }: PageProps) {
  const { category, slug } = await params;
  return (
    <div>
      Category: {category}, Slug: {slug}
    </div>
  );
}
```

### Catch-All Segments

```typescript
// app/docs/[...slug]/page.tsx
interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: PageProps) {
  const { slug } = await params;
  // /docs/a/b/c -> slug = ['a', 'b', 'c']
  return <div>Path: {slug.join('/')}</div>;
}
```

### Optional Catch-All Segments

```typescript
// app/shop/[[...categories]]/page.tsx
interface PageProps {
  params: Promise<{ categories?: string[] }>;
}

export default async function ShopPage({ params }: PageProps) {
  const { categories } = await params;
  // /shop -> categories = undefined
  // /shop/clothes -> categories = ['clothes']
  // /shop/clothes/shirts -> categories = ['clothes', 'shirts']
  return <div>Categories: {categories?.join('/') || 'All'}</div>;
}
```

## Route Groups

Group routes without affecting URL structure:

```
app/
├── (marketing)/
│   ├── layout.tsx          # Marketing layout
│   ├── about/
│   │   └── page.tsx       # /about
│   └── contact/
│       └── page.tsx       # /contact
└── (shop)/
    ├── layout.tsx          # Shop layout
    ├── products/
    │   └── page.tsx       # /products
    └── cart/
        └── page.tsx       # /cart
```

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <MarketingNav />
      {children}
    </div>
  );
}
```

## Parallel Routes

Render multiple pages in the same layout:

```
app/
├── @analytics/
│   └── page.tsx
├── @team/
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

```typescript
// app/layout.tsx
export default function Layout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      <div>{children}</div>
      <div>{analytics}</div>
      <div>{team}</div>
    </div>
  );
}
```

## Intercepting Routes

Intercept routes and display in modal:

```
app/
├── feed/
│   └── page.tsx
├── @modal/
│   └── (..)photo/
│       └── [id]/
│           └── page.tsx
└── photo/
    └── [id]/
        └── page.tsx
```

```typescript
// app/@modal/(..)photo/[id]/page.tsx
export default async function PhotoModal({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <Modal><Photo id={id} /></Modal>;
}

// app/photo/[id]/page.tsx (for direct navigation)
export default async function PhotoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  return <Photo id={id} />;
}
```

## Navigation

### Link Component

```typescript
import Link from 'next/link';

// Basic link
<Link href="/posts">Posts</Link>

// Dynamic route
<Link href={`/posts/${post.id}`}>View Post</Link>

// With search params
<Link href={{ pathname: '/posts', query: { category: 'tech' } }}>
  Tech Posts
</Link>

// Prefetching control
<Link href="/posts" prefetch={false}>Posts</Link>
```

### Programmatic Navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';

export function LoginButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/login')}>
      Login
    </button>
  );
}
```

### Router Methods

```typescript
'use client';

import { useRouter } from 'next/navigation';

export function NavigationExample() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push('/posts')}>Push</button>
      <button onClick={() => router.replace('/posts')}>Replace</button>
      <button onClick={() => router.back()}>Back</button>
      <button onClick={() => router.forward()}>Forward</button>
      <button onClick={() => router.refresh()}>Refresh</button>
      <button onClick={() => router.prefetch('/posts')}>Prefetch</button>
    </div>
  );
}
```

## Pathname and Params

### usePathname

```typescript
'use client';

import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname(); // e.g., /posts/123

  return (
    <nav>
      <Link
        href="/posts"
        className={pathname === '/posts' ? 'active' : ''}
      >
        Posts
      </Link>
    </nav>
  );
}
```

### useParams

```typescript
'use client';

import { useParams } from 'next/navigation';

export function PostActions() {
  const params = useParams(); // { id: '123' }

  return <div>Post ID: {params.id}</div>;
}
```

### useSearchParams

```typescript
'use client';

import { useSearchParams } from 'next/navigation';

export function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q'); // ?q=hello

  return <div>Searching for: {query}</div>;
}
```

## Middleware

### Basic Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone and modify headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: '/posts/:path*'
};
```

### Authentication Middleware

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
};
```

### Redirects

```typescript
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/old-posts') {
    return NextResponse.redirect(new URL('/posts', request.url));
  }

  return NextResponse.next();
}
```

### Rewrite

```typescript
export function middleware(request: NextRequest) {
  // Rewrite /blog/* to /posts/*
  if (request.nextUrl.pathname.startsWith('/blog')) {
    return NextResponse.rewrite(
      new URL(request.nextUrl.pathname.replace('/blog', '/posts'), request.url)
    );
  }

  return NextResponse.next();
}
```

## Redirects

### In Server Components

```typescript
import { redirect } from 'next/navigation';

export default async function PostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post.published) {
    redirect('/posts');
  }

  return <Post data={post} />;
}
```

### In Server Actions

```typescript
'use server';

import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const post = await db.post.create({
    data: { title: formData.get('title') as string }
  });

  redirect(`/posts/${post.id}`);
}
```

### Permanent Redirects

```typescript
import { permanentRedirect } from 'next/navigation';

export default async function OldPostPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  permanentRedirect(`/posts/${id}`);
}
```

## Route Handlers (API Routes)

### Basic Handler

```typescript
// app/api/posts/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const posts = await getPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const body = await request.json();
  const post = await createPost(body);
  return NextResponse.json({ post }, { status: 201 });
}
```

### Dynamic Route Handler

```typescript
// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const post = await getPost(params.id);

  if (!post) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ post });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const post = await updatePost(params.id, body);
  return NextResponse.json({ post });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await deletePost(params.id);
  return new NextResponse(null, { status: 204 });
}
```

### Headers and Cookies

```typescript
import { cookies, headers } from 'next/headers';

export async function GET() {
  // Read headers
  const headersList = headers();
  const userAgent = headersList.get('user-agent');

  // Read cookies
  const cookieStore = cookies();
  const token = cookieStore.get('token');

  return NextResponse.json({ userAgent, token });
}

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });

  // Set cookie
  response.cookies.set('token', 'abc123', {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 // 1 day
  });

  return response;
}
```

## Best Practices

1. **Use File-Based Routing**: Leverage Next.js conventions for organization
2. **Group Related Routes**: Use route groups to share layouts
3. **Implement Error Boundaries**: Add error.tsx for graceful error handling
4. **Use Loading States**: Create loading.tsx for better UX
5. **Type Route Params**: Always define types for params and searchParams
6. **Prefetch Links**: Use Link component for automatic prefetching
7. **Middleware for Auth**: Implement authentication checks in middleware
8. **Handle 404s**: Create not-found.tsx for custom 404 pages

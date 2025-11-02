# Server Actions Guide

Comprehensive patterns for Next.js Server Actions.

## What are Server Actions?

Server Actions are asynchronous functions that run on the server. They can be called from Client or Server Components.

```typescript
'use server';

export async function createPost(formData: FormData) {
  // Runs on server
  const title = formData.get('title') as string;
  await db.post.create({ data: { title } });
}
```

## Form Actions

### Basic Form Action

```typescript
// app/actions/posts.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const postSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(10)
});

export async function createPost(formData: FormData) {
  const validatedFields = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content')
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed'
    };
  }

  const { title, content } = validatedFields.data;

  try {
    await db.post.create({
      data: { title, content, published: false }
    });
  } catch (error) {
    return {
      message: 'Database Error: Failed to create post'
    };
  }

  revalidatePath('/posts');
  redirect('/posts');
}
```

### Using in Forms

```typescript
// app/posts/new/page.tsx
import { createPost } from '@/app/actions/posts';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required />
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" required />
      </div>
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## Client Component Integration

### With useFormState

```typescript
// app/actions/posts.ts
'use server';

export type FormState = {
  errors?: {
    title?: string[];
    content?: string[];
  };
  message?: string;
};

export async function createPost(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = postSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content')
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing fields'
    };
  }

  // Create post...
  return { message: 'Post created successfully' };
}
```

```typescript
// components/CreatePostForm.tsx
'use client';

import { useFormState } from 'react-dom';
import { createPost } from '@/app/actions/posts';

const initialState = { message: '', errors: {} };

export function CreatePostForm() {
  const [state, formAction] = useFormState(createPost, initialState);

  return (
    <form action={formAction}>
      <div>
        <label htmlFor="title">Title</label>
        <input id="title" name="title" />
        {state.errors?.title && (
          <p className="error">{state.errors.title[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="content">Content</label>
        <textarea id="content" name="content" />
        {state.errors?.content && (
          <p className="error">{state.errors.content[0]}</p>
        )}
      </div>
      {state.message && <p>{state.message}</p>}
      <button type="submit">Create Post</button>
    </form>
  );
}
```

### With useFormStatus

```typescript
'use client';

import { useFormStatus } from 'react-dom';

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? 'Submitting...' : label}
    </button>
  );
}

// Usage in form
export function CreatePostForm() {
  return (
    <form action={createPost}>
      {/* form fields */}
      <SubmitButton label="Create Post" />
    </form>
  );
}
```

## Non-Form Actions

### Programmatic Invocation

```typescript
// app/actions/posts.ts
'use server';

export async function deletePost(postId: string) {
  await db.post.delete({
    where: { id: postId }
  });

  revalidatePath('/posts');
}

export async function publishPost(postId: string) {
  await db.post.update({
    where: { id: postId },
    data: { published: true, publishedAt: new Date() }
  });

  revalidatePath('/posts');
  revalidatePath(`/posts/${postId}`);
}
```

```typescript
// components/PostActions.tsx
'use client';

import { deletePost, publishPost } from '@/app/actions/posts';
import { useRouter } from 'next/navigation';

export function PostActions({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure?')) {
      await deletePost(postId);
      router.push('/posts');
    }
  };

  const handlePublish = async () => {
    await publishPost(postId);
  };

  return (
    <div>
      <button onClick={handlePublish}>Publish</button>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}
```

## Authentication and Authorization

### Checking User Session

```typescript
'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const post = await db.post.create({
    data: {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      authorId: session.user.id
    }
  });

  revalidatePath('/posts');
  return { success: true, postId: post.id };
}
```

### Role-Based Actions

```typescript
'use server';

export async function deletePost(postId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error('Not authenticated');
  }

  const post = await db.post.findUnique({
    where: { id: postId }
  });

  if (post.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    throw new Error('Not authorized');
  }

  await db.post.delete({
    where: { id: postId }
  });

  revalidatePath('/posts');
}
```

## Error Handling

### Try-Catch Pattern

```typescript
'use server';

export async function createPost(formData: FormData) {
  try {
    const post = await db.post.create({
      data: {
        title: formData.get('title') as string,
        content: formData.get('content') as string
      }
    });

    revalidatePath('/posts');
    return { success: true, post };
  } catch (error) {
    console.error('Failed to create post:', error);
    return {
      success: false,
      error: 'Failed to create post. Please try again.'
    };
  }
}
```

### Custom Error Types

```typescript
class PostNotFoundError extends Error {
  constructor(postId: string) {
    super(`Post ${postId} not found`);
    this.name = 'PostNotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor() {
    super('You are not authorized to perform this action');
    this.name = 'UnauthorizedError';
  }
}

export async function updatePost(postId: string, data: PostUpdate) {
  const session = await auth();
  if (!session) throw new UnauthorizedError();

  const post = await db.post.findUnique({ where: { id: postId } });
  if (!post) throw new PostNotFoundError(postId);

  if (post.authorId !== session.user.id) {
    throw new UnauthorizedError();
  }

  return await db.post.update({
    where: { id: postId },
    data
  });
}
```

## Optimistic Updates

### Client-Side Optimistic Update

```typescript
'use client';

import { useState, useTransition } from 'react';
import { likePost } from '@/app/actions/posts';

export function LikeButton({ postId, initialLikes }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    // Optimistic update
    setLikes(prev => prev + 1);

    startTransition(async () => {
      try {
        const result = await likePost(postId);
        setLikes(result.likes); // Update with server value
      } catch (error) {
        // Rollback on error
        setLikes(prev => prev - 1);
      }
    });
  };

  return (
    <button onClick={handleLike} disabled={isPending}>
      ❤️ {likes}
    </button>
  );
}
```

## File Uploads

### Handling File Uploads

```typescript
'use server';

import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File;

  if (!file) {
    return { error: 'No file uploaded' };
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Save to public directory
  const path = join(process.cwd(), 'public/uploads', file.name);
  await writeFile(path, buffer);

  return { success: true, path: `/uploads/${file.name}` };
}
```

### With Image Upload

```typescript
'use server';

import { put } from '@vercel/blob';

export async function createPostWithImage(formData: FormData) {
  const file = formData.get('coverImage') as File;
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  let imageUrl = '';

  if (file && file.size > 0) {
    const blob = await put(file.name, file, {
      access: 'public'
    });
    imageUrl = blob.url;
  }

  const post = await db.post.create({
    data: {
      title,
      content,
      coverImage: imageUrl
    }
  });

  revalidatePath('/posts');
  redirect(`/posts/${post.id}`);
}
```

## Revalidation Strategies

### Path Revalidation

```typescript
import { revalidatePath } from 'next/cache';

// Revalidate specific page
revalidatePath('/posts');

// Revalidate dynamic route
revalidatePath(`/posts/${postId}`);

// Revalidate layout
revalidatePath('/posts', 'layout');
```

### Tag Revalidation

```typescript
import { revalidateTag } from 'next/cache';

// In fetch
fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
});

// Revalidate
revalidateTag('posts');
```

## Best Practices

1. **Always use 'use server'**: Mark Server Actions with the directive
2. **Validate Input**: Use Zod or similar for validation
3. **Handle Errors**: Always wrap in try-catch
4. **Type Safety**: Define proper return types
5. **Revalidate**: Call revalidatePath/revalidateTag after mutations
6. **Security**: Check authentication and authorization
7. **Progressive Enhancement**: Forms work without JavaScript
8. **Optimistic Updates**: Use for better UX on user actions

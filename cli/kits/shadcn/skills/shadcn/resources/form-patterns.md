# Form Patterns

Advanced form patterns with react-hook-form and shadcn/ui.

## Form Validation

### Zod Schema

```typescript
import * as z from 'zod';

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  category: z.string(),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  published: z.boolean(),
  publishedAt: z.date().optional()
});
```

### Complex Forms

```typescript
const form = useForm<z.infer<typeof postSchema>>({
  resolver: zodResolver(postSchema),
  defaultValues: {
    title: '',
    content: '',
    category: '',
    tags: [],
    published: false
  }
});
```

## Field Arrays

```typescript
import { useFieldArray } from 'react-hook-form';

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: 'tags'
});

// Add field
<Button type="button" onClick={() => append({ value: '' })}>
  Add Tag
</Button>

// Render fields
{fields.map((field, index) => (
  <div key={field.id}>
    <Input {...form.register(`tags.${index}.value`)} />
    <Button onClick={() => remove(index)}>Remove</Button>
  </div>
))}
```

## Async Validation

```typescript
const schema = z.object({
  username: z.string().refine(
    async (username) => {
      const available = await checkUsernameAvailable(username);
      return available;
    },
    { message: 'Username is already taken' }
  )
});
```

## Multi-Step Forms

```typescript
const [step, setStep] = useState(0);

const steps = [
  { title: 'Basic Info', fields: ['title', 'category'] },
  { title: 'Content', fields: ['content', 'tags'] },
  { title: 'Publish', fields: ['published', 'publishedAt'] }
];

const validateStep = async () => {
  const fields = steps[step].fields as (keyof typeof form.formState.errors)[];
  const valid = await form.trigger(fields);
  return valid;
};

const nextStep = async () => {
  const valid = await validateStep();
  if (valid) setStep(step + 1);
};
```

## Dependent Fields

```typescript
const category = form.watch('category');

<FormField
  control={form.control}
  name="subcategory"
  render={({ field }) => (
    <Select {...field} disabled={!category}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {getSubcategories(category).map(sub => (
          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>
```

## Form State

```typescript
const {
  formState: { errors, isSubmitting, isDirty, isValid }
} = form;

<Button
  type="submit"
  disabled={isSubmitting || !isDirty || !isValid}
>
  {isSubmitting ? 'Saving...' : 'Save Post'}
</Button>
```

## Error Handling

```typescript
const onSubmit = async (values: z.infer<typeof postSchema>) => {
  try {
    await createPost(values);
    toast({ title: 'Success', description: 'Post created' });
  } catch (error) {
    form.setError('root', {
      message: 'Failed to create post. Please try again.'
    });
  }
};

// Display root error
{form.formState.errors.root && (
  <Alert variant="destructive">
    <AlertDescription>
      {form.formState.errors.root.message}
    </AlertDescription>
  </Alert>
)}
```

## Reset and Defaults

```typescript
// Reset to defaults
form.reset();

// Reset to specific values
form.reset({
  title: post.title,
  content: post.content
});

// Reset single field
form.resetField('title');
```

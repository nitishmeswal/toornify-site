import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'blog',
  title: 'Blogs',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      validation: (rule) => rule.required().max(50),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(250),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              { title: 'Underline', value: 'underline' },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Technology', value: 'technology' },
          { title: 'Gaming', value: 'gaming' },
          { title: 'Esports', value: 'esports' },
          { title: 'Tournaments', value: 'tournaments' },
          { title: 'News', value: 'news' },
          { title: 'Guides', value: 'guides' },
        ],
      },
      validation: (rule) => rule.required().max(3),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) =>
        rule.max(10).custom((tags) => {
          if (!tags) return true;
          return (tags as string[]).every((tag: string) => tag.length <= 30)
            ? true
            : 'Each tag must be 30 characters or less';
        }),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: 'Main publish datetime. Set future time to schedule publishing.',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'modifiedAt',
      title: 'Modified at (optional)',
      type: 'datetime',
      description: 'Set when you update this blog and want to display modified date instead of published date.',
    }),
    defineField({
      name: 'scheduledAt',
      title: 'Schedule for (optional)',
      type: 'datetime',
      description: 'Optional scheduled datetime. If set, this post should appear only after this time.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'Show this post on the homepage',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      modifiedAt: 'modifiedAt',
      publishedAt: 'publishedAt',
      scheduledAt: 'scheduledAt',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { author, modifiedAt, publishedAt, scheduledAt } = selection as {
        author?: string;
        modifiedAt?: string;
        publishedAt?: string;
        scheduledAt?: string;
      };

      const byline = author ? `by ${author}` : '';
      const scheduleLabel = modifiedAt
        ? `Modified: ${new Date(modifiedAt).toLocaleString()}`
        : scheduledAt
        ? `Scheduled: ${new Date(scheduledAt).toLocaleString()}`
        : publishedAt
          ? `Published: ${new Date(publishedAt).toLocaleString()}`
          : 'Draft';

      return {
        ...selection,
        subtitle: [byline, scheduleLabel].filter(Boolean).join(' • '),
      };
    },
  },
});

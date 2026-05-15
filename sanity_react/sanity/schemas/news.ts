import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().max(120),
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
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required().max(250),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      description: 'Optional external source link for this news item',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
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
      name: 'category',
      title: 'Category',
      type: 'string',
      description: 'Legacy single category field. Prefer using Categories below.',
      hidden: true,
      options: {
        list: [
          { title: 'Gaming', value: 'gaming' },
          { title: 'Esports', value: 'esports' },
          { title: 'Tournament', value: 'tournament' },
          { title: 'Update', value: 'update' },
        ],
      },
      initialValue: 'gaming',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Select categories for this news item. You can create a new category directly from this field in Studio.',
      of: [
        {
          type: 'reference',
          to: [{ type: 'category' }],
        },
      ],
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: 'Main publish datetime.',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'scheduledAt',
      title: 'Schedule for (optional)',
      type: 'datetime',
      description: 'If set to a future time, this news item should appear after that time.',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      firstCategory: 'categories.0.title',
      category: 'category',
      publishedAt: 'publishedAt',
      scheduledAt: 'scheduledAt',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { firstCategory, category, publishedAt, scheduledAt } = selection as {
        firstCategory?: string;
        category?: string;
        publishedAt?: string;
        scheduledAt?: string;
      };

      const categoryLabel = firstCategory || category;

      const scheduleLabel = scheduledAt
        ? `Scheduled: ${new Date(scheduledAt).toLocaleString()}`
        : publishedAt
          ? `Published: ${new Date(publishedAt).toLocaleString()}`
          : 'Draft';

      return {
        ...selection,
        subtitle: [categoryLabel, scheduleLabel].filter(Boolean).join(' • '),
      };
    },
  },
});

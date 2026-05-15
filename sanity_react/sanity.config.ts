import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

// Use env vars in browser, fallback to process.env for CLI
const projectId = 'gblobdeg';
const dataset = 'production';

export default defineConfig({
  name: 'default',
  title: 'Toornify CMS',

  projectId,
  dataset,

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  basePath: '/studio',
});

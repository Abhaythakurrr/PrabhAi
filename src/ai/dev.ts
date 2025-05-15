
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-news-article.ts';
import '@/ai/flows/generate-app-from-description.ts';
import '@/ai/flows/generate-image-from-description.ts';
import '@/ai/flows/generate-personalized-response.ts';
import '@/ai/flows/conduct-deep-research-flow.ts';
import '@/ai/flows/explain-prabh-internals-flow.ts'; // Added import for the new flow
import '@/ai/tools/news-tool.ts';

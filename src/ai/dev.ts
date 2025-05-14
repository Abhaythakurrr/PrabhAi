import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-news-article.ts';
import '@/ai/flows/generate-app-from-description.ts';
import '@/ai/flows/generate-image-from-description.ts';
import '@/ai/flows/generate-personalized-response.ts';
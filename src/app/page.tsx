
'use client';

import { mainNav } from '@/config/nav';
import { FeatureTile } from '@/components/prabh_ui/FeatureTile';

export default function DashboardPage() {
  /* Removed image generation logic and rendering function */
  /*
    if (error || src === "https://placehold.co/600x400.png") {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 rounded-lg">
          <ImageIconLucide className="h-16 w-16 text-muted-foreground" />
          {error && <p className="text-xs text-destructive mt-2 text-center p-1">{error.substring(0,100)}</p>}
        </div>
      );
    }
    return (
      <NextImage 
        src={src} 
        alt={alt}
        width={600} 
        height={400} 
        className="object-cover w-full h-full"
        data-ai-hint={hint}
        unoptimized={src.startsWith('data:')}
      />
    );
  };
*/

  return (
    <main className="p-6">
      <div className="feature-tile-grid">
        {mainNav.map((item) => (
          <FeatureTile
            key={item.title}
            title={item.title}
            icon={item.icon}
            colorAccent={item.colorAccent}
            href={item.href}
          />
        ))}
      </div>
    </main>
  );
}

// src/components/prabh_ui/FeatureTile.tsx
import Link from 'next/link'
import React from 'react';

interface FeatureTileProps {
  title: string;
  icon: React.ElementType;
  colorAccent?: string;
  href?: string;
}

export const FeatureTile: React.FC<FeatureTileProps> = ({
  title,
  icon: Icon,
  colorAccent = 'accent-cyan', // Default accent
  href = '#', // Default href
}) => {
  return (
    <Link href={href} passHref>
      <div className={`tile-card ${colorAccent}`}>
        <div className="tile-icon"> {/* Changed class name to tile-icon */}
          <Icon className="w-10 h-10 mx-auto" />
        </div>
        <h3 className="tile-title"> {/* Changed class name to tile-title */}
          {title}
        </h3>
        {/* Optional: Add placeholder for subtext here */}
        {/* <p className=\"subtext\">Explore, Learn, Create</p> */}
      </div>
    </Link>
  );
};

import React from 'react';
import { AppLogoIcon } from '@/components/layout/app-logo-icon';
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Settings } from 'lucide-react'; // Assuming you use lucide-react for icons
import { User } from 'lucide-react'; // Assuming you use lucide-react for icons
import { Phone } from 'lucide-react'; // Assuming you use lucide-react for icons

const Topbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex items-center">
        <AppLogoIcon />
        {/* You might want to add a site title next to the logo */}
        <span className="ml-2 text-xl font-semibold">PrabhAI</span>
      </div>

      {/* User Info Placeholder (Centered or towards right) */}
      <div className="flex items-center space-x-2">
        {/* Replace with actual user avatar and name */}
        <User className="h-6 w-6" />
        <span>User Name</span>
      </div>

      {/* Buttons on the right */}
      <div className="flex items-center space-x-4">
        {/* Call Button Placeholder */}
        <Button variant="ghost" size="icon">
          <Phone className="h-5 w-5" />
        </Button>

        {/* Settings Icon Placeholder */}
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Topbar;
'use client'; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react"; 

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl bg-card">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2 text-primary">
            <Settings className="h-6 w-6" /> 
            Prabh's Settings Panel
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            PrabhAI application settings and preferences. This area is currently under construction by Prabh's little helper bots.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-10">
            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin-slow" /> 
            <p className="text-lg text-muted-foreground">
              Settings Page - Coming Soon!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Prabh is working on allowing you to configure API keys, themes, and other cool stuff here!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

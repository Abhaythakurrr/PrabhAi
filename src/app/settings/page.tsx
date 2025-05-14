import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsIcon } from "lucide-react"; // Changed from Settings to SettingsIcon

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-primary" /> {/* Changed from Settings to SettingsIcon */}
            Settings
          </CardTitle>
          <CardDescription>
            Manage your PrabhAI application settings and preferences. This page is currently under construction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-10">
            <SettingsIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" /> {/* Changed from Settings to SettingsIcon */}
            <p className="text-lg text-muted-foreground">
              Settings page is coming soon!
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Here you will be able to configure application-wide preferences, API keys, and more.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

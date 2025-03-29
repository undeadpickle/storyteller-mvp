import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

interface StoryInitiationProps {
  onThemeSelected: (theme: string) => void;
}

const StoryInitiation: React.FC<StoryInitiationProps> = ({ onThemeSelected }) => {
  const themes = ['Fantasy', 'Space Adventure', 'Talking Animals', 'Mystery'];

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Choose a Story Theme</CardTitle>
        <CardDescription>Select a theme to begin your adventure!</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 justify-center">
        {themes.map(theme => (
          <Button key={theme} onClick={() => onThemeSelected(theme)} variant="outline" size="lg">
            {theme}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

export default StoryInitiation;

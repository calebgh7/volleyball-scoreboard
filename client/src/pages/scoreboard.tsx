import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import ScoreboardDisplay from "@/components/scoreboard-display";
import ControlPanel from "@/components/control-panel";
import SettingsModal from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Settings, Tv } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function Scoreboard() {
  const [isOverlayMode, setIsOverlayMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: currentMatch, isLoading } = useQuery({
    queryKey: ['/api/current-match'],
    refetchInterval: 1000, // Real-time updates
  });

  // Mutation to create a default match
  const createDefaultMatch = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeamId: 1, // Default EAGLES team
          awayTeamId: 2,  // Default TIGERS team
          format: 5, // 5-set match
          currentSet: 1,
          homeSetsWon: 0,
          awaySetsWon: 0,
          isComplete: false
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to create default match');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
    },
  });

  // Auto-create a default match if none exists
  useEffect(() => {
    if (!isLoading && !currentMatch) {
      createDefaultMatch.mutate();
    }
  }, [currentMatch, isLoading]);

  const openOverlayWindow = () => {
    const overlayUrl = `${window.location.origin}/?overlay=true`;
    window.open(overlayUrl, 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no');
  };

  if (isLoading || createDefaultMatch.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {createDefaultMatch.isPending ? "Setting up scoreboard..." : "Loading scoreboard..."}
          </p>
        </div>
      </div>
    );
  }

  const urlParams = new URLSearchParams(window.location.search);
  const isOverlay = urlParams.get('overlay') === 'true';

  if (isOverlay) {
    return (
      <div className="min-h-screen bg-transparent">
        <ScoreboardDisplay 
          data={currentMatch} 
          isOverlay={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-volleyball-ball text-primary-foreground text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">VolleyScore Pro</h1>
                <p className="text-sm text-muted-foreground">Live Streaming Scoreboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={openOverlayWindow}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Tv className="mr-2 h-4 w-4" />
                Overlay Mode
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Scoreboard Display */}
          <div>
            <ScoreboardDisplay data={currentMatch} />
          </div>
          
          {/* Control Panel */}
          <div>
            <ControlPanel data={currentMatch} />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

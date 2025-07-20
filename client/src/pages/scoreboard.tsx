import { useState } from "react";
import ScoreboardDisplay from "@/components/scoreboard-display";
import ControlPanel from "@/components/control-panel";
import SettingsModal from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Settings, Tv, RotateCcw } from "lucide-react";

export default function Scoreboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Local state for the match data - no API needed
  const [matchData] = useState({
    match: {
      id: 1,
      homeTeamId: 1,
      awayTeamId: 2,
      format: 5,
      currentSet: 1,
      homeSetsWon: 0,
      awaySetsWon: 0,
      isComplete: false,
      setHistory: []
    },
    homeTeam: {
      id: 1,
      name: "EAGLES",
      location: "Central High",
      logoPath: null,
      primaryColor: "#1565C0",
      secondaryColor: "#90CAF9"
    },
    awayTeam: {
      id: 2,
      name: "TIGERS",
      location: "North Valley", 
      logoPath: null,
      primaryColor: "#1565C0",
      secondaryColor: "#90CAF9"
    },
    gameState: {
      id: 1,
      matchId: 1,
      homeScore: 0,
      awayScore: 0,
      currentSet: 1,
      isSetComplete: false,
      timestamp: new Date().toISOString()
    }
  });

  const openOverlayWindow = () => {
    const overlayUrl = `${window.location.origin}/?overlay=true`;
    window.open(overlayUrl, 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no');
  };

  const urlParams = new URLSearchParams(window.location.search);
  const isOverlay = urlParams.get('overlay') === 'true';

  if (isOverlay) {
    return (
      <div className="min-h-screen bg-transparent">
        <ScoreboardDisplay 
          data={matchData} 
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
                <span className="text-primary-foreground text-lg font-bold">🏐</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">VolleyScore Pro</h1>
                <p className="text-sm text-muted-foreground">Live Streaming Scoreboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
                className="text-foreground"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New Game
              </Button>
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
                className="text-foreground"
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
            <ScoreboardDisplay data={matchData} />
          </div>
          
          {/* Control Panel */}
          <div>
            <ControlPanel data={matchData} />
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

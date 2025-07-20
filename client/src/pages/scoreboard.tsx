import { useState } from "react";
import ScoreboardDisplay from "@/components/scoreboard-display";
import ControlPanel from "@/components/control-panel";
import SettingsModal from "@/components/settings-modal";
import { Button } from "@/components/ui/button";
import { Settings, Tv, RotateCcw } from "lucide-react";

export default function Scoreboard() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Local state for the match data - no API needed
  const [matchData, setMatchData] = useState({
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

  // Function to update scores that we'll pass to the control panel
  const updateScore = (team: 'home' | 'away', increment: boolean) => {
    setMatchData(prev => {
      const currentScore = team === 'home' ? prev.gameState.homeScore : prev.gameState.awayScore;
      
      if (!increment && currentScore <= 0) return prev;
      
      const newScore = increment ? currentScore + 1 : currentScore - 1;
      
      return {
        ...prev,
        gameState: {
          ...prev.gameState,
          [team === 'home' ? 'homeScore' : 'awayScore']: newScore,
          timestamp: new Date().toISOString()
        }
      };
    });
  };

  // Function to update team information
  const updateTeam = (team: 'home' | 'away', field: string, value: string) => {
    setMatchData(prev => ({
      ...prev,
      [team === 'home' ? 'homeTeam' : 'awayTeam']: {
        ...prev[team === 'home' ? 'homeTeam' : 'awayTeam'],
        [field]: value
      }
    }));
  };

  // Function to update sets won
  const updateSetsWon = (team: 'home' | 'away', value: number) => {
    setMatchData(prev => ({
      ...prev,
      match: {
        ...prev.match,
        [team === 'home' ? 'homeSetsWon' : 'awaySetsWon']: value
      }
    }));
  };

  // Function to update team logo
  const updateLogo = (teamId: number, logoUrl: string) => {
    setMatchData(prev => {
      const isHomeTeam = teamId === prev.homeTeam.id;
      return {
        ...prev,
        [isHomeTeam ? 'homeTeam' : 'awayTeam']: {
          ...prev[isHomeTeam ? 'homeTeam' : 'awayTeam'],
          logoPath: logoUrl
        }
      };
    });
  };

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
                className="text-white bg-red-600 border-red-600 hover:bg-red-700 hover:border-red-700"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                New Game
              </Button>
              <Button 
                onClick={openOverlayWindow}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Tv className="mr-2 h-4 w-4" />
                Overlay Mode
              </Button>
              <Button 
                variant="outline"
                onClick={() => setIsSettingsOpen(true)}
                className="text-white bg-green-600 border-green-600 hover:bg-green-700 hover:border-green-700"
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
            <ControlPanel 
              data={matchData} 
              onScoreUpdate={updateScore}
              onTeamUpdate={updateTeam}
              onSetsWonUpdate={updateSetsWon}
              onLogoUpdate={updateLogo}
            />
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

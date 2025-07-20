import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { incrementScore, decrementScore, resetCurrentSet, completeSet } from "@/lib/scoreboard-state";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import LogoUpload from "./logo-upload";
import { Gamepad2, Users, Settings, Radio, Plus, Minus, Check, RotateCcw, Save, ExternalLink, Download, Upload } from "lucide-react";

interface ControlPanelProps {
  data: any;
  onScoreUpdate?: (team: 'home' | 'away', increment: boolean) => void;
  onTeamUpdate?: (team: 'home' | 'away', field: string, value: string) => void;
  onSetsWonUpdate?: (team: 'home' | 'away', value: number) => void;
  onLogoUpdate?: (teamId: number, logoUrl: string) => void;
}

export default function ControlPanel({ data, onScoreUpdate, onTeamUpdate, onSetsWonUpdate, onLogoUpdate }: ControlPanelProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No active match</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { match, homeTeam, awayTeam, gameState } = data;

  const handleScoreChange = async (team: 'home' | 'away', increment: boolean) => {
    try {
      setIsUpdating(true);
      
      if (onScoreUpdate) {
        // Use the passed function to update scores
        onScoreUpdate(team, increment);
        toast({
          title: "Score Updated",
          description: `${team === 'home' ? homeTeam.name : awayTeam.name} score ${increment ? 'increased' : 'decreased'}`,
          variant: "default",
        });
      } else {
        // Fallback message if no update function provided
        toast({
          title: "Note",
          description: "Score update function not available",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetSet = async () => {
    try {
      setIsUpdating(true);
      console.log('Reset button clicked, match data:', { match, gameState });
      
      if (!match?.id) {
        throw new Error('No valid match ID found');
      }
      
      await resetCurrentSet(match.id);
      toast({
        title: "Success",
        description: "Set scores reset to 0-0",
        duration: 2000
      });
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Error",
        description: `Failed to reset scores: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 4000
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteSet = async () => {
    try {
      await completeSet(
        match.id, 
        gameState.homeScore, 
        gameState.awayScore, 
        match.currentSet, 
        match.setHistory
      );
      toast({
        title: "Success",
        description: "Set completed",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete set",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handleTeamUpdate = async (teamId: number, field: string, value: string) => {
    try {
      if (onTeamUpdate) {
        // Determine which team based on teamId
        const team = teamId === data.homeTeam?.id ? 'home' : 'away';
        onTeamUpdate(team, field, value);
        toast({
          title: "Success",
          description: "Team updated",
          duration: 2000
        });
      } else {
        toast({
          title: "Note",
          description: "Team update function not available",
          variant: "default",
          duration: 2000
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handleDisplayOptionChange = async (option: string, value: boolean) => {
    try {
      const newOptions = { ...gameState.displayOptions, [option]: value };
      await apiRequest('PATCH', `/api/game-state/${match.id}`, { 
        displayOptions: newOptions 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display options",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handleMatchFormatChange = async (format: string) => {
    try {
      await apiRequest('PATCH', `/api/matches/${match.id}`, { 
        format: parseInt(format) 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/current-match'] });
      toast({
        title: "Success",
        description: `Match format changed to best of ${format}`,
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update match format",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handleSetsWonChange = async (team: 'home' | 'away', value: number) => {
    try {
      if (onSetsWonUpdate) {
        onSetsWonUpdate(team, Math.max(0, Math.min(5, value)));
        toast({
          title: "Success",
          description: "Sets won updated",
          duration: 2000
        });
      } else {
        toast({
          title: "Note",
          description: "Sets won update function not available",
          variant: "default",
          duration: 2000
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sets won",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const openOverlayWindow = () => {
    const overlayUrl = `${window.location.origin}/?overlay=true`;
    window.open(overlayUrl, 'Scoreboard Overlay', 'width=1920,height=1080,toolbar=no,menubar=no,scrollbars=no,status=no');
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Score Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gamepad2 className="mr-2 h-5 w-5 text-primary" />
            Score Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Home Team Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">{homeTeam?.name || 'HOME'}</span>
              <span className="text-2xl font-condensed font-bold text-primary">
                {gameState?.homeScore || 0}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleScoreChange('home', true)}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Point
              </Button>
              <Button 
                onClick={() => handleScoreChange('home', false)}
                disabled={isUpdating}
                className="bg-red-600 hover:bg-red-700 text-white py-3"
              >
                <Minus className="mr-2 h-4 w-4" />
                Remove Point
              </Button>
            </div>
          </div>
          
          {/* Away Team Controls */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">{awayTeam?.name || 'AWAY'}</span>
              <span className="text-2xl font-condensed font-bold text-primary">
                {gameState?.awayScore || 0}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleScoreChange('away', true)}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700 text-white py-3"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Point
              </Button>
              <Button 
                onClick={() => handleScoreChange('away', false)}
                disabled={isUpdating}
                className="bg-red-600 hover:bg-red-700 text-white py-3"
              >
                <Minus className="mr-2 h-4 w-4" />
                Remove Point
              </Button>
            </div>
          </div>
          
          {/* Sets Won Control */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Sets Won</span>
              <div className="text-lg font-condensed font-bold">
                <span className="text-primary">{match.homeSetsWon}</span>
                <span className="mx-2 text-gray-400">-</span>
                <span className="text-primary">{match.awaySetsWon}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <Label className="text-xs text-gray-600">Home Sets</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={match.homeSetsWon}
                  onChange={(e) => handleSetsWonChange('home', parseInt(e.target.value) || 0)}
                  className="text-center mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">Away Sets</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={match.awaySetsWon}
                  onChange={(e) => handleSetsWonChange('away', parseInt(e.target.value) || 0)}
                  className="text-center mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleCompleteSet}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Check className="mr-2 h-4 w-4" />
                End Set
              </Button>
              <Button 
                onClick={handleResetSet}
                disabled={isUpdating}
                className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500 disabled:opacity-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {isUpdating ? 'Resetting...' : 'Reset'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Team Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Team Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Home Team Setup */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Home Team</Label>
            <Input 
              value={homeTeam?.name || ''}
              onChange={(e) => handleTeamUpdate(homeTeam?.id, 'name', e.target.value)}
              placeholder="Team Name"
              className="mb-2"
            />
            <Input 
              value={homeTeam?.location || ''}
              onChange={(e) => handleTeamUpdate(homeTeam?.id, 'location', e.target.value)}
              placeholder="School/Location"
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-600">Primary Color</Label>
                <div className="flex gap-1">
                  <Input 
                    type="color"
                    value={homeTeam?.primaryColor || '#1565C0'}
                    onChange={(e) => handleTeamUpdate(homeTeam?.id, 'primaryColor', e.target.value)}
                    className="h-10 w-16 p-1 flex-shrink-0"
                  />
                  <Input 
                    type="text"
                    value={homeTeam?.primaryColor || '#1565C0'}
                    onChange={(e) => handleTeamUpdate(homeTeam?.id, 'primaryColor', e.target.value)}
                    placeholder="#1565C0"
                    className="h-10 flex-1 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Secondary Color</Label>
                <div className="flex gap-1">
                  <Input 
                    type="color"
                    value={homeTeam?.secondaryColor || '#90CAF9'}
                    onChange={(e) => handleTeamUpdate(homeTeam?.id, 'secondaryColor', e.target.value)}
                    className="h-10 w-16 p-1 flex-shrink-0"
                  />
                  <Input 
                    type="text"
                    value={homeTeam?.secondaryColor || '#90CAF9'}
                    onChange={(e) => handleTeamUpdate(homeTeam?.id, 'secondaryColor', e.target.value)}
                    placeholder="#90CAF9"
                    className="h-10 flex-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Away Team Setup */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Away Team</Label>
            <Input 
              value={awayTeam?.name || ''}
              onChange={(e) => handleTeamUpdate(awayTeam?.id, 'name', e.target.value)}
              placeholder="Team Name"
              className="mb-2"
            />
            <Input 
              value={awayTeam?.location || ''}
              onChange={(e) => handleTeamUpdate(awayTeam?.id, 'location', e.target.value)}
              placeholder="School/Location"
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-600">Primary Color</Label>
                <div className="flex gap-1">
                  <Input 
                    type="color"
                    value={awayTeam?.primaryColor || '#1565C0'}
                    onChange={(e) => handleTeamUpdate(awayTeam?.id, 'primaryColor', e.target.value)}
                    className="h-10 w-16 p-1 flex-shrink-0"
                  />
                  <Input 
                    type="text"
                    value={awayTeam?.primaryColor || '#1565C0'}
                    onChange={(e) => handleTeamUpdate(awayTeam?.id, 'primaryColor', e.target.value)}
                    placeholder="#1565C0"
                    className="h-10 flex-1 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Secondary Color</Label>
                <div className="flex gap-1">
                  <Input 
                    type="color"
                    value={awayTeam?.secondaryColor || '#90CAF9'}
                    onChange={(e) => handleTeamUpdate(awayTeam?.id, 'secondaryColor', e.target.value)}
                    className="h-10 w-16 p-1 flex-shrink-0"
                  />
                  <Input 
                    type="text"
                    value={awayTeam?.secondaryColor || '#90CAF9'}
                    onChange={(e) => handleTeamUpdate(awayTeam?.id, 'secondaryColor', e.target.value)}
                    placeholder="#90CAF9"
                    className="h-10 flex-1 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Logo Upload Zones */}
          <div className="grid grid-cols-2 gap-4">
            <LogoUpload 
              teamId={homeTeam?.id} 
              currentLogo={homeTeam?.logoPath}
              label="Home Logo"
              onLogoUpdate={onLogoUpdate}
            />
            <LogoUpload 
              teamId={awayTeam?.id} 
              currentLogo={awayTeam?.logoPath}
              label="Away Logo"
              onLogoUpdate={onLogoUpdate}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Match Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5 text-primary" />
            Match Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Match Format */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Match Format</Label>
            <Select value={match.format.toString()} onValueChange={handleMatchFormatChange}>
              <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="3" className="text-gray-900 hover:bg-gray-100">Best of 3 Sets</SelectItem>
                <SelectItem value="5" className="text-gray-900 hover:bg-gray-100">Best of 5 Sets</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Display Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showSetHistory"
                checked={gameState?.displayOptions?.showSetHistory}
                onCheckedChange={(checked) => handleDisplayOptionChange('showSetHistory', !!checked)}
              />
              <Label htmlFor="showSetHistory" className="text-sm text-gray-700">
                Show Set History
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showSponsors"
                checked={gameState?.displayOptions?.showSponsors}
                onCheckedChange={(checked) => handleDisplayOptionChange('showSponsors', !!checked)}
              />
              <Label htmlFor="showSponsors" className="text-sm text-gray-700">
                Show Sponsor Logo
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="showTimer"
                checked={gameState?.displayOptions?.showTimer}
                onCheckedChange={(checked) => handleDisplayOptionChange('showTimer', !!checked)}
              />
              <Label htmlFor="showTimer" className="text-sm text-gray-700">
                Show Match Timer
              </Label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Match
            </Button>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Export & Streaming */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Radio className="mr-2 h-5 w-5 text-primary" />
            Streaming Options
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={openOverlayWindow}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Overlay Window
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p><strong>Streaming Tip:</strong> Use the overlay window as a browser source in OBS or similar streaming software. Recommended size: 1920x1080.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

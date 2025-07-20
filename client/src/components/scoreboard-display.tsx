import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Settings {
  id?: number;
  sponsorLogoPath?: string;
  primaryColor?: string;
  accentColor?: string;
  theme?: string;
}

interface ScoreboardDisplayProps {
  data: any;
  isOverlay?: boolean;
}

export default function ScoreboardDisplay({ data, isOverlay = false }: ScoreboardDisplayProps) {
  // Fetch settings to get sponsor logo
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  if (!data) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No active match</p>
        </CardContent>
      </Card>
    );
  }

  const { match, homeTeam, awayTeam, gameState } = data;

  // Calculate how many sets to display (completed + current)
  const maxSets = Math.max(match.currentSet, match.setHistory?.length || 0);
  const setsToShow = Math.min(maxSets, match.format);

  return (
    <Card className={`w-full ${isOverlay ? 'bg-transparent border-none shadow-none' : ''}`}>
      
      {/* Clean Scoreboard with Sponsor */}
      <div className="text-white p-6">
        
        {/* Flex container for sponsor and scoreboard */}
        <div className="flex items-center gap-8">
          
          {/* Sponsor Logo - Left side */}
          {settings?.sponsorLogoPath && (
            <div className="flex-shrink-0">
              <div className="h-full flex items-center justify-center bg-black/80 rounded-lg p-4 backdrop-blur-sm">
                <img 
                  src={settings.sponsorLogoPath}
                  alt="Sponsor"
                  className="max-h-24 max-w-[180px] object-contain"
                />
              </div>
            </div>
          )}
          
          {/* Clean Score Grid */}
          <div className="flex-1 bg-black/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="grid gap-3">
            
            {/* Home team row */}
            <div className="grid grid-cols-6 gap-4 items-center py-3">
              <div className="flex items-center space-x-3">
                {homeTeam?.logoPath ? (
                  <img 
                    src={homeTeam.logoPath} 
                    alt={homeTeam.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: homeTeam?.primaryColor || '#1565C0' }}
                  >
                    {(homeTeam?.name || 'HOME').charAt(0)}
                  </div>
                )}
                <div className="text-lg font-semibold text-white tracking-wide">{homeTeam?.name || 'HOME'}</div>
              </div>
              {Array.from({ length: setsToShow }, (_, setIndex) => {
                const setNumber = setIndex + 1;
                const setData = match.setHistory?.find((s: any) => s.setNumber === setNumber);
                const isCurrentSet = setNumber === match.currentSet;
                const homeScore = isCurrentSet ? gameState?.homeScore || 0 : setData?.homeScore || 0;
                const awayScore = isCurrentSet ? gameState?.awayScore || 0 : setData?.awayScore || 0;
                const homeWon = !isCurrentSet && setData && homeScore > awayScore;
                
                return (
                  <div 
                    key={setIndex} 
                    className={`text-center text-2xl font-bold py-2 px-3 rounded ${
                      isCurrentSet 
                        ? 'bg-orange-500 text-white' 
                        : homeWon 
                          ? 'text-white'
                          : 'text-gray-200'
                    }`}
                    style={{
                      backgroundColor: isCurrentSet 
                        ? '#F59E0B' 
                        : homeWon 
                          ? homeTeam?.primaryColor || '#1565C0'
                          : 'transparent'
                    }}
                  >
                    {homeScore || (isCurrentSet ? 0 : '-')}
                  </div>
                );
              })}
            </div>
            
            {/* Away team row */}
            <div className="grid grid-cols-6 gap-4 items-center py-3">
              <div className="flex items-center space-x-3">
                {awayTeam?.logoPath ? (
                  <img 
                    src={awayTeam.logoPath} 
                    alt={awayTeam.name}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: awayTeam?.primaryColor || '#1565C0' }}
                  >
                    {(awayTeam?.name || 'AWAY').charAt(0)}
                  </div>
                )}
                <div className="text-lg font-semibold text-white tracking-wide">{awayTeam?.name || 'AWAY'}</div>
              </div>
              {Array.from({ length: setsToShow }, (_, setIndex) => {
                const setNumber = setIndex + 1;
                const setData = match.setHistory?.find((s: any) => s.setNumber === setNumber);
                const isCurrentSet = setNumber === match.currentSet;
                const homeScore = isCurrentSet ? gameState?.homeScore || 0 : setData?.homeScore || 0;
                const awayScore = isCurrentSet ? gameState?.awayScore || 0 : setData?.awayScore || 0;
                const awayWon = !isCurrentSet && setData && awayScore > homeScore;
                
                return (
                  <div 
                    key={setIndex} 
                    className={`text-center text-2xl font-bold py-2 px-3 rounded ${
                      isCurrentSet 
                        ? 'bg-orange-500 text-white' 
                        : awayWon 
                          ? 'text-white'
                          : 'text-gray-200'
                    }`}
                    style={{
                      backgroundColor: isCurrentSet 
                        ? '#F59E0B' 
                        : awayWon 
                          ? awayTeam?.primaryColor || '#1565C0'
                          : 'transparent'
                    }}
                  >
                    {awayScore || (isCurrentSet ? 0 : '-')}
                  </div>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

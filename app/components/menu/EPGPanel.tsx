'use client';

interface EPGPanelProps {
  epg: any[];
  isActive: boolean;
  isLoading: boolean;
  onBack: () => void;
}

// Helper function to decode Base64 with UTF-8 support
function decodeBase64(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  const trimmed = str.trim();
  
  // If it has spaces or is too short, it's not Base64
  if (trimmed.includes(' ') || trimmed.length < 4) return trimmed;
  
  try {
    // Decode Base64 to bytes (Latin1)
    const decoded = atob(trimmed);
    
    // Convert to bytes array
    const bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
      bytes[i] = decoded.charCodeAt(i);
    }
    
    // Decode as UTF-8 for proper Spanish characters (áéíóúüñ)
    const utf8String = new TextDecoder('utf-8').decode(bytes);
    
    // Check if result looks like readable text
    if (utf8String.length > 0 && /[\u00C0-\u00FFa-zA-Z0-9\s]/.test(utf8String)) {
      return utf8String;
    }
    
    return decoded; // Fallback to Latin1
  } catch (e) {
    // Not valid Base64
  }
  
  return trimmed;
}

export function EPGPanel({ epg, isActive, isLoading, onBack }: EPGPanelProps) {
  const formatTime = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return '--:--';
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`flex flex-col h-full ${isActive ? 'bg-gray-800/30' : ''}`}
      style={{ flex: '0 0 40%' }}
    >
      <div className="p-4 border-b border-gray-800 flex-shrink-0 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Guía de Programas</h3>
        <button onClick={onBack} className="text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : epg.length === 0 ? (
          <p className="text-gray-500 text-center p-4">No hay información de guía disponible</p>
        ) : (
          epg.map((program, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-gray-800 text-gray-300"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  {decodeBase64(program.title) || 'Programa'}
                </span>
                {index === 0 && (
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">
                    EN VIVO
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(program.start)} → {formatTime(program.end)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

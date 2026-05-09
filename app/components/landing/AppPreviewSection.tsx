import { Section } from '../ui/Section';

export function AppPreviewSection() {
  return (
    <Section variant="dark" id="como-funciona">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Tan Simple Como Debería Ser
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Una interfaz diseñada para que encuentres tu canal favorito en segundos
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Mockup Container */}
        <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-700">
          {/* Placeholder for actual screenshot */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center space-y-6 p-8">
              {/* Play Icon */}
              <div className="w-24 h-24 mx-auto bg-blue-600/30 rounded-full flex items-center justify-center animate-pulse">
                <svg className="w-12 h-12 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              
              <div className="space-y-2">
                <p className="text-white text-xl font-semibold">Reproductor Limpio</p>
                <p className="text-gray-400">Solo controles esenciales: play, pause, volumen</p>
              </div>

              {/* Channel Grid Preview */}
              <div className="grid grid-cols-4 gap-2 mt-8 max-w-md mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((channel) => (
                  <div
                    key={channel}
                    className="aspect-video bg-gray-800/50 rounded border border-gray-700 flex items-center justify-center"
                  >
                    <span className="text-gray-500 text-xs">CH {channel}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm">Navegación rápida por categorías</p>
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          Interfaz minimalista: reproductor + guía de canales. Nada más.
        </p>
      </div>
    </Section>
  );
}

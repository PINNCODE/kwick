export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-gray-800 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-white font-semibold">Kwick</span>
          </div>

          <p className="text-gray-500 text-sm">
            © {currentYear} Kwick. Todos los derechos reservados.
          </p>

          {/* Simple Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Hecho para amantes de la TV</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

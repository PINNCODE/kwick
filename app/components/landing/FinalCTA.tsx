import Link from 'next/link';
import { Button } from '../ui/Button';
import { Section } from '../ui/Section';

export function FinalCTA() {
  return (
    <Section variant="default">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          ¿Listo para Empezar?
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Únete a la experiencia de streaming más simple. Sin registros, sin complicaciones. 
          Solo TV.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
              Iniciar Sesión Ahora
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Compatible con todos los proveedores de IPTV que usan Xtream Codes
        </p>
      </div>
    </Section>
  );
}

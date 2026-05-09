import { Section } from '../ui/Section';

interface Step {
  number: string;
  title: string;
  description: string;
}

export function HowItWorksSection() {
  const steps: Step[] = [
    {
      number: '01',
      title: 'Ingresa tus Credenciales',
      description: 'Usa las credenciales de Xtream Codes de tu proveedor de IPTV. Sin registros adicionales.',
    },
    {
      number: '02',
      title: 'Explora Tus Canales',
      description: 'Navega por tus canales favoritos organizados por categoría. Búsqueda rápida incluida.',
    },
    {
      number: '03',
      title: 'Disfruta',
      description: 'Selecciona un canal y comienza a ver inmediatamente. Controles simples, sin distracciones.',
    },
  ];

  return (
    <Section variant="gradient" id="como-funciona">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          ¿Cómo Funciona?
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          Tres pasos simples para empezar a ver TV
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Connector Line (except last) */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-600/50 to-transparent" />
            )}
            
            <div className="relative z-10 text-center">
              {/* Step Number */}
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30">
                <span className="text-white font-bold text-lg">{step.number}</span>
              </div>
              
              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-2">
                {step.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

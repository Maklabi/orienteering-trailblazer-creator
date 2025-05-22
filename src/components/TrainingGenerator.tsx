
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Route, Printer, Settings } from 'lucide-react';
import { toast } from "sonner";

interface Beacon {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  dateAdded: string;
}

interface TrainingGeneratorProps {
  onBack: () => void;
}

const TrainingGenerator: React.FC<TrainingGeneratorProps> = ({ onBack }) => {
  const [location, setLocation] = useState('');
  const [numBeacons, setNumBeacons] = useState(5);
  const [generatedTraining, setGeneratedTraining] = useState<Beacon[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTraining = async () => {
    if (!location.trim()) {
      toast.error("Por favor, introduce el nombre de una localidad");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simular coordenadas base para la localidad (en producción usaríamos geocoding)
      const baseLat = 40.4168 + (Math.random() - 0.5) * 0.1;
      const baseLng = -3.7038 + (Math.random() - 0.5) * 0.1;

      // Generar balizas aleatorias en un radio de 2km
      const training: Beacon[] = [];
      for (let i = 0; i < numBeacons; i++) {
        // Generar punto aleatorio en radio de 2km (aproximadamente 0.018 grados)
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * 0.018; // Aprox 2km en grados
        
        const lat = baseLat + distance * Math.cos(angle);
        const lng = baseLng + distance * Math.sin(angle);
        
        training.push({
          id: `training-${i + 1}`,
          name: `Baliza ${i + 1}`,
          lat,
          lng,
          dateAdded: new Date().toLocaleDateString()
        });
      }

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simular procesamiento
      
      setGeneratedTraining(training);
      toast.success(`Entrenamiento generado con ${numBeacons} balizas cerca de ${location}`);
      
    } catch (error) {
      toast.error("Error al generar el entrenamiento");
    } finally {
      setIsGenerating(false);
    }
  };

  const printTraining = () => {
    if (!generatedTraining) return;
    
    toast.success("Función de impresión activada - En producción se abriría el diálogo de impresión");
    window.print();
  };

  const clearTraining = () => {
    setGeneratedTraining(null);
    setLocation('');
    toast.info("Entrenamiento borrado");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-orange-800 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="text-white hover:bg-orange-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Generar Entrenamiento</h1>
            <p className="text-orange-100">Crea entrenamientos automáticos basados en localidad</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Settings className="w-5 h-5" />
                  Configuración
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location" className="text-gray-700">Localidad</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="ej: Madrid, Barcelona..."
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Introduce el nombre de la localidad base
                  </p>
                </div>

                <div>
                  <Label htmlFor="numBeacons" className="text-gray-700">Número de balizas</Label>
                  <Input
                    id="numBeacons"
                    type="number"
                    min="3"
                    max="15"
                    value={numBeacons}
                    onChange={(e) => setNumBeacons(parseInt(e.target.value) || 5)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Entre 3 y 15 balizas por entrenamiento
                  </p>
                </div>

                <Button 
                  onClick={generateTraining}
                  disabled={isGenerating}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isGenerating ? "Generando..." : "Generar Entrenamiento"}
                </Button>

                {generatedTraining && (
                  <div className="pt-4 border-t space-y-2">
                    <Button 
                      onClick={printTraining}
                      variant="outline"
                      className="w-full border-green-600 text-green-700 hover:bg-green-50"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir Mapa
                    </Button>
                    <Button 
                      onClick={clearTraining}
                      variant="outline"
                      className="w-full border-gray-400 text-gray-600 hover:bg-gray-50"
                    >
                      Nuevo Entrenamiento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Training Results */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Route className="w-5 h-5" />
                  {generatedTraining ? `Entrenamiento - ${location}` : 'Resultado del Entrenamiento'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedTraining ? (
                  <div className="text-center py-12">
                    <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay entrenamiento generado</h3>
                    <p className="text-gray-500">Configura los parámetros y genera tu primer entrenamiento</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Training Info */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-800 mb-2">Información del Entrenamiento</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Localidad:</span>
                          <span className="ml-2 font-semibold">{location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Balizas:</span>
                          <span className="ml-2 font-semibold">{generatedTraining.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Radio:</span>
                          <span className="ml-2 font-semibold">2 km</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Generado:</span>
                          <span className="ml-2 font-semibold">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Map Preview */}
                    <div className="bg-green-50 border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
                      <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Vista Previa del Mapa</h3>
                      <p className="text-green-700 mb-4">
                        Aquí se mostraría el mapa de Google Maps con las {generatedTraining.length} balizas marcadas
                      </p>
                      <div className="text-sm text-green-600 bg-white rounded p-2 inline-block">
                        📍 Región: {location} | Radio: 2km | Balizas: {generatedTraining.length}
                      </div>
                    </div>

                    {/* Beacons List */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-3">Lista de Balizas</h3>
                      <div className="grid gap-2">
                        {generatedTraining.map((beacon, index) => (
                          <div 
                            key={beacon.id}
                            className="bg-white border border-gray-200 rounded p-3 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-gray-800">{beacon.name}</div>
                                <div className="text-sm text-gray-500">
                                  {beacon.lat.toFixed(4)}°, {beacon.lng.toFixed(4)}°
                                </div>
                              </div>
                            </div>
                            <MapPin className="w-4 h-4 text-orange-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingGenerator;

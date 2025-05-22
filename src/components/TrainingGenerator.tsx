
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MapPin, Route, Printer, Settings } from 'lucide-react';
import { toast } from "sonner";
import MapComponent from './MapComponent';

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
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Default to Madrid
  const [savedBeacons, setSavedBeacons] = useState<Beacon[]>([]);

  // Load all saved beacons on component mount
  useEffect(() => {
    const beaconsFromStorage = localStorage.getItem('orientatrainer-beacons');
    if (beaconsFromStorage) {
      setSavedBeacons(JSON.parse(beaconsFromStorage));
    }
  }, []);

  const generateTraining = async () => {
    if (!location.trim()) {
      toast.error("Por favor, introduce el nombre de una localidad");
      return;
    }

    if (savedBeacons.length === 0) {
      toast.error("No hay balizas guardadas. Añade balizas en la sección 'Gestionar Balizas' primero.");
      return;
    }

    if (savedBeacons.length < numBeacons) {
      toast.warning(`Solo hay ${savedBeacons.length} balizas disponibles. Se usarán todas.`);
    }

    setIsGenerating(true);
    
    try {
      // Try to geocode the location to center the map there
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      let centerPoint = { lat: 40.4168, lng: -3.7038 }; // Default to Madrid
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        centerPoint = {
          lat: parseFloat(lat),
          lng: parseFloat(lon)
        };
      }
      
      setMapCenter(centerPoint);

      // Instead of random beacons, we'll select from the saved beacons
      // If we have more beacons than needed, randomly select from them
      const beaconsToUse = [...savedBeacons];
      
      // Shuffle the array to get random beacons each time
      for (let i = beaconsToUse.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [beaconsToUse[i], beaconsToUse[j]] = [beaconsToUse[j], beaconsToUse[i]];
      }
      
      // Take only the number needed or all if we have fewer
      const finalBeacons = beaconsToUse.slice(0, Math.min(numBeacons, beaconsToUse.length));
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      
      setGeneratedTraining(finalBeacons);
      toast.success(`Entrenamiento generado con ${finalBeacons.length} balizas en ${location}`);
      
    } catch (error) {
      console.error("Error generating training:", error);
      toast.error("Error al generar el entrenamiento");
    } finally {
      setIsGenerating(false);
    }
  };

  const printTraining = () => {
    if (!generatedTraining) return;
    
    // Preparar la vista para impresión
    window.print();
    toast.success("Preparando para imprimir");
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
            <p className="text-orange-100">Crea entrenamientos usando tus balizas guardadas</p>
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
                    Introduce el nombre de la localidad para centrar el mapa
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
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 3;
                      setNumBeacons(Math.min(Math.max(value, 3), 15));
                    }}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Entre 3 y 15 balizas por entrenamiento (máx: {savedBeacons.length} disponibles)
                  </p>
                </div>

                <div className="pt-2 pb-2 border-t border-b border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span>Balizas disponibles:</span>
                    <span className={savedBeacons.length > 0 ? "text-green-600" : "text-red-600"}>
                      {savedBeacons.length}
                    </span>
                  </div>
                </div>

                <Button 
                  onClick={generateTraining}
                  disabled={isGenerating || savedBeacons.length === 0}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  {isGenerating ? "Generando..." : "Generar Entrenamiento"}
                </Button>

                {savedBeacons.length === 0 && (
                  <div className="text-center p-2 bg-orange-50 border border-orange-200 rounded-md">
                    <p className="text-sm text-orange-800">
                      Necesitas añadir balizas en la sección "Gestionar Balizas" antes de poder generar entrenamientos.
                    </p>
                  </div>
                )}

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
                          <span className="text-gray-600">Fuente:</span>
                          <span className="ml-2 font-semibold">Balizas guardadas</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Generado:</span>
                          <span className="ml-2 font-semibold">{new Date().toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Map View */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Mapa de Entrenamiento</h3>
                      <MapComponent 
                        center={mapCenter}
                        zoom={14}
                        markers={generatedTraining.map((b, index) => ({
                          id: b.id,
                          position: { lat: b.lat, lng: b.lng },
                          title: `Baliza ${index + 1}`
                        }))}
                        className="h-[400px] w-full rounded-md border mb-4"
                      />
                      <div className="text-sm text-orange-600 bg-orange-50 rounded p-2 inline-block">
                        📍 Entrenamiento en: {location} | Balizas: {generatedTraining.length}
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

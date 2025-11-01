import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [startPoint, setStartPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [numBeacons, setNumBeacons] = useState(5);
  const [maxDistanceBetweenBeacons, setMaxDistanceBetweenBeacons] = useState(500);
  const [generatedTraining, setGeneratedTraining] = useState<Beacon[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mapCenter] = useState({ lat: 43.2948997, lng: -1.9549783 }); // Martutene
  const [savedBeacons, setSavedBeacons] = useState<Beacon[]>([]);
  const [isPrintMode, setIsPrintMode] = useState(false);

  // Load all saved beacons on component mount
  useEffect(() => {
    const beaconsFromStorage = localStorage.getItem('orientatrainer-beacons');
    if (beaconsFromStorage) {
      setSavedBeacons(JSON.parse(beaconsFromStorage));
    }
  }, []);

  // Function to calculate distance between two points in meters
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Function to filter beacons within 5km radius of location center
  const filterBeaconsNearLocation = (beacons: Beacon[], centerPoint: { lat: number; lng: number }): Beacon[] => {
    const maxDistanceFromCenter = 5000; // 5km in meters
    return beacons.filter(beacon => {
      const distance = calculateDistance(centerPoint.lat, centerPoint.lng, beacon.lat, beacon.lng);
      return distance <= maxDistanceFromCenter;
    });
  };

  // Function to generate a training route with distance constraints between consecutive beacons
  const generateRouteWithDistanceConstraints = (beacons: Beacon[], maxDistance: number, numBeacons: number): Beacon[] => {
    if (beacons.length === 0) return [];
    
    // Start with a random beacon
    const route: Beacon[] = [];
    const availableBeacons = [...beacons];
    
    // Pick first beacon randomly
    const firstIndex = Math.floor(Math.random() * availableBeacons.length);
    route.push(availableBeacons[firstIndex]);
    availableBeacons.splice(firstIndex, 1);
    
    // Build route by finding next beacons within distance constraint
    while (route.length < numBeacons && availableBeacons.length > 0) {
      const lastBeacon = route[route.length - 1];
      
      // Find all beacons within max distance from the last beacon
      const nearbyBeacons = availableBeacons.filter(beacon => {
        const distance = calculateDistance(lastBeacon.lat, lastBeacon.lng, beacon.lat, beacon.lng);
        return distance <= maxDistance;
      });
      
      if (nearbyBeacons.length === 0) {
        // No more beacons within distance, stop here
        break;
      }
      
      // Pick a random beacon from nearby options
      const randomIndex = Math.floor(Math.random() * nearbyBeacons.length);
      const nextBeacon = nearbyBeacons[randomIndex];
      
      route.push(nextBeacon);
      
      // Remove the selected beacon from available beacons
      const beaconIndex = availableBeacons.findIndex(b => b.id === nextBeacon.id);
      availableBeacons.splice(beaconIndex, 1);
    }
    
    return route;
  };

  const handleMapClick = (position: { lat: number; lng: number }) => {
    setStartPoint(position);
    toast.success("Punto de inicio seleccionado");
  };

  const generateTraining = async () => {
    if (!startPoint) {
      toast.error("Por favor selecciona el punto de inicio en el mapa");
      return;
    }

    if (savedBeacons.length === 0) {
      toast.error("No hay balizas guardadas. Añade balizas en la sección 'Gestionar Balizas' primero.");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Filter beacons within 5km radius of the start point
      const nearbyBeacons = filterBeaconsNearLocation(savedBeacons, startPoint);
      
      if (nearbyBeacons.length === 0) {
        toast.warning(`No se encontraron balizas en un radio de 5km del punto seleccionado. Añade balizas cerca de esta zona.`);
        setIsGenerating(false);
        return;
      }

      // Generate route with distance constraints between consecutive beacons
      const routeBeacons = generateRouteWithDistanceConstraints(nearbyBeacons, maxDistanceBetweenBeacons, numBeacons);
      
      if (routeBeacons.length === 0) {
        toast.warning(`No se pudieron conectar balizas con la distancia máxima de ${maxDistanceBetweenBeacons}m entre ellas en un radio de 5km.`);
        setIsGenerating(false);
        return;
      }

      if (routeBeacons.length < numBeacons) {
        toast.warning(`Solo se pudieron conectar ${routeBeacons.length} balizas con la distancia máxima de ${maxDistanceBetweenBeacons}m en un radio de 5km.`);
      }

      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
      
      setGeneratedTraining(routeBeacons);
      toast.success(`Entrenamiento generado con ${routeBeacons.length} balizas (radio 5km, máx. ${maxDistanceBetweenBeacons}m entre balizas)`);
      
    } catch (error) {
      console.error("Error generating training:", error);
      toast.error("Error al generar el entrenamiento");
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateMapBounds = () => {
    if (!generatedTraining || generatedTraining.length === 0) {
      return { center: mapCenter, zoom: 14 };
    }

    const lats = generatedTraining.map(b => b.lat);
    const lngs = generatedTraining.map(b => b.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);
    
    // Improved zoom calculation for better fit
    let zoom = 14;
    if (maxDiff > 0.2) zoom = 8;
    else if (maxDiff > 0.1) zoom = 10;
    else if (maxDiff > 0.05) zoom = 12;
    else if (maxDiff > 0.02) zoom = 13;
    else if (maxDiff > 0.01) zoom = 14;
    else if (maxDiff > 0.005) zoom = 15;
    else zoom = 16;
    
    return {
      center: { lat: centerLat, lng: centerLng },
      zoom
    };
  };

  const sendToTelegram = async () => {
    if (!generatedTraining) return;
    
    const phoneNumber = prompt("Introduce el número de teléfono (con código de país, ej: +34123456789):");
    
    if (!phoneNumber) {
      toast.info("Envío cancelado");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Formato de teléfono inválido. Usa el formato +34123456789");
      return;
    }
    
    // Create a simple text message with the training info
    const message = `🏃‍♂️ *MI MAPA DE ORIENTACIÓN*\n\n📍 *Localidad:* ${location}\n🎯 *Balizas:* ${generatedTraining.length}\n📏 *Distancia máx:* ${maxDistanceBetweenBeacons}m\n📅 *Fecha:* ${new Date().toLocaleDateString('es-ES')}\n\n*Lista de Balizas:*\n${generatedTraining.map((beacon, index) => `${index + 1}. ${beacon.name} (${beacon.lat.toFixed(4)}°, ${beacon.lng.toFixed(4)}°)`).join('\n')}\n\n*Teléfono destino:* ${phoneNumber}`;
    
    // For now, we'll show what would be sent
    toast.success(`Mensaje preparado para ${phoneNumber}`);
    console.log("Mensaje para Telegram:", message);
    
    // Note: To actually send via Telegram, you would need a Telegram Bot API key
    // This would require Supabase integration for secure API key storage
  };

  const sendMapImageToTelegram = async () => {
    if (!generatedTraining) return;
    
    const phoneNumber = prompt("Introduce el número de teléfono (con código de país, ej: +34123456789):");
    
    if (!phoneNumber) {
      toast.info("Envío cancelado");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error("Formato de teléfono inválido. Usa el formato +34123456789");
      return;
    }
    
    toast.info("Preparando imagen del mapa...");
    
    // Note: To actually capture and send the map image, you would need:
    // 1. A library to capture the map as image (like html2canvas)
    // 2. A Telegram Bot API key stored securely in Supabase
    // 3. An API endpoint to send the image via Telegram
    
    console.log(`Imagen del mapa preparada para enviar a ${phoneNumber} en el chat "MI MAPA DE ORIENTACIÓN"`);
    toast.success(`Imagen preparada para ${phoneNumber}`);
  };

  const printTraining = () => {
    if (!generatedTraining) return;
    
    setIsPrintMode(true);
    
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        setIsPrintMode(false);
      }, 1000);
      toast.success("Preparando para imprimir");
    }, 500);
  };

  const clearTraining = () => {
    setGeneratedTraining(null);
    setStartPoint(null);
    toast.info("Entrenamiento borrado");
  };

  const handleNumBeaconsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    const maxAllowed = Math.min(50, savedBeacons.length);
    setNumBeacons(Math.min(Math.max(value, 1), maxAllowed));
  };

  const maxAllowedBeacons = Math.min(50, savedBeacons.length);
  const mapBounds = calculateMapBounds();

  if (isPrintMode && generatedTraining) {
    return (
      <div className="p-8 bg-white">
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .print-container, .print-container * {
                visibility: visible;
              }
              .print-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                padding: 20px;
                box-sizing: border-box;
              }
              @page {
                margin: 20px;
                size: A4;
              }
              .print-text {
                font-size: 8px !important;
              }
              .print-info {
                font-size: 8px !important;
                line-height: 1.1 !important;
              }
            }
          `}
        </style>
        <div className="print-container">
          <div className="text-center mb-2">
            <div className="print-info text-xs text-gray-700">
              <strong>BALIZAS:</strong> {generatedTraining.length} | <strong>DISTANCIA MÁXIMA:</strong> {maxDistanceBetweenBeacons}m | <strong>FECHA:</strong> {new Date().toLocaleDateString('es-ES')}
            </div>
          </div>
          <MapComponent 
            center={mapBounds.center}
            zoom={mapBounds.zoom}
            markers={generatedTraining.map((b, index) => ({
              id: b.id,
              position: { lat: b.lat, lng: b.lng },
              title: `Baliza ${index + 1}: ${b.name}`
            }))}
            className="w-full border-2 border-orange-500 rounded-lg"
            style={{ 
              height: 'calc(100vh - 120px)', 
              minHeight: '650px'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 no-print">
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
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 uppercase">
                    Punto de Inicio
                  </label>
                  <p className={`text-sm p-3 rounded-md border ${startPoint ? 'text-green-700 bg-green-50 border-green-300' : 'text-gray-600 bg-gray-50 border-gray-300'}`}>
                    {startPoint 
                      ? '✓ Punto de inicio seleccionado en el mapa' 
                      : 'Haz click izquierdo en el mapa en el punto donde quieras que empiece el entrenamiento'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Se buscarán balizas en un radio de 5km a la redonda del punto seleccionado
                  </p>
                </div>

                <div>
                  <label htmlFor="numBeacons" className="text-sm font-semibold text-gray-700 uppercase block mb-1">Número de Balizas</label>
                  <Input
                    id="numBeacons"
                    type="number"
                    min="1"
                    max="50"
                    value={numBeacons}
                    onChange={handleNumBeaconsChange}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Hasta 50 balizas por entrenamiento
                  </p>
                </div>

                <div>
                  <label htmlFor="maxDistance" className="text-sm font-semibold text-gray-700 uppercase block mb-1">Distancia Máxima Entre Balizas (Metros)</label>
                  <Input
                    id="maxDistance"
                    type="number"
                    min="1"
                    max="5000"
                    value={maxDistanceBetweenBeacons}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      setMaxDistanceBetweenBeacons(Math.min(Math.max(value, 1), 5000));
                    }}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Distancia máxima permitida entre balizas consecutivas (1-5000m)
                  </p>
                </div>

                <div className="pt-2 pb-2 border-t border-b border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 font-medium">
                    <span className="uppercase font-semibold">BALIZAS DISPONIBLES:</span>
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
                  {generatedTraining ? `Entrenamiento Generado` : 'Resultado del Entrenamiento'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!generatedTraining ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Haz click en el mapa para seleccionar el punto de inicio del entrenamiento</p>
                    <MapComponent 
                      center={mapCenter} 
                      zoom={13} 
                      markers={[]}
                      startMarker={startPoint}
                      onMapClick={handleMapClick}
                      className="h-[500px] w-full rounded-md border"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Training Info */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h3 className="font-semibold text-orange-800 mb-2">Información del Entrenamiento</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">BALIZAS:</span>
                          <span className="ml-2 font-semibold">{generatedTraining.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">DISTANCIA MÁX. ENTRE BALIZAS:</span>
                          <span className="ml-2 font-semibold">{maxDistanceBetweenBeacons}m</span>
                        </div>
                        <div>
                          <span className="text-gray-600">PUNTO DE INICIO:</span>
                          <span className="ml-2 font-semibold">{startPoint?.lat.toFixed(4)}°, {startPoint?.lng.toFixed(4)}°</span>
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
                        center={mapBounds.center}
                        zoom={mapBounds.zoom}
                        markers={generatedTraining.map((b, index) => ({
                          id: b.id,
                          position: { lat: b.lat, lng: b.lng },
                          title: `Baliza ${index + 1}: ${b.name}`
                        }))}
                        startMarker={startPoint}
                        onMapClick={handleMapClick}
                        className="h-[400px] w-full rounded-md border mb-4"
                      />
                      <div className="text-sm text-orange-600 bg-orange-50 rounded p-2 inline-block">
                        📍 Balizas: {generatedTraining.length} | Radio: 5km | Máx. distancia entre balizas: {maxDistanceBetweenBeacons}m
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
                                {index > 0 && (
                                  <div className="text-xs text-orange-600">
                                    Distancia desde anterior: {calculateDistance(
                                      generatedTraining[index - 1].lat,
                                      generatedTraining[index - 1].lng,
                                      beacon.lat,
                                      beacon.lng
                                    ).toFixed(0)}m
                                  </div>
                                )}
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

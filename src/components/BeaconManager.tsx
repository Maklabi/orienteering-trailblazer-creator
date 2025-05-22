
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Trash2, Plus } from 'lucide-react';
import { toast } from "sonner";

interface Beacon {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  dateAdded: string;
}

interface BeaconManagerProps {
  onBack: () => void;
}

const BeaconManager: React.FC<BeaconManagerProps> = ({ onBack }) => {
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    loadBeacons();
  }, []);

  const loadBeacons = () => {
    const savedBeacons = localStorage.getItem('orientatrainer-beacons');
    if (savedBeacons) {
      setBeacons(JSON.parse(savedBeacons));
    }
  };

  const saveBeacons = (newBeacons: Beacon[]) => {
    localStorage.setItem('orientatrainer-beacons', JSON.stringify(newBeacons));
    setBeacons(newBeacons);
  };

  const addBeacon = (lat: number, lng: number) => {
    const newBeacon: Beacon = {
      id: Date.now().toString(),
      name: `Baliza ${beacons.length + 1}`,
      lat,
      lng,
      dateAdded: new Date().toLocaleDateString()
    };
    
    const updatedBeacons = [...beacons, newBeacon];
    saveBeacons(updatedBeacons);
    toast.success("Baliza añadida correctamente");
  };

  const deleteBeacon = (id: string) => {
    const updatedBeacons = beacons.filter(beacon => beacon.id !== id);
    saveBeacons(updatedBeacons);
    toast.success("Baliza eliminada");
  };

  const openGoogleMaps = () => {
    setIsMapOpen(true);
    toast.info("Función de Google Maps simulada - En producción se abriría el mapa real");
    
    // Simular la selección de un punto en el mapa
    setTimeout(() => {
      const randomLat = 40.4168 + (Math.random() - 0.5) * 0.1;
      const randomLng = -3.7038 + (Math.random() - 0.5) * 0.1;
      addBeacon(randomLat, randomLng);
      setIsMapOpen(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-green-800 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="text-white hover:bg-green-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestionar Balizas</h1>
            <p className="text-green-100">Añade puntos de control para tus entrenamientos</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Plus className="w-5 h-5" />
                  Añadir Nueva Baliza
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Haz clic en el botón para abrir Google Maps y seleccionar una ubicación.
                </p>
                <Button 
                  onClick={openGoogleMaps}
                  disabled={isMapOpen}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isMapOpen ? "Abriendo mapa..." : "Abrir Google Maps"}
                </Button>
                
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-800 mb-2">Estadísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de balizas:</span>
                      <span className="font-semibold text-green-700">{beacons.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Beacons List */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <MapPin className="w-5 h-5" />
                  Balizas Guardadas ({beacons.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {beacons.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay balizas guardadas</h3>
                    <p className="text-gray-500">Comienza añadiendo tu primera baliza usando Google Maps</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {beacons.map((beacon) => (
                      <div 
                        key={beacon.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{beacon.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Lat: {beacon.lat.toFixed(6)}</p>
                              <p>Lng: {beacon.lng.toFixed(6)}</p>
                              <p>Añadida: {beacon.dateAdded}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteBeacon(beacon.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
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

export default BeaconManager;

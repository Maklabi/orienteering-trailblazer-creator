import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Trash2, Plus } from 'lucide-react';
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import MapComponent from './MapComponent';

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
  const [mapCenter] = useState({ lat: 43.2948997, lng: -1.9549783 }); // Martutene

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

  const addBeacon = (position: { lat: number; lng: number }) => {
    const newBeacon: Beacon = {
      id: Date.now().toString(),
      name: `Baliza ${beacons.length + 1}`,
      lat: position.lat,
      lng: position.lng,
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
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 p-3 rounded-md bg-blue-50 border border-blue-200">
                    Haz click izquierdo en el mapa para añadir balizas que usarás en tus entrenamientos
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-semibold text-gray-800 mb-2 uppercase">ESTADÍSTICAS</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de balizas:</span>
                      <span className="font-semibold text-green-700">{beacons.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Beacons List */}
            <Card className="border-2 border-green-200 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <MapPin className="w-5 h-5" />
                  Balizas Guardadas ({beacons.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {beacons.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">No hay balizas guardadas</h3>
                    <p className="text-xs text-gray-500">Haz clic en el mapa para añadir balizas</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {beacons.map((beacon) => (
                      <div 
                        key={beacon.id}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1 text-sm">{beacon.name}</h3>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>Lat: {beacon.lat.toFixed(6)}</p>
                              <p>Lng: {beacon.lng.toFixed(6)}</p>
                              <p>Añadida: {beacon.dateAdded}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => deleteBeacon(beacon.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map - Always Visible */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <MapPin className="w-5 h-5" />
                  Mapa - Selecciona una ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">Haz clic en el mapa para añadir una baliza</p>
                <MapComponent 
                  center={mapCenter} 
                  zoom={13} 
                  markers={beacons.map(b => ({
                    id: b.id,
                    position: { lat: b.lat, lng: b.lng },
                    title: b.name
                  }))}
                  onMapClick={addBeacon}
                  className="h-[500px] w-full rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeaconManager;

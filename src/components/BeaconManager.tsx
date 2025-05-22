
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Trash2, Plus, X, Search } from 'lucide-react';
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
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Default to Madrid
  const [location, setLocation] = useState('');

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

  const toggleMap = () => {
    setIsMapOpen(!isMapOpen);
  };

  const searchLocation = async () => {
    if (!location.trim()) {
      toast.error("Por favor introduce una localidad");
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter({
          lat: parseFloat(lat),
          lng: parseFloat(lon)
        });
        setIsMapOpen(true);
        toast.success(`Localidad encontrada: ${data[0].display_name}`);
      } else {
        toast.error("No se encontró la localidad. Intenta con un nombre diferente.");
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Error al buscar la localidad. Inténtalo de nuevo.");
    }
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
                  <label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Localidad
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="location"
                      placeholder="Ej. Madrid, España"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={searchLocation}
                      size="icon"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Introduce una localidad para centrar el mapa
                  </p>
                </div>
                
                <Button 
                  onClick={toggleMap}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isMapOpen ? "Cerrar Mapa" : "Abrir Mapa"}
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

          {/* Beacons List and Map */}
          <div className="lg:col-span-2">
            {isMapOpen && (
              <Card className="border-2 border-green-200 mb-6">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <MapPin className="w-5 h-5" />
                      Mapa - Selecciona una ubicación
                    </CardTitle>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={toggleMap}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
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
                    className="h-[400px] w-full rounded-md border"
                  />
                </CardContent>
              </Card>
            )}

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
                    <p className="text-gray-500">Comienza añadiendo tu primera baliza usando el mapa</p>
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

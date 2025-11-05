import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Route, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BeaconManager from '../components/BeaconManager';
import TrainingGenerator from '../components/TrainingGenerator';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'beacons' | 'training'>('home');
  const navigate = useNavigate();

  const renderContent = () => {
    switch (currentView) {
      case 'beacons':
        return <BeaconManager onBack={() => setCurrentView('home')} />;
      case 'training':
        return <TrainingGenerator onBack={() => setCurrentView('home')} />;
      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-amber-50 flex flex-col">
            {/* Header */}
            <header className="bg-green-800 text-white p-6 shadow-lg">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <MapPin className="text-orange-300" />
                  OrientaTrainer Pro
                </h1>
                <p className="text-green-100 mt-2">Creador de entrenamientos de carreras de orientación</p>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-4xl w-full">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Generar Entrenamiento Card - Now First */}
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-orange-200 hover:border-orange-400 bg-white">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <Route className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-orange-800 mb-4">
                          Generar Entrenamiento
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Crea entrenamientos automáticos basados en una localidad. 
                          Genera rutas aleatorias con balizas cercanas para 
                          entrenamientos variados.
                        </p>
                        <Button 
                          onClick={() => setCurrentView('training')}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
                        >
                          Generar Entrenamiento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Gestionar Balizas Card - Now Second */}
                  <Card className="group hover:shadow-2xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 bg-white">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-800 mb-4">
                          Gestionar Balizas
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          Añade y gestiona puntos de control en el mapa. 
                          Haz clic en ubicaciones específicas para crear tu 
                          base de datos de balizas.
                        </p>
                        <Button 
                          onClick={() => setCurrentView('beacons')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
                        >
                          Meter Balizas en el Mapa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>

            {/* Footer */}
            <footer className="bg-green-800 text-white p-4">
              <div className="max-w-4xl mx-auto text-center space-y-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/install')}
                  className="bg-white/10 hover:bg-white/20 border-white/30 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Instalar como App
                </Button>
                <p className="text-green-100">© 2024 OrientaTrainer Pro - Software para entrenamientos de orientación</p>
              </div>
            </footer>
          </div>
        );
    }
  };

  return renderContent();
};

export default Index;

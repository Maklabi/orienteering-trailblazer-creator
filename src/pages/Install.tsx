import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Share, Home, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Install = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          ← Volver al inicio
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Download className="h-8 w-8 text-red-500" />
              <CardTitle className="text-2xl">Instalar Xolomon Trainning</CardTitle>
            </div>
            <CardDescription>
              Instala la aplicación en tu dispositivo para acceder sin conexión y tener una experiencia como app nativa
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {/* Android Chrome */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                <CardTitle className="text-lg">Android (Chrome)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Abre esta página en Chrome</li>
                <li>Toca el menú (⋮) en la esquina superior derecha</li>
                <li>Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio"</li>
                <li>Confirma tocando "Instalar"</li>
              </ol>
            </CardContent>
          </Card>

          {/* iPhone Safari */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">iPhone (Safari)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Abre esta página en Safari</li>
                <li>Toca el botón de compartir <Share className="h-4 w-4 inline" /></li>
                <li>Desplázate hacia abajo y toca "Añadir a pantalla de inicio" <Home className="h-4 w-4 inline" /></li>
                <li>Toca "Añadir" en la esquina superior derecha</li>
              </ol>
            </CardContent>
          </Card>

          {/* Desktop */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-purple-600" />
                <CardTitle className="text-lg">Ordenador (Chrome/Edge)</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Abre esta página en Chrome o Edge</li>
                <li>Busca el icono de instalación (+) en la barra de direcciones</li>
                <li>Haz clic en "Instalar"</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">✨ Ventajas de instalar la app:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Acceso rápido desde tu pantalla de inicio</li>
              <li>Funciona sin conexión a internet</li>
              <li>Experiencia como una aplicación nativa</li>
              <li>Ocupa muy poco espacio en tu dispositivo</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
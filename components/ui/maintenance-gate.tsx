import { ReactNode } from 'react';
import { useMaintenanceMode } from '@/hooks/use-settings';

interface MaintenanceGateProps {
  children: ReactNode;
  maintenanceMessage?: ReactNode;
}

/**
 * Component that shows maintenance message when maintenance mode is enabled
 */
export function MaintenanceGate({ 
  children, 
  maintenanceMessage 
}: MaintenanceGateProps) {
  const { isMaintenanceMode, loading } = useMaintenanceMode();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  if (isMaintenanceMode) {
    return maintenanceMessage ? (
      maintenanceMessage as JSX.Element
    ) : (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-3xl font-bold mb-4">🔧 Maintenance Mode</h1>
          <p className="text-muted-foreground mb-4">
            We're currently performing scheduled maintenance to improve your experience.
          </p>
          <p className="text-sm text-muted-foreground">
            Please check back soon. Thank you for your patience!
          </p>
        </div>
      </div>
    );
  }

  return children as JSX.Element;
}

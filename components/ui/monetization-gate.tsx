import { ReactNode } from 'react';
import { useMonetization } from '@/hooks/use-settings';

interface MonetizationGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  showWhenDisabled?: boolean;
}

/**
 * Component that conditionally renders children based on monetization settings
 */
export function MonetizationGate({ 
  children, 
  fallback = null, 
  showWhenDisabled = false 
}: MonetizationGateProps) {
  const { isMonetizationEnabled, loading } = useMonetization();

  if (loading) {
    return fallback as JSX.Element;
  }

  const shouldShow = showWhenDisabled ? !isMonetizationEnabled : isMonetizationEnabled;

  if (shouldShow) {
    return children as JSX.Element;
  }

  return fallback as JSX.Element;
}

import { useContext } from 'react';
import { OnDemandContext } from '../';

export default function useSyncContext() {
  const context = useContext(OnDemandContext);
  if (!context) {
    throw new Error('useOnDemandContext must be used within OnDemandProvider');
  }
  return context;
}

import { useSelector } from '@legendapp/state/react';
import { propertyState, propertyActions } from '../store/legend/propertyStore';
import { useEffect } from 'react';

export function useProperties() {
  const record = useSelector(() => propertyState.properties.get());
  const isLoading = useSelector(() => propertyState.isLoading.get());

  useEffect(() => {
    if (Object.keys(record).length === 0) {
      propertyActions.loadAll();
    }
  }, []);

  const list = Object.values(record).sort((a, b) => b.updatedAt - a.updatedAt);

  return {
    properties: list,
    isLoading,
    saveProperty: propertyActions.saveProperty,
    deleteProperty: propertyActions.deleteProperty,
  };
}

export function useProperty(id: string) {
  return useSelector(() => propertyState.properties[id]?.get());
}

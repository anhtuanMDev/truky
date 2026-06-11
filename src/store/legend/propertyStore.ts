import { observable } from '@legendapp/state';
import { Property } from '../../domain/models/types';
import { propertyRepository } from '../../storage/repositories/PropertyRepository';

interface PropertyState {
  properties: Record<string, Property>;
  isLoading: boolean;
}

export const propertyState = observable<PropertyState>({
  properties: {},
  isLoading: true,
});

export const propertyActions = {
  loadAll: () => {
    propertyState.isLoading.set(true);
    try {
      const all = propertyRepository.getAll();
      const pMap: Record<string, Property> = {};
      all.forEach(p => { pMap[p.id] = p; });
      propertyState.properties.set(pMap);
    } finally {
      propertyState.isLoading.set(false);
    }
  },
  saveProperty: (prop: Property) => {
    propertyRepository.save(prop);
    propertyState.properties[prop.id].set(prop);
  },
  deleteProperty: (id: string) => {
    propertyRepository.delete(id);
    propertyState.properties[id].delete();
  }
};

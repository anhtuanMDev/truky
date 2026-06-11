import { Property } from '../../domain/models/types';
import { BaseRepository } from './BaseRepository';
import { StorageKeys } from '../mmkv/instance';

export class PropertyRepository extends BaseRepository<Property> {
  constructor() {
    super(StorageKeys.PROPERTIES_INDEX, 'property:');
  }
}

export const propertyRepository = new PropertyRepository();

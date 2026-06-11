import { Person } from '../../domain/models/types';
import { BaseRepository } from './BaseRepository';
import { StorageKeys } from '../mmkv/instance';

export class PeopleRepository extends BaseRepository<Person> {
  constructor() {
    super(StorageKeys.PEOPLE_INDEX, 'people:');
  }

  public search(query: string): Person[] {
    const all = this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(p => 
      p.fullName.toLowerCase().includes(lowerQuery) || 
      (p.nationalId && p.nationalId.includes(query)) ||
      (p.phone && p.phone.includes(query))
    );
  }
}

export const peopleRepository = new PeopleRepository();

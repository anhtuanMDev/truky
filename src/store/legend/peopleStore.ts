import { observable } from '@legendapp/state';
import { Person } from '../../domain/models/types';
import { peopleRepository } from '../../storage/repositories/PeopleRepository';

interface PeopleState {
  people: Record<string, Person>;
  isLoading: boolean;
}

export const peopleState = observable<PeopleState>({
  people: {},
  isLoading: true,
});

export const peopleActions = {
  loadAll: () => {
    peopleState.isLoading.set(true);
    try {
      const all = peopleRepository.getAll();
      const peopleMap: Record<string, Person> = {};
      all.forEach(p => {
        peopleMap[p.id] = p;
      });
      peopleState.people.set(peopleMap);
    } finally {
      peopleState.isLoading.set(false);
    }
  },
  
  savePerson: (person: Person) => {
    peopleRepository.save(person);
    peopleState.people[person.id].set(person);
  },
  
  deletePerson: (id: string) => {
    peopleRepository.delete(id);
    peopleState.people[id].delete();
  }
};

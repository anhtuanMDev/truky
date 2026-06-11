import { useSelector } from '@legendapp/state/react';
import { peopleState, peopleActions } from '../store/legend/peopleStore';
import { useEffect } from 'react';

export function usePeople() {
  const peopleRecord = useSelector(() => peopleState.people.get());
  const isLoading = useSelector(() => peopleState.isLoading.get());

  useEffect(() => {
    // Load data from MMKV once when the hook is used
    if (Object.keys(peopleRecord).length === 0) {
      peopleActions.loadAll();
    }
  }, []);

  const peopleList = Object.values(peopleRecord).sort((a, b) => b.updatedAt - a.updatedAt);

  return {
    people: peopleList,
    isLoading,
    savePerson: peopleActions.savePerson,
    deletePerson: peopleActions.deletePerson,
  };
}

export function usePerson(id: string) {
  return useSelector(() => peopleState.people[id]?.get());
}

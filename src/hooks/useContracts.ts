import { useSelector } from '@legendapp/state/react';
import { contractState, contractActions } from '../store/legend/contractStore';
import { useEffect } from 'react';

export function useContracts() {
  const record = useSelector(() => contractState.contracts.get());
  const isLoading = useSelector(() => contractState.isLoading.get());

  useEffect(() => {
    if (Object.keys(record).length === 0) {
      contractActions.loadAll();
    }
  }, []);

  const list = Object.values(record).sort((a, b) => b.updatedAt - a.updatedAt);

  return {
    contracts: list,
    isLoading,
    saveContract: contractActions.saveContract,
    deleteContract: contractActions.deleteContract,
  };
}

export function useContract(id: string) {
  return useSelector(() => contractState.contracts[id]?.get());
}

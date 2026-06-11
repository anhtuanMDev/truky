import { observable } from '@legendapp/state';
import { Contract } from '../../domain/models/types';
import { contractRepository } from '../../storage/repositories/ContractRepository';

interface ContractState {
  contracts: Record<string, Contract>;
  isLoading: boolean;
}

export const contractState = observable<ContractState>({
  contracts: {},
  isLoading: true,
});

export const contractActions = {
  loadAll: () => {
    contractState.isLoading.set(true);
    try {
      const all = contractRepository.getAll();
      const pMap: Record<string, Contract> = {};
      all.forEach(p => { pMap[p.id] = p; });
      contractState.contracts.set(pMap);
    } finally {
      contractState.isLoading.set(false);
    }
  },
  saveContract: (contract: Contract) => {
    contractRepository.save(contract);
    contractState.contracts[contract.id].set(contract);
  },
  deleteContract: (id: string) => {
    contractRepository.delete(id);
    contractState.contracts[id].delete();
  }
};

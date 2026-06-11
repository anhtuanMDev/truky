import { Contract } from '../../domain/models/types';
import { BaseRepository } from './BaseRepository';
import { StorageKeys } from '../mmkv/instance';

export class ContractRepository extends BaseRepository<Contract> {
  constructor() {
    super(StorageKeys.CONTRACTS_INDEX, 'contract:');
  }
}

export const contractRepository = new ContractRepository();

import { storage } from '../mmkv/instance';

export class BaseRepository<T extends { id: string }> {
  protected indexKey: string;
  protected prefix: string;

  constructor(indexKey: string, prefix: string) {
    this.indexKey = indexKey;
    this.prefix = prefix;
  }

  protected getIndex(): string[] {
    const indexStr = storage.getString(this.indexKey);
    return indexStr ? JSON.parse(indexStr) : [];
  }

  protected saveIndex(index: string[]): void {
    storage.set(this.indexKey, JSON.stringify(index));
  }

  public get(id: string): T | null {
    const dataStr = storage.getString(`${this.prefix}${id}`);
    return dataStr ? JSON.parse(dataStr) : null;
  }

  public getAll(): T[] {
    const index = this.getIndex();
    return index.map((id) => this.get(id)).filter((item): item is T => item !== null);
  }

  public save(item: T): void {
    const key = `${this.prefix}${item.id}`;
    storage.set(key, JSON.stringify(item));
    
    const index = this.getIndex();
    if (!index.includes(item.id)) {
      index.push(item.id);
      this.saveIndex(index);
    }
  }

  public delete(id: string): void {
    storage.remove(`${this.prefix}${id}`);
    const index = this.getIndex();
    this.saveIndex(index.filter(item => item !== id));
  }
}

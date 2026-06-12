import { BaseRepository } from '../src/storage/repositories/BaseRepository';
import { storage } from '../src/storage/mmkv/instance';

describe('BaseRepository (MMKV Storage & Persistence)', () => {
  interface DummyItem {
    id: string;
    name: string;
  }

  let repository: BaseRepository<DummyItem>;

  beforeEach(() => {
    // Reset the mocked MMKV storage before each test
    jest.clearAllMocks();
    (storage.getString as jest.Mock).mockReturnValue(undefined);
    repository = new BaseRepository<DummyItem>('DUMMY_INDEX', 'DUMMY_');
  });

  it('1. Trả về mảng rỗng khi chưa có dữ liệu (Initial load)', () => {
    const items = repository.getAll();
    expect(items).toEqual([]);
    expect(storage.getString).toHaveBeenCalledWith('DUMMY_INDEX');
  });

  it('2. Lưu trữ dữ liệu và thêm id vào index (Save data & index)', () => {
    const dummy: DummyItem = { id: 'item1', name: 'Test 1' };
    
    // Simulate current index is empty
    (storage.getString as jest.Mock).mockReturnValueOnce(undefined);
    
    repository.save(dummy);

    // Should save the item
    expect(storage.set).toHaveBeenCalledWith('DUMMY_item1', JSON.stringify(dummy));
    // Should save the updated index
    expect(storage.set).toHaveBeenCalledWith('DUMMY_INDEX', JSON.stringify(['item1']));
  });

  it('3. Lấy ra toàn bộ danh sách khi khởi động app (Load All)', () => {
    const dummy1 = { id: 'item1', name: 'Test 1' };
    const dummy2 = { id: 'item2', name: 'Test 2' };

    // Mock storage to return an index of 2 items
    (storage.getString as jest.Mock).mockImplementation((key: string) => {
      if (key === 'DUMMY_INDEX') return JSON.stringify(['item1', 'item2']);
      if (key === 'DUMMY_item1') return JSON.stringify(dummy1);
      if (key === 'DUMMY_item2') return JSON.stringify(dummy2);
      return undefined;
    });

    const items = repository.getAll();
    expect(items.length).toBe(2);
    expect(items[0].name).toBe('Test 1');
    expect(items[1].name).toBe('Test 2');
  });

  it('4. Xoá dữ liệu và cập nhật index (Delete data)', () => {
    // Mock existing index
    (storage.getString as jest.Mock).mockImplementation((key: string) => {
      if (key === 'DUMMY_INDEX') return JSON.stringify(['item1', 'item2']);
      return undefined;
    });

    repository.delete('item1');

    // Should delete the item
    expect(storage.remove).toHaveBeenCalledWith('DUMMY_item1');
    // Should update the index
    expect(storage.set).toHaveBeenCalledWith('DUMMY_INDEX', JSON.stringify(['item2']));
  });

  it('5. Trả về null khi get dữ liệu không tồn tại (Missing data)', () => {
    (storage.getString as jest.Mock).mockReturnValue(undefined);
    const item = repository.get('missing');
    expect(item).toBeNull();
  });
});

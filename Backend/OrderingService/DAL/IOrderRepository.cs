using OrderingService.Models;

namespace OrderingService.DAL;

public interface IOrderRepository
{
    Task<IEnumerable<Order>> GetAllAsync();
    Task<Order?> GetByIdAsync(int id);
    Task<int> CreateAsync(Order order);
    Task<bool> DeleteAsync(int id);

    Task UpdateAsync(Order order);
}

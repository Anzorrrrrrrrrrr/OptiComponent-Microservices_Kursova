using OrderingService.DAL;
using OrderingService.External;
using OrderingService.Models;
using OrderingService.Metrics;          
using Microsoft.Extensions.Logging;

namespace OrderingService.BLL;

public class OrderService
{
    private readonly IOrderRepository _repo;
    private readonly GrpcCatalogClient _catalogClient;
    private readonly ILogger<OrderService> _logger;
    private readonly IEventPublisher _eventPublisher;   

    public OrderService(
        IOrderRepository repo,
        GrpcCatalogClient catalogClient,
        ILogger<OrderService> logger,
        IEventPublisher eventPublisher)                 
    {
        _repo = repo;
        _catalogClient = catalogClient;
        _logger = logger;
        _eventPublisher = eventPublisher;              
    }




    //dddd
    public async Task<bool> UpdateStatusAsync(int id, string newStatus)
    {
        // 1. Шукаємо замовлення через _repo
        var entity = await _repo.GetByIdAsync(id);
        if (entity == null)
        {
            _logger.LogWarning("Try update order {Id}, but it not found", id);
            return false;
        }

        // 2. Оновлюємо ТІЛЬКИ статус
        entity.Status = newStatus;

        // 3. Зберігаємо зміни через _repo
        await _repo.UpdateAsync(entity);

        _logger.LogInformation("Order {Id} status updated to {Status}", id, newStatus);
        return true;
    }

    public async Task<IEnumerable<Order>> GetAllAsync()
    {
        var orders = await _repo.GetAllAsync();
        _logger.LogInformation("Returned {Count} orders", orders.Count());
        return orders;
    }

    public async Task<Order?> GetByIdAsync(int id)
    {
        var order = await _repo.GetByIdAsync(id);
        if (order == null)
        {
            _logger.LogWarning("Order with id {Id} not found", id);
        }
        else
        {
            _logger.LogInformation("Order with id {Id} returned", id);
        }

        return order;
    }

    public async Task<int> CreateAsync(Order order)
    {
        _logger.LogInformation("Creating order for project {ProjectName}", order.ProjectName);

        // gRPC перевірка компонентів
        foreach (var item in order.Items)
        {
            var exists = await _catalogClient.ComponentExistsByNameAsync(item.ComponentName);
            if (!exists)
            {
                _logger.LogWarning("Component '{ComponentName}' does not exist. Order is invalid.",
                    item.ComponentName);

                throw new InvalidOperationException(
                    $"Component '{item.ComponentName}' does not exist in CatalogService.");
            }
        }

        order.CreatedAt = DateTime.UtcNow;
        var id = await _repo.CreateAsync(order);
        order.Id = id;                     

        // 🔹 1) метрика
        AppMetrics.OrderCreated();

        // 🔹 2) публікуємо подію в RabbitMQ
        await _eventPublisher.PublishOrderCreatedAsync(order);

        _logger.LogInformation("Order {Id} created successfully {@Order}", id, order);
        return id;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var result = await _repo.DeleteAsync(id);
        if (result)
            _logger.LogInformation("Order {Id} deleted", id);
        else
            _logger.LogWarning("Try delete order {Id}, but it not found", id);

        return result;
    }
}

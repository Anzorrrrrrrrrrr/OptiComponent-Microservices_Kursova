using OrderingService.Models;

namespace OrderingService.External;

public interface IEventPublisher
{
    Task PublishOrderCreatedAsync(Order order);
}

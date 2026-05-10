using RabbitMQ.Client.Events; // Add this using directive

public class RabbitMqEventPublisher : IEventPublisher
{
    // ... existing code ...

    public async Task PublishOrderCreatedAsync(Order order)
    {
        var factory = new RmqConnectionFactory
        {
            HostName = _config["RabbitMq:Host"] ?? throw new ArgumentNullException("RabbitMq:Host"),
            UserName = _config["RabbitMq:UserName"] ?? throw new ArgumentNullException("RabbitMq:UserName"),
            Password = _config["RabbitMq:Password"] ?? throw new ArgumentNullException("RabbitMq:Password")
        };

        using var connection = factory.CreateConnection(); // Change to CreateConnection
        using var channel = connection.CreateModel();

        // ... existing code ...
    }
}

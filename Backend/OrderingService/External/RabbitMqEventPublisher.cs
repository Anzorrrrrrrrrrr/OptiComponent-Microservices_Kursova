using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using OrderingService.Events;
using OrderingService.Models;
using RabbitMQ.Client;

namespace OrderingService.External;

public class RabbitMqEventPublisher : IEventPublisher
{
    private readonly IConfiguration _config;
    private readonly ILogger<RabbitMqEventPublisher> _logger;

    public RabbitMqEventPublisher(IConfiguration config, ILogger<RabbitMqEventPublisher> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task PublishOrderCreatedAsync(Order order)
    {
        var factory = new ConnectionFactory
        {
            HostName = _config["RabbitMq:Host"] ?? "localhost",
            UserName = _config["RabbitMq:UserName"] ?? "guest",
            Password = _config["RabbitMq:Password"] ?? "guest"
        };

        await using var connection = await factory.CreateConnectionAsync();
        await using var channel = await connection.CreateChannelAsync();

        // Отримуємо назву черги з конфігурації (або використовуємо дефолтну)
        var queueName = _config["RabbitMq:Queue"] ?? "order_created_queue";

        // Гарантуємо, що черга існує (durable: true)
        await channel.QueueDeclareAsync(
            queue: queueName,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null);

        var message = new OrderCreatedEvent
        {
            OrderId = order.Id,
            ProjectName = order.ProjectName,
            CreatedAt = order.CreatedAt,
            Items = order.Items.Select(i => new OrderItemDto
            {
                ComponentName = i.ComponentName,
                Quantity = i.Quantity
            }).ToList()
        };

        var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));
        var props = new BasicProperties();

        // Публікуємо напряму в чергу (exchange: "")
        await channel.BasicPublishAsync(
            exchange: "",
            routingKey: queueName,
            mandatory: false,
            basicProperties: props,
            body: body,
            cancellationToken: CancellationToken.None);

        _logger.LogInformation("Published OrderCreated event directly to queue {Queue} for order {OrderId}", queueName, order.Id);
    }
}
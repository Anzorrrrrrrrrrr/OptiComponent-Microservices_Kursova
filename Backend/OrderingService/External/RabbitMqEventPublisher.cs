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
            HostName = _config["RabbitMq:Host"],
            UserName = _config["RabbitMq:UserName"],
            Password = _config["RabbitMq:Password"]
        };

        // новий API: асинхронний конекшен + канал
        await using var connection = await factory.CreateConnectionAsync();
        await using var channel = await connection.CreateChannelAsync();

        var exchange = _config["RabbitMq:Exchange"];
        var routingKey = _config["RabbitMq:RoutingKey"];

        // асинхронне оголошення exchange
        await channel.ExchangeDeclareAsync(exchange, ExchangeType.Topic, durable: true);

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

        await channel.BasicPublishAsync(
            exchange: exchange,
            routingKey: routingKey,
            mandatory: false,
            basicProperties: props,
            body: body,
            cancellationToken: CancellationToken.None);

        _logger.LogInformation("Published OrderCreated event for order {OrderId}", order.Id);

    }
}

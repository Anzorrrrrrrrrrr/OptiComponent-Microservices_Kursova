using System.Text;
using System.Text.Json;
using InventoryService.Application.Interfaces;
using InventoryService.Domain.Entities;
using InventoryService.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace InventoryService.Messaging;

public class RabbitMqOrderCreatedConsumer : BackgroundService
{
    private readonly IServiceProvider _services;
    private readonly IConfiguration _config;
    private readonly ILogger<RabbitMqOrderCreatedConsumer> _logger;

    private IConnection? _connection;
    private IChannel? _channel;

    public RabbitMqOrderCreatedConsumer(
        IServiceProvider services,
        IConfiguration config,
        ILogger<RabbitMqOrderCreatedConsumer> logger)
    {
        _services = services;
        _config = config;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory
        {
            HostName = _config["RabbitMq:Host"],
            UserName = _config["RabbitMq:UserName"],
            Password = _config["RabbitMq:Password"]
        };

        _connection = await factory.CreateConnectionAsync(stoppingToken);
        _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

        var exchange = _config["RabbitMq:Exchange"];
        var queue = _config["RabbitMq:Queue"];
        var routingKey = _config["RabbitMq:RoutingKey"];

        await _channel.ExchangeDeclareAsync(
            exchange: exchange,
            type: ExchangeType.Topic,
            durable: true,
            cancellationToken: stoppingToken);

        await _channel.QueueDeclareAsync(
            queue: queue,
            durable: true,
            exclusive: false,
            autoDelete: false,
            arguments: null,
            cancellationToken: stoppingToken);

        await _channel.QueueBindAsync(
            queue: queue,
            exchange: exchange,
            routingKey: routingKey,
            cancellationToken: stoppingToken);

        var consumer = new AsyncEventingBasicConsumer(_channel);

        consumer.ReceivedAsync += async (sender, ea) =>
        {
            try
            {
                var json = Encoding.UTF8.GetString(ea.Body.ToArray());
                var evt = JsonSerializer.Deserialize<OrderCreatedEvent>(json);

                if (evt is null)
                {
                    _logger.LogWarning("Failed to deserialize OrderCreatedEvent");
                    return;
                }

                using var scope = _services.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<IStockItemRepository>();

                // Проста логіка: збільшуємо TotalQuantity по ComponentName
                foreach (var item in evt.Items)
                {
                    var all = await repo.GetAllAsync();
                    var stock = all.FirstOrDefault(s => s.ComponentName == item.ComponentName);

                    if (stock is null)
                    {
                        stock = new StockItem
                        {
                            ComponentId = 0, // можна залишити 0 або завести мапінг з Catalog
                            ComponentName = item.ComponentName,
                            TotalQuantity = item.Quantity
                        };
                        await repo.AddAsync(stock);
                    }
                    else
                    {
                        stock.TotalQuantity += item.Quantity;
                        await repo.UpdateAsync(stock);
                    }
                }

                _logger.LogInformation(
                    "OrderCreated received for order {OrderId}. Inventory updated.",
                    evt.OrderId);

                await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling OrderCreated message");
                // якщо треба – можна зробити Nack + requeue
            }
        };

        await _channel.BasicConsumeAsync(
            queue: queue,
            autoAck: false,
            consumer: consumer,
            cancellationToken: stoppingToken);

        _logger.LogInformation("RabbitMQ consumer for OrderCreated started");

        // Тримаємо сервіс живим
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(1000, stoppingToken);
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Stopping RabbitMQ consumer");

        if (_channel is not null)
            await _channel.CloseAsync(cancellationToken: cancellationToken);

        if (_connection is not null)
            await _connection.CloseAsync(cancellationToken: cancellationToken);

        await base.StopAsync(cancellationToken);
    }
}

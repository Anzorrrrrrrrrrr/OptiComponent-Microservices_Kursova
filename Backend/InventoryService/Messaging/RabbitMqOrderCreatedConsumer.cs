using InventoryService.Application.Interfaces;
using InventoryService.Domain.Entities;
using InventoryService.Domain.ValueObjects;
using InventoryService.Events;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Text.Json;
using InventoryService.Domain.ValueObjects;
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
        try
        {
            var factory = new ConnectionFactory
            {
                HostName = _config["RabbitMq:Host"] ?? "localhost",
                UserName = _config["RabbitMq:UserName"] ?? _config["RabbitMq:Username"] ?? "guest",
                Password = _config["RabbitMq:Password"] ?? "guest"
            };

            _connection = await factory.CreateConnectionAsync(stoppingToken);
            _channel = await _connection.CreateChannelAsync(cancellationToken: stoppingToken);

            var exchange = _config["RabbitMq:Exchange"] ?? "orders_exchange";
            var queue = _config["RabbitMq:Queue"] ?? "order_created_queue";
            var routingKey = _config["RabbitMq:RoutingKey"] ?? "order.created";

            await _channel.QueueDeclareAsync(
                queue: queue, durable: true, exclusive: false, autoDelete: false, arguments: null, cancellationToken: stoppingToken);

            await _channel.ExchangeDeclareAsync(
                exchange: exchange, type: ExchangeType.Topic, durable: true, cancellationToken: stoppingToken);

            await _channel.QueueBindAsync(
                queue: queue, exchange: exchange, routingKey: routingKey, cancellationToken: stoppingToken);

            _logger.LogInformation("Успішно підключено до RabbitMQ. Слухаємо чергу: {Queue}", queue);

            var consumer = new AsyncEventingBasicConsumer(_channel);
            var jsonOptions = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

            consumer.ReceivedAsync += async (sender, ea) =>
            {
                try
                {
                    var json = Encoding.UTF8.GetString(ea.Body.ToArray());
                    _logger.LogInformation("Отримано повідомлення з RabbitMQ: {Json}", json);

                    using var doc = JsonDocument.Parse(json);
                    var root = doc.RootElement;

                    if (root.TryGetProperty("OrderId", out var orderIdElem) && root.TryGetProperty("Items", out var itemsElem))
                    {
                        var orderId = orderIdElem.GetInt32();

                        using var scope = _services.CreateScope();
                        var repo = scope.ServiceProvider.GetRequiredService<IStockItemRepository>();
                        var allStock = (await repo.GetAllAsync()).ToList();

                        var mongoConn = _config["MongoSettings:ConnectionString"] ?? "mongodb://localhost:27017";
                        var mongoDbName = _config["MongoSettings:DatabaseName"] ?? "InventoryDb";
                        var mongoClient = new MongoClient(mongoConn);
                        var database = mongoClient.GetDatabase(mongoDbName);
                        var collection = database.GetCollection<StockItem>("StockItems");

                        foreach (var itemElem in itemsElem.EnumerateArray())
                        {
                            var componentName = itemElem.GetProperty("ComponentName").GetString();
                            var quantity = itemElem.GetProperty("Quantity").GetInt32();
                            var componentId = itemElem.TryGetProperty("ComponentId", out var idElem) ? idElem.GetInt32() : 0;
                            var currentStock = itemElem.TryGetProperty("CurrentStock", out var stockElem) ? stockElem.GetInt32() : 0;

                            if (string.IsNullOrWhiteSpace(componentName))
                                continue;

                            var stock = allStock.FirstOrDefault(s =>
                                !string.IsNullOrWhiteSpace(s.ComponentName) &&
                                s.ComponentName.Trim().Equals(componentName.Trim(), StringComparison.OrdinalIgnoreCase));

                            if (stock is not null)
                            {
                                stock.TotalQuantity = Math.Max(0, stock.TotalQuantity - quantity);
                                stock.StockHistory ??= new List<StockHistory>();
                                stock.StockHistory.Add(new StockHistory
                                {
                                    Date = DateTime.UtcNow,
                                    Action = $"Автоматичне списання (Замовлення #{orderId})",
                                    Quantity = -quantity
                                });

                                await repo.UpdateAsync(stock);
                                _logger.LogInformation("Inventory updated in MongoDB for {Component}: -{Qty} pcs.", stock.ComponentName, quantity);
                            }
                            else
                            {
                                // Якщо деталі не було в MongoDB, створюємо її з реальним ID та кількістю
                                var newStock = new StockItem
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    ComponentId = componentId,
                                    ComponentName = componentName.Trim(),
                                    TotalQuantity = Math.Max(0, currentStock), // Встановлюємо актуальний залишок
                                    StockHistory = new List<StockHistory>
                                    {
                                        new StockHistory
                                        {
                                            Date = DateTime.UtcNow,
                                            Action = $"Автоматичне списання (Замовлення #{orderId})",
                                            Quantity = -quantity
                                        }
                                    }
                                };

                                await collection.InsertOneAsync(newStock, cancellationToken: stoppingToken);
                                allStock.Add(newStock);

                                _logger.LogInformation("Створено новий запис у MongoDB для '{ComponentName}' з ID {Id} (Замовлення #{OrderId})",
                                    newStock.ComponentName, newStock.ComponentId, orderId);
                            }
                        }
                    }

                    await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false, cancellationToken: stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Помилка під час обробки отриманого повідомлення");
                }
            };

            await _channel.BasicConsumeAsync(queue: queue, autoAck: false, consumer: consumer, cancellationToken: stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                await Task.Delay(1000, stoppingToken);
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex)
        {
            _logger.LogError(ex, "КРИТИЧНА ПОМИЛКА RabbitMQ: {Message}", ex.Message);
        }
    }
}
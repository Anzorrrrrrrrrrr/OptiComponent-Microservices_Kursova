using System.Text;
using System.Text.Json;
using CatalogService.BLL.DTOs;
using CatalogService.BLL.Services;
using CatalogService.DAL.Context;
using CatalogService.DAL.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RabbitMQ.Client;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        IOrderService orderService,
        AppDbContext context,
        IConfiguration config,
        ILogger<OrdersController> logger)
    {
        _orderService = orderService;
        _context = context;
        _config = config;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
    {
        try
        {
            var order = await _orderService.CreateOrderAsync(dto);

            var eventItems = new List<object>();
            if (order.Items != null)
            {
                foreach (var item in order.Items)
                {
                    // Отримуємо повну інформацію про компонент з БД каталогу
                    var component = item.Component ?? await _context.Components
                        .FirstOrDefaultAsync(c => c.Id == item.ComponentId);

                    if (component != null)
                    {
                        eventItems.Add(new
                        {
                            ComponentId = component.Id,
                            ComponentName = component.Name,
                            Quantity = item.Quantity,
                            CurrentStock = component.Quantity // Реальна кількість на складі в каталозі
                        });
                    }
                }
            }

            // Публікуємо подію в RabbitMQ
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _config["RabbitMq:Host"] ?? "localhost",
                    UserName = _config["RabbitMq:UserName"] ?? _config["RabbitMq:Username"] ?? "guest",
                    Password = _config["RabbitMq:Password"] ?? "guest"
                };

                await using var connection = await factory.CreateConnectionAsync();
                await using var channel = await connection.CreateChannelAsync();

                var queueName = _config["RabbitMq:Queue"] ?? "order_created_queue";

                await channel.QueueDeclareAsync(
                    queue: queueName,
                    durable: true,
                    exclusive: false,
                    autoDelete: false,
                    arguments: null);

                var orderCreatedEvent = new
                {
                    OrderId = order.Id,
                    ProjectName = order.CustomerName ?? "Catalog Order",
                    CreatedAt = order.OrderDate,
                    Items = eventItems
                };

                var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(orderCreatedEvent));
                var props = new BasicProperties();

                await channel.BasicPublishAsync(
                    exchange: "",
                    routingKey: queueName,
                    mandatory: false,
                    basicProperties: props,
                    body: body);

                _logger.LogInformation("Подію про замовлення #{OrderId} успішно відправлено в чергу {Queue}", order.Id, queueName);
            }
            catch (Exception mqEx)
            {
                _logger.LogError(mqEx, "Не вдалося відправити подію в RabbitMQ для замовлення #{OrderId}", order.Id);
            }

            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Component)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new
            {
                o.Id,
                o.OrderNumber,
                o.CustomerName,
                o.OrderDate,
                o.TotalPrice,
                Status = o.Status.ToString(),
                ItemsCount = o.Items.Count,
                Items = o.Items.Select(i => new
                {
                    ComponentName = i.Component.Name,
                    Quantity = i.Quantity,
                    UnitPrice = i.UnitPrice
                })
            })
            .ToListAsync();

        return Ok(orders);
    }
}
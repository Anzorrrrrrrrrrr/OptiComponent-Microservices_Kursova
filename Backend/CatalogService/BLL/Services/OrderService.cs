using CatalogService.BLL.DTOs;
using CatalogService.DAL.Context;
using CatalogService.DAL.Entities;

namespace CatalogService.BLL.Services;

public interface IOrderService
{
    Task<Order> CreateOrderAsync(OrderCreateDto dto);
}

public class OrderService : IOrderService
{
    private readonly AppDbContext _context;

    public OrderService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Order> CreateOrderAsync(OrderCreateDto dto)
    {
        // 1. Створюємо "шапку" замовлення
        var order = new Order
        {
            // Генеруємо унікальний номер (напр. ORD-2026-A1B2)
            OrderNumber = $"ORD-{DateTime.UtcNow:yyyy}-{Guid.NewGuid().ToString().Substring(0, 4).ToUpper()}",
            CustomerName = dto.CustomerName,
            OrderDate = DateTime.UtcNow,
            Status = OrderStatus.New
        };

        decimal totalPrice = 0;

        
        foreach (var itemDto in dto.Items)
        {
            // Шукаємо деталь у базі
            var component = await _context.Components.FindAsync(itemDto.ComponentId);

            if (component == null)
                throw new Exception($"Компонент з ID {itemDto.ComponentId} не знайдено.");

            // Перевірка залишку на складі
            if (component.Quantity < itemDto.Quantity)
                throw new Exception($"Недостатньо на складі! Запитали {itemDto.Quantity}, але є лише {component.Quantity} (Деталь: {component.Name}).");

            
            component.Quantity -= itemDto.Quantity;

            // Додаємо деталь у чек
            var orderItem = new OrderItem
            {
                ComponentId = component.Id,
                Quantity = itemDto.Quantity,
                UnitPrice = component.Price // Фіксуємо ціну на момент покупки
            };

            order.Items.Add(orderItem);
            totalPrice += (orderItem.Quantity * orderItem.UnitPrice);
        }

        order.TotalPrice = totalPrice;

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return order;
    }
}
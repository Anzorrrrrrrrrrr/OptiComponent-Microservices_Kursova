using CatalogService.BLL.DTOs;
using CatalogService.BLL.Services;
using CatalogService.DAL.Context;
using CatalogService.DAL.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;
    private readonly AppDbContext _context;

    // Зверніть увагу: додали AppDbContext у конструктор, щоб швидко діставати замовлення
    public OrdersController(IOrderService orderService, AppDbContext context)
    {
        _orderService = orderService;
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
    {
        try
        {
            var order = await _orderService.CreateOrderAsync(dto);
            return Ok(order);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // НОВИЙ МЕТОД ДЛЯ REACT: Отримати всі замовлення
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
                // НОВЕ: Передаємо список покупок у React
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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderingService.BLL;
using OrderingService.Models;

namespace OrderingService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly OrderService _service;

    public OrdersController(OrderService service)
    {
        _service = service;
    }

    //[HttpGet("test-error")]
    //public IActionResult TestError()
    //{
    //    throw new Exception("Test error");
    //}
   

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await _service.GetByIdAsync(id);
        return order == null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Order order)
    {
        var id = await _service.CreateAsync(order);
        return CreatedAtAction(nameof(GetById), new { id }, order);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusDto dto)
    {
        
        if (dto == null || string.IsNullOrWhiteSpace(dto.Status))
        {
            return BadRequest(new { message = "Статус не може бути порожнім" });
        }

        
        var isUpdated = await _service.UpdateStatusAsync(id, dto.Status);

        if (!isUpdated)
        {
            return NotFound(new { message = $"Замовлення з ID {id} не знайдено" });
        }

        return Ok(new { message = $"Статус замовлення успішно змінено на '{dto.Status}'" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _service.DeleteAsync(id);
        return success ? NoContent() : NotFound();
    }

    public class UpdateOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}

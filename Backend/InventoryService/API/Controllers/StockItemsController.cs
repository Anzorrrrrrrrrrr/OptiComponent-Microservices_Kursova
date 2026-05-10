using InventoryService.Application.Commands.AddStockItem;
using InventoryService.Application.Commands.UpdateStockItem;
using InventoryService.Application.Commands.DeleteStockItem;
using InventoryService.Application.Queries.GetAllStockItems;
using InventoryService.Application.Queries.GetStockItemById;
using InventoryService.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using InventoryService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace InventoryService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockItemsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IStockItemRepository _repo;
    public StockItemsController(IMediator mediator, IStockItemRepository repo)
    {
        _mediator = mediator;
        _repo = repo;
    }


    //[HttpGet("test-error")]
    //public IActionResult TestError()
    //{
    //    throw new Exception("Test error");
    //}

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var items = await _mediator.Send(new GetAllStockItemsQuery());
        return Ok(items);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var item = await _mediator.Send(new GetStockItemByIdQuery(id));
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] StockItem item)
    {
        await _mediator.Send(new AddStockItemCommand(item));
        return Ok();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] StockItem item)
    {
        item.Id = id;
        await _mediator.Send(new UpdateStockItemCommand(item));
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _mediator.Send(new DeleteStockItemCommand(id));
        return NoContent();
    }

    [HttpGet("filter")]
    public async Task<IActionResult> Filter(
    [FromQuery] string? componentName,
    [FromQuery] int? minQuantity,
    [FromQuery] int? maxQuantity,
    [FromQuery] string? sortBy = "ComponentName",
    [FromQuery] string? order = "asc",
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10)
    {
        var result = await _repo.FilterAsync(componentName, minQuantity, maxQuantity, sortBy, order, pageNumber, pageSize);
        return Ok(result);
    }

}

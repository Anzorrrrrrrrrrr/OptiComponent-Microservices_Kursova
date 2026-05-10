using CatalogService.BLL.DTOs;
using CatalogService.BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace CatalogService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComponentsController : ControllerBase
{
    private readonly ComponentService _service;

    public ComponentsController(ComponentService service)
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

    [HttpGet("filter")]
    public async Task<IActionResult> Filter(
        [FromQuery] string? name,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sortBy = "Name",
        [FromQuery] string? order = "asc",
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _service.FilterAsync(
            name, minPrice, maxPrice,
            sortBy ?? "Name",
            order ?? "asc",
            pageNumber,
            pageSize);

        return Ok(result);
    }

    ///hhhhh
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ComponentDto dto)
    {
        var isUpdated = await _service.UpdateAsync(id, dto);

        if (!isUpdated)
        {
            return NotFound(new { message = $"Компонент з ID {id} не знайдено" });
        }

        return Ok(new { message = "Компонент успішно оновлено" });
    }





    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var component = await _service.GetByIdAsync(id);
        return component == null ? NotFound() : Ok(component);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ComponentDto dto)
    {
        await _service.AddAsync(dto);
        return Ok();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return result ? NoContent() : NotFound();
    }
}

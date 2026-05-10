using CatalogService.DAL.Context;
using CatalogService.DAL.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Categories.Select(c => new { c.Id, c.Name }).ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DictionaryCreateDto dto)
    {
        var category = new Category { Name = dto.Name };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return Ok(category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var category = await _context.Categories.FindAsync(id);
            if (category != null)
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
            }
            return NoContent();
        }
        catch (Exception)
        {
            // Захист: якщо до категорії вже прив'язані деталі, SQL не дасть її видалити
            return BadRequest(new { message = "Неможливо видалити категорію, оскільки на складі існують деталі, прив'язані до неї." });
        }
    }
}

// Спеціальний клас для отримання назви з React
public class DictionaryCreateDto
{
    public string Name { get; set; } = string.Empty;
}
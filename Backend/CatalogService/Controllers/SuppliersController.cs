using CatalogService.DAL.Context;
using CatalogService.DAL.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SuppliersController : ControllerBase
{
    private readonly AppDbContext _context;

    public SuppliersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _context.Suppliers.Select(s => new { s.Id, s.Name }).ToListAsync());
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] DictionaryCreateDto dto)
    {
        var supplier = new Supplier { Name = dto.Name };
        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync();
        return Ok(supplier);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier != null)
            {
                _context.Suppliers.Remove(supplier);
                await _context.SaveChangesAsync();
            }
            return NoContent();
        }
        catch (Exception)
        {
            return BadRequest(new { message = "Неможливо видалити постачальника, оскільки на складі існують деталі, прив'язані до нього." });
        }
    }
}
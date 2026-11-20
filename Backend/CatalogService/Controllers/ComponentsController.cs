using CatalogService.BLL.DTOs;
using CatalogService.BLL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
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

    [HttpGet("export-csv")]
    public async Task<IActionResult> ExportToCsv()
    {
        var components = await _service.GetAllAsync();
        var sb = new StringBuilder();

        // Додаємо UTF-8 BOM для коректного відображення кирилиці в Excel
        sb.AppendLine("ID;SKU;Назва компонента;Категорія;Постачальник;Ціна ($);Кількість (шт.);Загальна вартість ($);Комірка складу;Статус запасу");

        foreach (var item in components)
        {
            var sku = $"OPT-{item.Id:D4}";
            var location = $"Z1-R{(item.Id % 4) + 1}-S{(item.Id % 5) + 1}-B{(item.Id % 10) + 1}";
            var totalValue = item.Price * item.Quantity;
            var status = item.Quantity == 0 ? "Немає в наявності" : (item.Quantity < 5 ? "Критичний залишок" : "В нормі");

            sb.AppendLine($"{item.Id};{sku};\"{item.Name}\";\"{item.CategoryName}\";\"{item.SupplierName}\";{item.Price:F2};{item.Quantity};{totalValue:F2};{location};{status}");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        var fileName = $"OptiComponent_Stock_Report_{DateTime.UtcNow:yyyyMMdd_HHmm}.csv";

        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    [HttpGet("{id}/label")]
    public async Task<IActionResult> GenerateBarcodeLabel(int id)
    {
        var component = await _service.GetByIdAsync(id);
        if (component == null) return NotFound(new { message = "Компонент не знайдено" });

        var sku = $"OPT-{component.Id:D4}";
        var locationCode = $"R{(component.Id % 4) + 1}-S{(component.Id % 5) + 1}-B{(component.Id % 10) + 1}";
        var shortName = component.Name.Length > 18 ? component.Name.Substring(0, 18) : component.Name;

        // Безпечне отримання категорії (перевіряємо і CategoryName, і CategoryId, якщо назви немає)
        string categoryDisplay = !string.IsNullOrWhiteSpace(component.CategoryName)
            ? component.CategoryName
            : $"Категорія #{component.CategoryId}";

        // Генерація команд ZPL (Code 128) для етикетки 32x12 мм
        var zplCommand = $@"^XA
^CI28
^PW256
^LL96
^LH0,0
^FO12,8^A0N,18,18^FD{shortName}^FS
^FO165,8^A0N,16,16^FD{locationCode}^FS
^FO12,30^BY2,2,38^BCN,38,N,N,N^FD{sku}^FS
^FO12,74^A0N,16,16^FD{sku} | ${component.Price:F2}^FS
^XZ";

        return Ok(new
        {
            componentId = component.Id,
            name = component.Name,
            sku = sku,
            category = categoryDisplay, // Тепер тут гарантовано буде назва або ID категорії
            price = component.Price,
            quantity = component.Quantity,
            location = locationCode,
            barcodeType = "Code 128",
            dimensions = "32x12 mm",
            zpl = zplCommand
        });
    }

    [HttpGet("analytics")]
    public async Task<IActionResult> GetWarehouseAnalytics()
    {
        var components = (await _service.GetAllAsync()).ToList();

        var byCategory = components
            .GroupBy(c => string.IsNullOrWhiteSpace(c.CategoryName) ? "Без категорії" : c.CategoryName)
            .Select(g => new
            {
                category = g.Key,
                totalQuantity = g.Sum(x => x.Quantity),
                totalValue = g.Sum(x => x.Quantity * x.Price),
                itemsCount = g.Count()
            })
            .OrderByDescending(x => x.totalValue)
            .ToList();

        var bySupplier = components
            .GroupBy(c => string.IsNullOrWhiteSpace(c.SupplierName) ? "Невідомий" : c.SupplierName)
            .Select(g => new
            {
                supplier = g.Key,
                totalQuantity = g.Sum(x => x.Quantity),
                itemsCount = g.Count()
            })
            .ToList();

        return Ok(new
        {
            totalUniqueComponents = components.Count,
            totalUnitsInStock = components.Sum(c => c.Quantity),
            totalInventoryValue = components.Sum(c => c.Quantity * c.Price),
            criticalStockCount = components.Count(c => c.Quantity < 5),
            outOfStockCount = components.Count(c => c.Quantity == 0),
            categoryDistribution = byCategory,
            supplierDistribution = bySupplier
        });
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

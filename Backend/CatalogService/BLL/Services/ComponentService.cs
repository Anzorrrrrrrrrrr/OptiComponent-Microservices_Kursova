using AutoMapper;
using CatalogService.BLL.DTOs;
using CatalogService.DAL.Entities;
using CatalogService.DAL.Repositories;
using Microsoft.EntityFrameworkCore;
using CatalogService.Metrics;
using Microsoft.Extensions.Logging;

namespace CatalogService.BLL.Services;

public class ComponentService
{
    private readonly IUnitOfWork _uow;
    private readonly IMapper _mapper;
    private readonly ILogger<ComponentService> _logger;

    public ComponentService(
        IUnitOfWork uow,
        IMapper mapper,
        ILogger<ComponentService> logger)
    {
        _uow = uow;
        _mapper = mapper;
        _logger = logger;
    }

    //public async Task<IEnumerable<ComponentDto>> GetAllAsync()
    //{
    //    var components = await _uow.Components.GetAllAsync();
    //    _logger.LogInformation("Returned {Count} components from CatalogDb", components.Count());
    //    return _mapper.Map<IEnumerable<ComponentDto>>(components);
    //}
    public async Task<IEnumerable<ComponentDto>> GetAllAsync()
    {
        // МАГІЯ ТУТ: Кажемо репозиторію підтягнути Категорію і Постачальника
        var components = await _uow.Components.GetAllAsync(
            c => c.Category,
            c => c.Supplier
        );

        _logger.LogInformation("Returned {Count} components from CatalogDb", components.Count());

        // AutoMapper сам побачить ці дані і перекладе їх у ComponentDto!
        return _mapper.Map<IEnumerable<ComponentDto>>(components);
    }
    public async Task<ComponentDto?> GetByIdAsync(int id)
    {
        var entity = await _uow.Components.GetByIdAsync(id);

        if (entity == null)
        {
            _logger.LogWarning("Component with id {Id} not found", id);
            return null;
        }

        _logger.LogInformation("Component with id {Id} returned", id);
        return _mapper.Map<ComponentDto?>(entity);
    }

    public async Task AddAsync(ComponentDto dto)
    {
        var entity = _mapper.Map<Component>(dto);
        await _uow.Components.AddAsync(entity);
        await _uow.SaveChangesAsync();

        // бізнес-лог + метрика
        _logger.LogInformation("Component created {@Component}", entity);
        AppMetrics.ComponentCreated();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var entity = await _uow.Components.GetByIdAsync(id);
        if (entity == null)
        {
            _logger.LogWarning("Try delete component {Id}, but it not found", id);
            return false;
        }

        _uow.Components.Delete(entity);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Component deleted {@Component}", entity);
        return true;
    }


    //kkkk
    public async Task<bool> UpdateAsync(int id, ComponentDto dto)
    {
        // 1. Шукаємо компонент
        var entity = await _uow.Components.GetByIdAsync(id);
        if (entity == null)
        {
            _logger.LogWarning("Try update component {Id}, but it not found", id);
            return false; // Повертаємо false, якщо компонента немає в базі
        }

        // 2. Оновлюємо властивості
        // (Можна використати _mapper.Map(dto, entity), якщо у вас налаштований мапінг для оновлення)
        entity.Name = dto.Name;
        entity.Price = dto.Price;
        entity.Quantity = dto.Quantity;

        // 3. Зберігаємо зміни
        _uow.Components.Update(entity);
        await _uow.SaveChangesAsync();

        _logger.LogInformation("Component updated {@Component}", entity);
        return true;
    }


    public async Task<IEnumerable<ComponentDto>> FilterAsync(
    string? name,
    decimal? minPrice,
    decimal? maxPrice,
    string sortBy = "Name",
    string order = "asc",
    int pageNumber = 1,
    int pageSize = 10)
    {
        // Беремо вже готовий список DTO (не ліземо в DAL)
        var items = (await GetAllAsync()).AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
            items = items.Where(c => c.Name.Contains(name, StringComparison.OrdinalIgnoreCase));

        if (minPrice.HasValue)
            items = items.Where(c => c.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            items = items.Where(c => c.Price <= maxPrice.Value);

        // Сортування
        sortBy = sortBy?.ToLower() ?? "name";
        order = order?.ToLower() ?? "asc";

        items = (sortBy, order) switch
        {
            ("price", "desc") => items.OrderByDescending(c => c.Price),
            ("price", _) => items.OrderBy(c => c.Price),

            ("name", "desc") => items.OrderByDescending(c => c.Name),
            ("name", _) => items.OrderBy(c => c.Name),

            ("categoryname", "desc") => items.OrderByDescending(c => c.CategoryName),
            ("categoryname", _) => items.OrderBy(c => c.CategoryName),

            ("suppliername", "desc") => items.OrderByDescending(c => c.SupplierName),
            ("suppliername", _) => items.OrderBy(c => c.SupplierName),

            _ => items.OrderBy(c => c.Name)
        };

        // Пагінація
        if (pageNumber < 1) pageNumber = 1;
        if (pageSize < 1) pageSize = 10;

        items = items
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize);

        var result = items.ToList();

        _logger.LogInformation(
            "Filtered components: Name={Name}, MinPrice={MinPrice}, MaxPrice={MaxPrice}, SortBy={SortBy}, Order={Order}, Page={Page}, Size={Size}, ResultCount={Count}",
            name, minPrice, maxPrice, sortBy, order, pageNumber, pageSize, result.Count);

        return result;
    }

}

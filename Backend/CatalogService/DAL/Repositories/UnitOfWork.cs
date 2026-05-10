using CatalogService.DAL.Context;
using CatalogService.DAL.Entities;

namespace CatalogService.DAL.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public IGenericRepository<Category> Categories { get; }
    public IGenericRepository<Component> Components { get; }
    public IGenericRepository<Supplier> Suppliers { get; }
    public IGenericRepository<Datasheet> Datasheets { get; }

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Categories = new GenericRepository<Category>(context);
        Components = new GenericRepository<Component>(context);
        Suppliers = new GenericRepository<Supplier>(context);
        Datasheets = new GenericRepository<Datasheet>(context);
    }

    public async Task<int> SaveChangesAsync() => await _context.SaveChangesAsync();

    public void Dispose() => _context.Dispose();
}

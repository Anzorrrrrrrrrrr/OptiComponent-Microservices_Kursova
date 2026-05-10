using CatalogService.DAL.Entities;

namespace CatalogService.DAL.Repositories;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<Component> Components { get; }
    IGenericRepository<Supplier> Suppliers { get; }
    IGenericRepository<Datasheet> Datasheets { get; }
    Task<int> SaveChangesAsync();
}

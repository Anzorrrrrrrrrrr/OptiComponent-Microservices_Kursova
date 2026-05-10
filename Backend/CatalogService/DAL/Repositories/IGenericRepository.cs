
using System.Linq.Expressions;
namespace CatalogService.DAL.Repositories;

public interface IGenericRepository<T> where T : class
{
    //Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> GetAllAsync(params Expression<Func<T, object>>[] includes);
    Task<T?> GetByIdAsync(int id);
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}

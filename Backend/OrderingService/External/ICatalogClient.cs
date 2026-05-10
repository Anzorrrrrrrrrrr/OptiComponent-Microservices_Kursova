using OrderingService.External;

namespace OrderingService.External;

public interface ICatalogClient
{
    /// <summary>
    /// Повертає всі компоненти з CatalogService.
    /// </summary>
    Task<IEnumerable<ComponentDto>> GetAllComponentsAsync();

    /// <summary>
    /// Перевіряє, що компонент з таким ім'ям існує в каталозі.
    /// </summary>
    Task<bool> ComponentExistsByNameAsync(string componentName);
}

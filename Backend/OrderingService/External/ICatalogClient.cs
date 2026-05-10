using OrderingService.External;

namespace OrderingService.External;

public interface ICatalogClient
{
    
    Task<IEnumerable<ComponentDto>> GetAllComponentsAsync();

    
    Task<bool> ComponentExistsByNameAsync(string componentName);
}

using System.Net.Http.Json;

namespace OrderingService.External;

public class CatalogClient : ICatalogClient
{
    private readonly HttpClient _httpClient;

    public CatalogClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<IEnumerable<ComponentDto>> GetAllComponentsAsync()
    {
        var response = await _httpClient.GetAsync("/api/components");
        response.EnsureSuccessStatusCode();

        var data = await response.Content.ReadFromJsonAsync<IEnumerable<ComponentDto>>();
        return data ?? Enumerable.Empty<ComponentDto>();
    }

    public async Task<bool> ComponentExistsByNameAsync(string componentName)
    {
        var components = await GetAllComponentsAsync();
        return components.Any(c => string.Equals(c.Name, componentName,
            StringComparison.OrdinalIgnoreCase));
    }
}

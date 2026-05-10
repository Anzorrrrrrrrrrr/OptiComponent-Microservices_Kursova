using CatalogService.Grpc;
using Grpc.Net.Client;

namespace OrderingService.External;

public class GrpcCatalogClient
{
    private readonly string _catalogUrl;

    public GrpcCatalogClient(IConfiguration config)
    {
        // Використаємо той самий URL, що і для REST
        _catalogUrl = config["ServiceUrls:Catalog"]
                      ?? throw new InvalidOperationException("ServiceUrls:Catalog is not configured");
    }

    public async Task<bool> ComponentExistsByNameAsync(string componentName)
    {
        using var channel = GrpcChannel.ForAddress(_catalogUrl);
        var client = new ComponentsGrpc.ComponentsGrpcClient(channel);

        var reply = await client.GetComponentByNameAsync(
            new GetComponentByNameRequest { Name = componentName });

        return reply.Exists;
    }
}

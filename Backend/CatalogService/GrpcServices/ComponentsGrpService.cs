using CatalogService.DAL.Context;
using CatalogService.Grpc;
using Grpc.Core;
using Microsoft.EntityFrameworkCore;

namespace CatalogService.GrpcServices;

public class ComponentsGrpcService : ComponentsGrpc.ComponentsGrpcBase
{
    private readonly AppDbContext _db;

    public ComponentsGrpcService(AppDbContext db)
    {
        _db = db;
    }

    public override async Task<GetComponentByNameResponse> GetComponentByName(
        GetComponentByNameRequest request,
        ServerCallContext context)
    {
        var entity = await _db.Components
            .Include(c => c.Category)
            .Include(c => c.Supplier)
            .FirstOrDefaultAsync(c => c.Name == request.Name);

        var response = new GetComponentByNameResponse();

        if (entity != null)
        {
            response.Exists = true;
            response.Id = entity.Id;
            response.Name = entity.Name;
            response.Price = (double)entity.Price;
            response.CategoryName = entity.Category?.Name ?? string.Empty;
            response.SupplierName = entity.Supplier?.Name ?? string.Empty;
        }

        return response;
    }
}

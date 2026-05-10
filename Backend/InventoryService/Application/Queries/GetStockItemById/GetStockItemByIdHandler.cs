using InventoryService.Application.Interfaces;
using InventoryService.Domain.Entities;
using MediatR;

namespace InventoryService.Application.Queries.GetStockItemById;

public class GetStockItemByIdHandler : IRequestHandler<GetStockItemByIdQuery, StockItem?>
{
    private readonly IStockItemRepository _repo;

    public GetStockItemByIdHandler(IStockItemRepository repo)
    {
        _repo = repo;
    }

    public async Task<StockItem?> Handle(GetStockItemByIdQuery request, CancellationToken cancellationToken)
    {
        return await _repo.GetByIdAsync(request.Id);
    }
}

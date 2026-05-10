using InventoryService.Application.Interfaces;
using InventoryService.Domain.Entities;
using MediatR;

namespace InventoryService.Application.Queries.GetAllStockItems;

public class GetAllStockItemsHandler : IRequestHandler<GetAllStockItemsQuery, IEnumerable<StockItem>>
{
    private readonly IStockItemRepository _repo;

    public GetAllStockItemsHandler(IStockItemRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<StockItem>> Handle(GetAllStockItemsQuery request, CancellationToken cancellationToken)
        => await _repo.GetAllAsync();
}

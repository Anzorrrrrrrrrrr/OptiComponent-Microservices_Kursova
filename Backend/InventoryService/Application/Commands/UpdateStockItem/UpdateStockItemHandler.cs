using InventoryService.Application.Interfaces;
using MediatR;

namespace InventoryService.Application.Commands.UpdateStockItem;

public class UpdateStockItemHandler : IRequestHandler<UpdateStockItemCommand, Unit>
{
    private readonly IStockItemRepository _repo;

    public UpdateStockItemHandler(IStockItemRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(UpdateStockItemCommand request, CancellationToken cancellationToken)
    {
        await _repo.UpdateAsync(request.Item);
        return Unit.Value;
    }
}

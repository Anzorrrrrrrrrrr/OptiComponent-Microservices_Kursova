using InventoryService.Application.Interfaces;
using MediatR;

namespace InventoryService.Application.Commands.DeleteStockItem;

public class DeleteStockItemHandler : IRequestHandler<DeleteStockItemCommand, Unit>
{
    private readonly IStockItemRepository _repo;

    public DeleteStockItemHandler(IStockItemRepository repo)
    {
        _repo = repo;
    }

    public async Task<Unit> Handle(DeleteStockItemCommand request, CancellationToken cancellationToken)
    {
        await _repo.DeleteAsync(request.Id);
        return Unit.Value;
    }
}

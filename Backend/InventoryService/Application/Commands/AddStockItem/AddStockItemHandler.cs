using InventoryService.Application.Interfaces;
using InventoryService.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Logging;

namespace InventoryService.Application.Commands.AddStockItem;

public class AddStockItemHandler : IRequestHandler<AddStockItemCommand, Unit>
{
    private readonly IStockItemRepository _repo;
    private readonly ILogger<AddStockItemHandler> _logger;

    public AddStockItemHandler(IStockItemRepository repo, ILogger<AddStockItemHandler> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    public async Task<Unit> Handle(AddStockItemCommand request, CancellationToken cancellationToken)
    {
        // використовуємо вже готовий об'єкт, який приходить у команді
        var item = request.Item;

        await _repo.AddAsync(item);

        // 🔹 структурований лог (для пункту 8)
        _logger.LogInformation("New stock item created {@StockItem}", item);

        return Unit.Value;
    }
}

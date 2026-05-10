using InventoryService.Domain.Entities;
using MediatR;

namespace InventoryService.Application.Commands.UpdateStockItem;

public record UpdateStockItemCommand(StockItem Item) : IRequest<Unit>;

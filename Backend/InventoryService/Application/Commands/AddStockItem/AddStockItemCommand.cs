using InventoryService.Domain.Entities;
using MediatR;

namespace InventoryService.Application.Commands.AddStockItem;

public record AddStockItemCommand(StockItem Item) : IRequest<Unit>;

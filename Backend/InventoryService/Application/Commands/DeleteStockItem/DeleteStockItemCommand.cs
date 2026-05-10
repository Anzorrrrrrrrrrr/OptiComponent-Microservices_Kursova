using MediatR;

namespace InventoryService.Application.Commands.DeleteStockItem;

public record DeleteStockItemCommand(string Id) : IRequest<Unit>;

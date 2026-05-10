using InventoryService.Domain.Entities;
using MediatR;

namespace InventoryService.Application.Queries.GetStockItemById;

public record GetStockItemByIdQuery(string Id) : IRequest<StockItem?>;

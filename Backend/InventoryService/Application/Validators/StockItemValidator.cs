using FluentValidation;
using InventoryService.Domain.Entities;

namespace InventoryService.Application.Validators;

public class StockItemValidator : AbstractValidator<StockItem>
{
    public StockItemValidator()
    {
        RuleFor(x => x.ComponentId).GreaterThan(0);
        RuleFor(x => x.ComponentName).NotEmpty().Length(2, 50);
        RuleFor(x => x.TotalQuantity).GreaterThanOrEqualTo(0);
    }
}

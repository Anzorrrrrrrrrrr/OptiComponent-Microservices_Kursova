using FluentValidation;
using InventoryService.Application.Commands.AddStockItem;

namespace InventoryService.Application.Validators;

public class AddStockItemCommandValidator : AbstractValidator<AddStockItemCommand>
{
    public AddStockItemCommandValidator()
    {
        RuleFor(x => x.Item.ComponentId).GreaterThan(0);
        RuleFor(x => x.Item.ComponentName)
            .NotEmpty()
            .Length(2, 50);
        RuleFor(x => x.Item.TotalQuantity).GreaterThanOrEqualTo(0);
    }
}

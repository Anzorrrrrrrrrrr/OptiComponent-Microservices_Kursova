using FluentValidation;
using InventoryService.Application.Commands.UpdateStockItem;

namespace InventoryService.Application.Validators;

public class UpdateStockItemCommandValidator : AbstractValidator<UpdateStockItemCommand>
{
    public UpdateStockItemCommandValidator()
    {
        RuleFor(x => x.Item.Id)
            .NotEmpty().WithMessage("Id is required");

        RuleFor(x => x.Item.ComponentId).GreaterThan(0);
        RuleFor(x => x.Item.ComponentName)
            .NotEmpty()
            .Length(2, 50);
        RuleFor(x => x.Item.TotalQuantity).GreaterThanOrEqualTo(0);
    }
}

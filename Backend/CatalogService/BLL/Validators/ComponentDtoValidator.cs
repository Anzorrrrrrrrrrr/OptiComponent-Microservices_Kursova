using CatalogService.BLL.DTOs;
using FluentValidation;

namespace CatalogService.BLL.Validators;

public class ComponentDtoValidator : AbstractValidator<ComponentDto>
{
    public ComponentDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .Length(2, 100).WithMessage("Name length must be between 2 and 100 characters");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be >= 0");

        RuleFor(x => x.CategoryName)
            .NotEmpty().WithMessage("CategoryName is required");

        RuleFor(x => x.SupplierName)
            .NotEmpty().WithMessage("SupplierName is required");
    }
}

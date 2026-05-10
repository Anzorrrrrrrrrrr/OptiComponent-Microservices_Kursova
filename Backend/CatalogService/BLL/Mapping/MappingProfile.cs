using AutoMapper;
using CatalogService.DAL.Entities;
using CatalogService.BLL.DTOs;

namespace CatalogService.BLL.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Component, ComponentDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category!.Name))
            .ForMember(dest => dest.SupplierName, opt => opt.MapFrom(src => src.Supplier!.Name))
            .ReverseMap();
    }
}

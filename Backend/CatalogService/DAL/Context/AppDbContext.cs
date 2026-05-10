using Microsoft.EntityFrameworkCore;
using CatalogService.DAL.Entities;

namespace CatalogService.DAL.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Component> Components => Set<Component>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Datasheet> Datasheets => Set<Datasheet>();
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>()
            .HasMany(c => c.Components)
            .WithOne(c => c.Category)
            .HasForeignKey(c => c.CategoryId);

        modelBuilder.Entity<Supplier>()
            .HasMany(s => s.Components)
            .WithOne(c => c.Supplier)
            .HasForeignKey(c => c.SupplierId);

        modelBuilder.Entity<Component>()
            .HasOne(c => c.Datasheet)
            .WithOne(d => d.Component)
            .HasForeignKey<Datasheet>(d => d.ComponentId);
    }
}

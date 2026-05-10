using Microsoft.EntityFrameworkCore;
using OrderingService.Models; 

namespace OrderingService.DAL
{
    public class OrderContext : DbContext
    {
      
        public OrderContext(DbContextOptions<OrderContext> options) : base(options)
        {
        }

        
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
    }
}
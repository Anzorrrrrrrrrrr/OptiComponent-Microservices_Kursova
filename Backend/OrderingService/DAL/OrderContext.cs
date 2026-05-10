using Microsoft.EntityFrameworkCore;
using OrderingService.Models; // Додаємо using для ваших моделей

namespace OrderingService.DAL
{
    public class OrderContext : DbContext
    {
        // Конструктор, необхідний для Entity Framework
        public OrderContext(DbContextOptions<OrderContext> options) : base(options)
        {
        }

        // Ваші таблиці в базі даних
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
    }
}
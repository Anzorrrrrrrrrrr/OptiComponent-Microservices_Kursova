using Dapper;
using Microsoft.Data.SqlClient;
using OrderingService.Models;
using System.Data;

namespace OrderingService.DAL;

public class OrderRepository : IOrderRepository
{
    private readonly string _connectionString;

    public OrderRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("OrderingDb")!;
    }

    private IDbConnection Connection => new SqlConnection(_connectionString);

    public async Task<IEnumerable<Order>> GetAllAsync()
    {
        const string sql = "SELECT * FROM Orders";
        using var db = Connection;
        return await db.QueryAsync<Order>(sql);
    }

    public async Task<Order?> GetByIdAsync(int id)
    {
        const string sql = "SELECT * FROM Orders WHERE Id = @Id";
        using var db = Connection;
        return await db.QueryFirstOrDefaultAsync<Order>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(Order order)
    {
        const string sql = @"
            INSERT INTO Orders (ProjectName, CreatedAt, Status, ProjectTeamId)
            VALUES (@ProjectName, @CreatedAt, @Status, @ProjectTeamId);
            SELECT CAST(SCOPE_IDENTITY() as int)";
        using var db = Connection;
        return await db.ExecuteScalarAsync<int>(sql, order);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        const string sql = "DELETE FROM Orders WHERE Id = @Id";
        using var db = Connection;
        var rows = await db.ExecuteAsync(sql, new { Id = id });
        return rows > 0;
    }

    public async Task UpdateAsync(Order order)
    {
        
        const string sql = @"
            UPDATE Orders 
            SET ProjectName = @ProjectName,
                Status = @Status,
                ProjectTeamId = @ProjectTeamId
            WHERE Id = @Id";

        using var db = Connection;
        await db.ExecuteAsync(sql, order);
    }
}

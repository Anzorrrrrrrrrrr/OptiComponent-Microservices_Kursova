using System.Diagnostics.Metrics;

namespace OrderingService.Metrics;

public static class AppMetrics
{
    private static readonly Meter Meter = new("OrderingService", "1.0.0");

    private static readonly Counter<long> OrdersCreatedCounter =
        Meter.CreateCounter<long>("ordering_orders_created_total");

    public static void OrderCreated() => OrdersCreatedCounter.Add(1);
}

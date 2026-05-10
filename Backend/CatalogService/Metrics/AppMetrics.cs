using System.Diagnostics.Metrics;

namespace CatalogService.Metrics;

public static class AppMetrics
{
    private static readonly Meter Meter = new("CatalogService", "1.0.0");

    private static readonly Counter<long> ComponentsCreatedCounter =
        Meter.CreateCounter<long>("catalog_components_created_total");

    public static void ComponentCreated() => ComponentsCreatedCounter.Add(1);
}

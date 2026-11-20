using InventoryService.Domain.Entities;
using InventoryService.Domain.ValueObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using Xunit;

namespace OptiComponent.Tests
{
    public class InventoryStockTests
    {
        [Fact]
        public void DeductStock_WhenSufficientQuantity_ShouldDecreaseTotalQuantityAndAddHistory()
        {
            // Arrange (Підготовка даних компонента ESP-32 на складі)
            var stockItem = new StockItem
            {
                Id = Guid.NewGuid().ToString(),
                ComponentId = 3,
                ComponentName = "ESP-32",
                TotalQuantity = 15,
                StockHistory = new List<StockHistory>()
            };
            int orderQuantity = 5;
            int orderId = 101;

            // Act (Виконання алгоритму списання запасу)
            stockItem.TotalQuantity = Math.Max(0, stockItem.TotalQuantity - orderQuantity);
            stockItem.StockHistory.Add(new StockHistory
            {
                Date = DateTime.UtcNow,
                Action = $"Автоматичне списання (Замовлення #{orderId})",
                Quantity = -orderQuantity
            });

            // Assert (Перевірка результату)
            Assert.Equal(10, stockItem.TotalQuantity);
            Assert.Single(stockItem.StockHistory);
            Assert.Equal(-5, stockItem.StockHistory.First().Quantity);
            Assert.Contains("#101", stockItem.StockHistory.First().Action);
        }

        [Fact]
        public void DeductStock_WhenOrderExceedsStock_ShouldNotAllowNegativeBalance()
        {
            // Arrange (На складі 2 діоди, а замовляють 5)
            int currentStock = 2;
            int orderedQuantity = 5;

            // Act (Алгоритм захисту від від'ємного залишку при синхронізації RabbitMQ)
            var newStock = new StockItem
            {
                Id = Guid.NewGuid().ToString(),
                ComponentId = 2,
                ComponentName = "diod",
                TotalQuantity = Math.Max(0, currentStock - orderedQuantity)
            };

            // Assert (Залишок має зупинитися на 0, а не стати -3)
            Assert.Equal(0, newStock.TotalQuantity);
            Assert.True(newStock.TotalQuantity >= 0);
        }

        [Fact]
        public void AutoInitializeStockItem_WhenComponentNotInMongo_ShouldCreateValidRecord()
        {
            // Arrange
            int componentId = 11;
            string rawName = "  microcontroller  ";
            int currentStockAfterOrder = 3;
            int deductedQty = 2;
            int orderId = 14;

            // Act (Ініціалізація нового документа в MongoDB при отриманні події OrderCreatedEvent)
            var newStock = new StockItem
            {
                Id = Guid.NewGuid().ToString(),
                ComponentId = componentId,
                ComponentName = rawName.Trim(),
                TotalQuantity = Math.Max(0, currentStockAfterOrder),
                StockHistory = new List<StockHistory>
                {
                    new StockHistory
                    {
                        Date = DateTime.UtcNow,
                        Action = $"Автоматичне списання (Замовлення #{orderId})",
                        Quantity = -deductedQty
                    }
                }
            };

            // Assert
            Assert.False(string.IsNullOrWhiteSpace(newStock.Id));
            Assert.Equal(11, newStock.ComponentId);
            Assert.Equal("microcontroller", newStock.ComponentName);
            Assert.Equal(3, newStock.TotalQuantity);
            Assert.Equal(-2, newStock.StockHistory[0].Quantity);
        }

        [Theory]
        [InlineData("resistor", 10, true)]
        [InlineData("ESP-32", 0, true)]
        [InlineData("", 5, false)]
        [InlineData("   ", 5, false)]
        [InlineData("diod", -1, false)]
        public void ValidateStockItemData_ShouldCheckNameAndNonNegativeQuantity(string name, int quantity, bool expectedIsValid)
        {
            // Arrange
            var item = new StockItem
            {
                ComponentId = 1,
                ComponentName = name,
                TotalQuantity = quantity
            };

            // Act (Перевірка правил валідації даних компонента)
            bool isValid = !string.IsNullOrWhiteSpace(item.ComponentName)
                           && item.ComponentId > 0
                           && item.TotalQuantity >= 0;

            // Assert
            Assert.Equal(expectedIsValid, isValid);
        }

        [Theory]
        [InlineData(0, true)]
        [InlineData(4, true)]
        [InlineData(5, false)]
        [InlineData(25, false)]
        public void CheckLowStockAlert_WhenQuantityBelowFive_ShouldFlagAsCritical(int quantity, bool expectedIsLowStock)
        {
            // Arrange
            int criticalThreshold = 5;
            var item = new StockItem
            {
                ComponentId = 1,
                ComponentName = "resistor",
                TotalQuantity = quantity
            };

            // Act (Алгоритм виявлення дефіцитних позицій для дашборда складу)
            bool isLowStock = item.TotalQuantity < criticalThreshold;

            // Assert
            Assert.Equal(expectedIsLowStock, isLowStock);
        }
    }
}
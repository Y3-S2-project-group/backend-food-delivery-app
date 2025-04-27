using delivery_service.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace delivery_service.Repositories
{
    public class DeliveryRepository : IDeliveryRepository
    {
        private readonly IMongoCollection<Delivery> _deliveries;

        public DeliveryRepository(
            IOptions<DatabaseSettings> dbSettings)
        {
            var mongoClient = new MongoClient(dbSettings.Value.ConnectionString);
            var database = mongoClient.GetDatabase(dbSettings.Value.DatabaseName);
            _deliveries = database.GetCollection<Delivery>(dbSettings.Value.DeliveriesCollection);
        }

        public async Task<Delivery> CreateDeliveryAsync(Delivery delivery)
        {
            try
            {
                if (string.IsNullOrEmpty(delivery.Id))
                {
                    delivery.Id = Guid.NewGuid().ToString();
                }
                
                await _deliveries.InsertOneAsync(delivery);
                return delivery;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<Delivery?> GetByIdAsync(string id)
        {
            try
            {
                var filter = Builders<Delivery>.Filter.Eq(d => d.Id, id);
                return await _deliveries.Find(filter).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<Delivery?> GetByOrderIdAsync(string orderId)
        {
            try
            {
                var filter = Builders<Delivery>.Filter.Eq(d => d.OrderId, orderId);
                return await _deliveries.Find(filter).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<Delivery> UpdateAsync(Delivery delivery)
        {
            try
            {
                var filter = Builders<Delivery>.Filter.Eq(d => d.Id, delivery.Id);
                var update = Builders<Delivery>.Update
                    .Set(d => d.Status, delivery.Status)
                    .Set(d => d.DriverId, delivery.DriverId);

                await _deliveries.UpdateOneAsync(filter, update);
                return delivery;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<Delivery>> GetDeliveriesByDriverIdAsync(string driverId)
        {
            try
            {
                var filter = Builders<Delivery>.Filter.Eq(d => d.DriverId, driverId);
                return await _deliveries.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<Delivery>> GetActiveDeliveriesAsync()
        {
            try
            {
                // Get deliveries that are not in "completed" status
                var filter = Builders<Delivery>.Filter.Ne(d => d.Status, "completed");
                return await _deliveries.Find(filter).ToListAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
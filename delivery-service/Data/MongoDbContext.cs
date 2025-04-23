// create the mongo db context
using MongoDB.Driver;

namespace delivery_service.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
    {
        var client = new MongoClient(configuration["DatabaseSettings:ConnectionString"]);
        _database = client.GetDatabase(configuration["DatabaseSettings:DatabaseName"]);
    }

        // public IMongoCollection<Delivery> Deliveries => _database.GetCollection<Delivery>("Deliveries");
    }
}
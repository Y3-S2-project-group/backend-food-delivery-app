namespace delivery_service.Models
{
    public class DatabaseSettings
    {
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public string DeliveriesCollection { get; set; } = string.Empty;
        public string DriversCollection { get; set; } = string.Empty;
    }
}
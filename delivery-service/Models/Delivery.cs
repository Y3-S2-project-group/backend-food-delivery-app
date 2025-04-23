namespace delivery_service.Models
{
    public class Delivery
    {
        public string Id { get; set; } = null!;
    public string OrderId { get; set; } = null!;
    public string DriverId { get; set; } = null!;
    public GeoLocation CustomerLocation { get; set; } = null!;
    public string Status { get; set; } = "assigned"; // assigned, picked, completed
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    }
}
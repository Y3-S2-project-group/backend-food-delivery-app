namespace delivery_service.Models.DTOs
{
    public class DriverDTO
    {
        public string Id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string ContactNumber { get; set; } = null!;
        public double[] Location { get; set; } = null!; // [longitude, latitude]
        public double Distance { get; set; }
    }
}
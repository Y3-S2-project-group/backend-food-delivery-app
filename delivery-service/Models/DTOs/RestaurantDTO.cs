namespace delivery_service.Models.DTOs
{
    public class RestaurantResponseDTO
    {
        public string _id { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string ContactNumber { get; set; } = null!;
        public string Email { get; set; } = null!;
        public bool IsActive { get; set; }
        public string OwnerId { get; set; } = null!;
        public string Status { get; set; } = null!;
        public AddressDTO Address { get; set; } = null!;
        public LocationDTO Location { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }

    public class AddressDTO
    {
        public string Street { get; set; } = null!;
        public string City { get; set; } = null!;
    }

    public class LocationDTO
    {
        public string Type { get; set; } = null!;
        public double[] Coordinates { get; set; } = null!;
    }
}
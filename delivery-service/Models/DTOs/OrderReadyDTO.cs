namespace delivery_service.Models.DTOs
{
    public class OrderReadyDTO
    {
        public string OrderId { get; set; } = null!;
        public string RestaurantId { get; set; } = null!;
        public CustomerInfoDTO CustomerInfo { get; set; } = null!;
        public double[] CustomerLocation { get; set; } = null!; // [longitude, latitude]
        public int TotalItems { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
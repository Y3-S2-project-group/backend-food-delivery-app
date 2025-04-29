namespace delivery_service.Models.DTOs
{
    public class OrderReadyDTO
    {
        public string? OrderId { get; set; }
        public string? RestaurantId { get; set; }
        public CustomerInfoDTO? CustomerInfo { get; set; }
        public double[]? CustomerLocation { get; set; }// [longitude, latitude]
        public int? TotalItems { get; set; }
        public decimal? TotalAmount { get; set; }
    }
}
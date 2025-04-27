namespace delivery_service.Models.DTOs
{
    public class DriverResponseDTO
    {
        public bool Success { get; set; }
        public int Count { get; set; }
        public List<DriverDTO>? Data { get; set; }
    }
}
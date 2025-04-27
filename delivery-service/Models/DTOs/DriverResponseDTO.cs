namespace delivery_service.Models.DTOs
{
    public class DriverResponseDTO
    {
        public bool Success { get; set; }
        public DriverDTO? Data { get; set; }
    }
}
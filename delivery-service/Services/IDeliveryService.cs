using delivery_service.Models;
using delivery_service.Models.DTOs;

namespace delivery_service.Services
{
    public interface IDeliveryService
    {
        Task<Delivery?> AssignDeliveryAsync(OrderReadyDTO orderReady);
        Task<Delivery?> GetDeliveryByIdAsync(string id);
        Task<Delivery?> GetDeliveryByOrderIdAsync(string orderId);
        Task<Delivery> UpdateDeliveryStatusAsync(string id, string status);
        Task<List<Delivery>> GetDeliveriesByDriverIdAsync(string driverId);
    }
}
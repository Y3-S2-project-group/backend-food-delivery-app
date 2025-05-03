using delivery_service.Models;
using System.Threading.Tasks;

namespace delivery_service.Repositories
{
    public interface IDeliveryRepository
    {
        Task<Delivery> CreateDeliveryAsync(Delivery delivery);
        Task<Delivery?> GetByIdAsync(string id);
        Task<Delivery?> GetByOrderIdAsync(string orderId);
        Task<Delivery> UpdateAsync(Delivery delivery);
        Task<List<Delivery>> GetDeliveriesByDriverIdAsync(string driverId);
    }
}
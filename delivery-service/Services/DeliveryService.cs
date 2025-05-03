using delivery_service.Models.DTOs;
using delivery_service.Models;
using delivery_service.Repositories;
using Microsoft.Extensions.Logging;
using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace delivery_service.Services
{
    public class DeliveryService : IDeliveryService
    {
        private readonly IDeliveryRepository _deliveryRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        public DeliveryService(
            IDeliveryRepository deliveryRepository,
            IHttpClientFactory httpClientFactory)
        {
            _deliveryRepository = deliveryRepository;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<Delivery?> AssignDeliveryAsync(OrderReadyDTO orderReady)
        {
            try
            {

                // Get restaurant coordinates from restaurant service using restaurant ID
                var restaurantHttpClient = _httpClientFactory.CreateClient("RestaurantService");
                var restaurantResponse = await restaurantHttpClient.GetAsync($"/api/restaurants/{orderReady.RestaurantId}");
                
                if (!restaurantResponse.IsSuccessStatusCode)
                {
                    return null;
                }
                
                var restaurantData = await restaurantResponse.Content.ReadFromJsonAsync<RestaurantResponseDTO>();
                
                if (restaurantData == null || 
                    restaurantData.Location == null || 
                    restaurantData.Location.Coordinates == null || 
                    restaurantData.Location.Coordinates.Length < 2)
                {
                    return null;
                }
                
                // Use restaurant coordinates instead of customer coordinates
                var restaurantLongitude = restaurantData.Location.Coordinates[0];
                var restaurantLatitude = restaurantData.Location.Coordinates[1];

                // Find nearest available driver using auth service
                var httpClient = _httpClientFactory.CreateClient("AuthService");
                var response = await httpClient.GetAsync(
                    $"/api/users/drivers/nearest?longitude={restaurantLongitude}&latitude={restaurantLatitude}");

                if (!response.IsSuccessStatusCode)
                {
                    return null;
                }

                // Find and modify just these lines in your AssignDeliveryAsync method
                var driverResponse = await response.Content.ReadFromJsonAsync<DriverResponseDTO>();
                var driver = driverResponse?.Data?.FirstOrDefault();

                if (driver == null)
                {
                    return null;
                }


                // Create new delivery
                var delivery = new Delivery
                {
                    Id = Guid.NewGuid().ToString(),
                    OrderId = orderReady.OrderId,
                    DriverId = driver.Id,
                    Status = "assigned",
                    AssignedAt = DateTime.UtcNow
                };

                // Update driver availability in auth service
                await httpClient.PutAsJsonAsync(
                    $"/api/users/drivers/{driver.Id}/availability",
                    new { isAvailable = false });

                // Save delivery
                var createdDelivery = await _deliveryRepository.CreateDeliveryAsync(delivery);
                
                // Notify order service about assignment (implementation depends on your architecture)
                // await NotifyOrderServiceAsync(createdDelivery);

                return createdDelivery;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private async Task NotifyOrderServiceAsync(Delivery delivery)
        {
            try
            {
                var httpClient = _httpClientFactory.CreateClient("OrderService");
                await httpClient.PostAsJsonAsync("/api/orders/delivery-assigned", new 
                {
                    orderId = delivery.OrderId,
                    deliveryId = delivery.Id,
                    driverId = delivery.DriverId,
                    status = delivery.Status
                });
            }
            catch (Exception ex)
            {
                // Consider implementing retry logic
            }
        }

        public async Task<Delivery?> GetDeliveryByIdAsync(string id)
        {
            return await _deliveryRepository.GetByIdAsync(id);
        }

        public async Task<Delivery?> GetDeliveryByOrderIdAsync(string orderId)
        {
            return await _deliveryRepository.GetByOrderIdAsync(orderId);
        }

        public async Task<Delivery> UpdateDeliveryStatusAsync(string id, string status)
        {
            var delivery = await _deliveryRepository.GetByIdAsync(id);
            if (delivery == null)
            {
                throw new Exception($"Delivery with ID {id} not found");
            }

            delivery.Status = status;
            return await _deliveryRepository.UpdateAsync(delivery);
        }

        public async Task<List<Delivery>> GetDeliveriesByDriverIdAsync(string driverId)
        {
            return await _deliveryRepository.GetDeliveriesByDriverIdAsync(driverId);
        }
    }
}
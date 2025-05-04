using delivery_service.Models.DTOs;
using delivery_service.Services;
using Microsoft.AspNetCore.Mvc;

namespace delivery_service.Controllers
{
    [ApiController]
    [Route("api/deliveries")]
    public class DeliveryController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public DeliveryController(
            IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignDelivery([FromBody] OrderReadyDTO orderReady)
        {
            try
            {
                if (orderReady == null || string.IsNullOrEmpty(orderReady.OrderId))
                {
                    return BadRequest("Invalid order information");
                }

                var delivery = await _deliveryService.AssignDeliveryAsync(orderReady);

                if (delivery == null)
                {
                    return StatusCode(503, new { message = "No available drivers found" });
                }

                return Ok(new
                {
                    success = true,
                    message = "Delivery assigned successfully",
                    data = delivery
                });
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error assigning delivery: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "An error occurred while assigning delivery", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetDelivery(string id)
        {
            var delivery = await _deliveryService.GetDeliveryByIdAsync(id);

            if (delivery == null)
            {
                return NotFound(new { message = "Delivery not found" });
            }

            return Ok(new { success = true, data = delivery });
        }

        [HttpGet("order/{orderId}")]
        public async Task<IActionResult> GetDeliveryByOrderId(string orderId)
        {
            var delivery = await _deliveryService.GetDeliveryByOrderIdAsync(orderId);

            if (delivery == null)
            {
                return NotFound(new { message = "Delivery not found for the order" });
            }

            return Ok(new { success = true, data = delivery });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateDeliveryStatus(string id, [FromBody] UpdateStatusDTO updateStatus)
        {
            if (string.IsNullOrEmpty(updateStatus.Status))
            {
                return BadRequest("Status is required");
            }

            try
            {
                var delivery = await _deliveryService.UpdateDeliveryStatusAsync(id, updateStatus.Status);
                return Ok(new { success = true, data = delivery });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("drivers/{driverId}")]
        public async Task<IActionResult> GetDeliveriesByDriverId(string driverId)
        {
            if (string.IsNullOrEmpty(driverId))
            {
                return BadRequest("Driver ID is required");
            }

            var deliveries = await _deliveryService.GetDeliveriesByDriverIdAsync(driverId);

            return Ok(new { success = true, data = deliveries });
        }
    }

    public class UpdateStatusDTO
    {
        public string Status { get; set; } = null!;
    }
}
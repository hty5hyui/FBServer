using FBServer.Entity.db;
using FBServer.Service;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class RequestController(RequestService requestService):ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAllRequests([FromQuery] int page)
        {
            try
            {
                RequestPageData requests = await requestService.GetAllRequestsAsync(page);
                return new JsonResult(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения списка запросов: {ex.Message}");
            }
        }

        [HttpGet("result")]
        public async Task<IActionResult> GetRequestResult([FromQuery] int idRequest)
        {
            try
            {
                RequestPageData requests = await requestService.GetAllRequestsAsync(idRequest);
                return new JsonResult(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения списка запросов: {ex.Message}");
            }
        }
    }
}

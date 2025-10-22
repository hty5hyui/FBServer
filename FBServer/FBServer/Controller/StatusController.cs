using FBServer.Entity;
using FBServer.Service;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class StatusController(SystemStatusService systemStatus):ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetSystemStatus()
        {
            try
            {
                SystemInfo systemInfo = await systemStatus.GetSystemInfo();
                return new JsonResult(systemInfo);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения статуса системы: {ex.Message}");
            }  
        }
    }
}

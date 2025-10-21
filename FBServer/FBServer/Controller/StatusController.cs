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
        public async Task<IActionResult> getSystemStatus()
        {
            SystemInfo systemInfo = await systemStatus.GetSystemInfo();

            Console.WriteLine(systemInfo.cpuLoad);

            return new JsonResult(systemInfo);
        }
    }
}

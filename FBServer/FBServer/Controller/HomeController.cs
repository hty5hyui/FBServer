using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public IActionResult HelloWorld()
        {
            return StatusCode(StatusCodes.Status200OK, "Hello world");
        }
    }
}

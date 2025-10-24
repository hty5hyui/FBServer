using FBServer.Entity.db;
using FBServer.Service;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class BaseController(BaseService baseService):ControllerBase
    {
        [HttpGet("all")]
        public async Task<IActionResult> GetPreviewUsers([FromQuery]int page)
        {
            try
            {
                UserPreviewPageData userPreviews = await baseService.GetUserPreviewsAsync(page);
                return new JsonResult(userPreviews);
            }
            catch(Exception ex) 
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения превью списка: {ex.Message}");
            }
        }
    }
}

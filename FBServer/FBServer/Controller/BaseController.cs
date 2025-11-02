using FBServer.Entity;
using FBServer.Entity.db;
using FBServer.Service;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class BaseController(BaseService baseService) : ControllerBase
    {
        [HttpPost("all")]
        public async Task<IActionResult> GetPreviewUsers([FromBody] PageSearchEntity pageQuery)
        {
            try
            {
                UserPreviewPageData userPreviews = await baseService.GetUserPreviewsAsync(pageQuery);
                return new JsonResult(userPreviews);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения превью списка: {ex.Message}");
            }
        }

        [HttpGet("data")]
        public async Task<IActionResult> GetDataUser([FromQuery] int idUser)
        {
            try
            {
                UserDTO user = await baseService.GetUserAsync(idUser);
                return new JsonResult(user);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения данных пользователя: {ex.Message}");
            }
        }

        [HttpPost("data")]
        public async Task<IActionResult> UpdateDataUser([FromBody] UserDTO userDTO)
        {
            try
            {
                await baseService.UpdateUserAsync(userDTO);
                return StatusCode(StatusCodes.Status200OK, "Данные успешно обновлены");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка обновления данных пользователя: {ex.Message}");
            }
        }
    }
}

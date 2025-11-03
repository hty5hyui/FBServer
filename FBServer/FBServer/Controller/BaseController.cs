using FBServer.Entity;
using FBServer.Entity.BooksData;
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

        [HttpPost("flag")]
        public async Task<IActionResult> AddUserFlag([FromBody] FlagsDTO flag)
        {
            try
            {
                await baseService.AddUserFlagAsync(flag);
                return StatusCode(StatusCodes.Status200OK, "Данные успешно обновлены");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка обновления флагов пользователя: {ex.Message}");
            }
        }

        [HttpDelete("flag")]
        public async Task<IActionResult> DeleteUserFlag([FromQuery] int idFlag)
        {
            try
            {
                await baseService.DeleteUserFlagAsync(idFlag);
                return StatusCode(StatusCodes.Status200OK, "Данные успешно удалены");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка удаления флагов пользователя: {ex.Message}");
            }
        }

        [HttpGet("flagTypes")]
        public async Task<IActionResult> GetFlagType()
        {
            try
            {
                return new JsonResult(FlagsTypeList.GetAllTypes());
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения списка типов флагов: {ex.Message}");
            }
        }
    }
}

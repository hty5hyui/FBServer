using FBServer.Entity;
using FBServer.Service;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class ScriptController(ScriptService scriptService):ControllerBase
    {
        [HttpGet("status")]
        public async Task<IActionResult> GetScriptStatus([FromQuery] int id)
        {
            try
            {
                //ScriptStatus status = await scriptService.GetScriptStatusAsync(id);
                ScriptStatus status = new ScriptStatus
                {
                    link = "https://github.com/aalhour/C-Sharp-Algorithms",
                    started = true
                };
                return new JsonResult(status);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения статуса скрипта: {ex.Message}");
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllScriptParam()
        {
            try
            {
                List<ScriptParam> scriptsParam = await scriptService.GetAllScriptParamsAsync();
                return new JsonResult(scriptsParam);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения списка скриптов: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddScript([FromBody] ScriptParam param)
        {
            try
            {
                await scriptService.AddScriptAsync(param);
                return StatusCode(StatusCodes.Status200OK);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка добавления скрипта: {ex.Message}");
            }
        }

        [HttpGet("stop")]
        public async Task<IActionResult> StopScript([FromQuery] int id)
        {
            try
            {
                //await scriptService.StopScriptAsync(id);
                return StatusCode(StatusCodes.Status200OK);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка остановки скрипта: {ex.Message}");
            }
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartScript([FromBody] ScriptStartParam scriptStartParam, [FromQuery] int id)
        {
            try
            {
                await scriptService.StartScriptsAsync(id, scriptStartParam);
                return StatusCode(StatusCodes.Status200OK);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка запуска скрипта: {ex.Message}");
            }
        }
    }
}

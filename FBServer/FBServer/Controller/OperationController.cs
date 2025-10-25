using FBServer.Service;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class OperationController(OperationService operationService) :ControllerBase
    {
        [HttpPost("frendsAnalyse")]
        public async Task<IActionResult> StartFrendsAnalyse([FromBody] List<int> idUsers)
        {
            try
            {
                await operationService.StartFrendsAnalyseAsync(idUsers);
                return StatusCode(StatusCodes.Status200OK, "Принято на обработку");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения анализа друзей: {ex.Message}");
            }
        }
    }
}

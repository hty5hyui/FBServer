using FBServer.Service;
using Microsoft.AspNetCore.Mvc;

namespace FBServer.Controller
{
    [ApiController]
    [Route("[controller]")]
    public class OperationController(OperationService operationService, IServiceScopeFactory scopeFactory) :ControllerBase
    {

        
        [HttpPost("frendsAnalyse")]
        public async Task<IActionResult> StartFrendsAnalyse([FromBody] List<int> idUsers, [FromQuery] int depth)
        {
            try
            {
                int idRequest = await operationService.CreateRequestAsync("Поиск общих друзей");
                // Запускаем задачу в фоновом потоке из пула потоков
                _ = Task.Run(async () =>
                {
                    using (var scope = scopeFactory.CreateScope())
                    {
                        var scopedOperationService = scope.ServiceProvider.GetRequiredService<OperationService>();
                        var scopedLogger = scope.ServiceProvider.GetRequiredService<ILogger<OperationController>>();

                        try
                        {
                            //Выполняем длительную работу с "долгоживущим" сервисом
                            await scopedOperationService.StartFrendsAnalyseAsync(idUsers, depth, idRequest);

                            scopedLogger.LogInformation("Фоновая задача для запроса ID {RequestId} успешно завершена.", idRequest);
                        }
                        catch (Exception ex)
                        {
                            scopedLogger.LogError(ex, "Ошибка в фоновой задаче анализа друзей для запроса ID {RequestId}", idRequest);
                        }
                    }
                });
                return StatusCode(StatusCodes.Status200OK, "Принято на обработку");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Ошибка получения анализа друзей: {ex.Message}");
            }
        }
    }
}

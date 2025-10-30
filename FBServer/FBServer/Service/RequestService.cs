
using FBServer.Entity;
using FBServer.Entity.db;
using FBServer.Repo;

namespace FBServer.Service
{
    public class RequestService(BaseRepo repo)
    {
        internal async Task<RequestPageData> GetAllRequestsAsync(int page)
        {
            return await repo.GetAllRequestsAsync(page);
        }

        internal async Task<FrendsOperationResultDataEntity> GetRequestResultAsync(int idRequest)
        {
            string? resultString = await repo.GetRequestResultAsync(idRequest);
            if (string.IsNullOrEmpty(resultString))
            {
                return new FrendsOperationResultDataEntity
                {
                    operationResult = new List<FrendsOperationResultEntity>(),
                    userData = new Dictionary<int, string>()
                };
            }
            else
            {
                try
                {
                    return System.Text.Json.JsonSerializer.Deserialize<FrendsOperationResultDataEntity>(resultString);
                }
                catch (Exception ex)
                {
                    throw new Exception("Ошибка десериализации результата запроса: " + ex.Message);
                }
            }
        }
    }
}

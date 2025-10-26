
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
    }
}

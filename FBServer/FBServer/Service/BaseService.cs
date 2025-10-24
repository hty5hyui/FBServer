using FBServer.Entity.db;
using FBServer.Repo;

namespace FBServer.Service
{
    public class BaseService(BaseRepo repo)
    {
        public async Task<List<UserPreview>> GetUserPreviewsAsync(int page)
        {
            return await repo.GetUserPreviewsAsync(page);
        }
    }
}

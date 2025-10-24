using FBServer.Entity.db;
using FBServer.Repo;

namespace FBServer.Service
{
    public class BaseService(BaseRepo repo)
    {
        public async Task<UserPreviewPageData> GetUserPreviewsAsync(int page)
        {

            UserPreviewPageData userPreviewPageData = new UserPreviewPageData();

            userPreviewPageData.userPreviews = await repo.GetUserPreviewsAsync(page);
            userPreviewPageData.pageCount = await repo.GetPagePreviewCont();

            return userPreviewPageData;
        }
    }
}

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

        public async Task<UserDTO> GetUserAsync(int userId)
        {
            User user = await repo.GetUserAsync(userId);
            UserDTO userDTO = UserMapper.ToUserDTO(user);
            return userDTO;
        }
    }
}

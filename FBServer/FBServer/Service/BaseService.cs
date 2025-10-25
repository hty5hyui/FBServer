using FBServer.Entity;
using FBServer.Entity.db;
using FBServer.Repo;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace FBServer.Service
{
    public class BaseService(BaseRepo repo)
    {
        public async Task<UserPreviewPageData> GetUserPreviewsAsync(PageSearchEntity pageQuery)
        {

            UserPreviewPageData userPreviewPageData = new UserPreviewPageData();

            if (pageQuery.searchQuery == null)
            {
                userPreviewPageData.userPreviews = await repo.GetUserPreviewsAsync(pageQuery.page);
                userPreviewPageData.pageCount = await repo.GetPagePreviewCont();
            }
            else
            {

            }
            

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

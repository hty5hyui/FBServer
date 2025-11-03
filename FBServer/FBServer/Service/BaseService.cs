using FBServer.Entity;
using FBServer.Entity.db;
using FBServer.Repo;
using FBServer.Service.Mapper;
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
                userPreviewPageData = await repo.GetUserPreviewsAsync(pageQuery.page);
            }
            else
            {
                userPreviewPageData = await repo.GetUserPreviewsSearchAsync(pageQuery);
            }
            

            return userPreviewPageData;
        }

        public async Task<UserDTO> GetUserAsync(int userId)
        {
            User user = await repo.GetUserAsync(userId);
            UserDTO userDTO = UserMapper.ToUserDTO(user);
            userDTO.Flags = await repo.GetUserFlagsAsync(userId);
            return userDTO;
        }

        public async Task UpdateUserAsync(UserDTO userDTO)
        {
            User user = UserMapper.ToUser(userDTO);
            user.AvatarByte = await repo.GetUserAvatarAsync(userDTO.UserId);
            await repo.UpdateUserAsync(user);
        }


        public async Task AddUserFlagAsync(FlagsDTO flagDTO)
        {
            flagDTO.date = DateTime.UtcNow;
            Flags flag = FlagMapper.ToFlags(flagDTO);
            await repo.AddUserFlagAsync(flag);
        }

        public async Task DeleteUserFlagAsync(int idFlag)
        {
            await repo.DeleteFlagAsync(idFlag);
        }
    }

}

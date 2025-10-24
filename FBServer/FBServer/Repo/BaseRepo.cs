using FBServer.Entity.db;
using Microsoft.EntityFrameworkCore;

namespace FBServer.Repo
{
    public class BaseRepo(AppDbFBContext _dbContext)
    {

        int pageSize = 50;

        public async Task<List<UserPreview>> GetUserPreviewsAsync(int page)
        {
            return await _dbContext.Users.OrderBy(a => a.UserId)
                                           .Skip((page - 1) * pageSize)
                                           .Take(pageSize)
                                           .Select(c => new UserPreview
                                           {
                                               UserId = c.UserId,
                                               Email = c.Email,
                                               Fio = c.Fio,
                                               Link = c.Link,
                                               Mobile = c.Mobile,
                                               Subscribers = c.Subscribers
                                           })
                                           .ToListAsync();
        }

        public async Task<int> GetPagePreviewCont()
        {
            int rowCount = await _dbContext.Users.CountAsync();
            int result = (int)Math.Ceiling((double)rowCount/ pageSize);
            return result;
        }
    }
}

using FBServer.Entity;
using FBServer.Entity.db;
using Microsoft.EntityFrameworkCore;

namespace FBServer.Repo
{
    public class BaseRepo(AppDbFBContext _dbContext)
    {

        int pageSize = 50;

        public async Task<UserPreviewPageData> GetUserPreviewsAsync(int page)
        {
            UserPreviewPageData data = new UserPreviewPageData();
            data.userPreviews = await _dbContext.Users.OrderBy(a => a.UserId)
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
            int rowCount = await _dbContext.Users.CountAsync();
            data.pageCount = (int)Math.Ceiling((double)rowCount / pageSize);

            return data;
        }

        public async Task<UserPreviewPageData> GetUserPreviewsSearchAsync(PageSearchEntity pageQuery)
        {
            UserPreviewPageData data = new UserPreviewPageData();
            data.userPreviews = await _dbContext.Users
                                   .FromSqlRaw($"SELECT * FROM users WHERE {pageQuery.searchQuery}")
                                   .OrderBy(a => a.UserId)
                                   .Skip((pageQuery.page - 1) * pageSize)
                                   .Take(pageSize)
                                   .Select(c => new UserPreview
                                   {
                                       UserId = c.UserId,
                                       Email = c.Email,
                                       Fio = c.Fio,
                                       Link = c.Link,
                                       Mobile = c.Mobile,
                                       Subscribers = c.Subscribers
                                   }).ToListAsync();

            int rowCount = await _dbContext.Users.FromSqlRaw($"SELECT * FROM users WHERE {pageQuery.searchQuery}").CountAsync();
            data.pageCount = (int)Math.Ceiling((double)rowCount / pageSize);

            return data;
        }

        public async Task<User> GetUserAsync(int idUser)
        {
            User? user = await _dbContext.Users.FirstOrDefaultAsync(n => n.UserId == idUser);
            if (user == null)
            {
                throw new Exception("Отсутствует пользователь с данным id");
            }
            return user;
        }
    }
}

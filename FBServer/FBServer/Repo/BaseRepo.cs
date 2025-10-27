using FBServer.Entity;
using FBServer.Entity.db;
using Microsoft.EntityFrameworkCore;

namespace FBServer.Repo
{
    public class BaseRepo(AppDbFBContext _dbContext)
    {
        int pageSize = 50;
        internal async Task<UserPreviewPageData> GetUserPreviewsAsync(int page)
        {
            UserPreviewPageData data = new UserPreviewPageData();
            data.userPreviews = await _dbContext.Users.OrderByDescending(a => a.UserId)
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

        internal async Task<UserPreviewPageData> GetUserPreviewsSearchAsync(PageSearchEntity pageQuery)
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

        internal async Task<User> GetUserAsync(int idUser)
        {
            User? user = await _dbContext.Users.FirstOrDefaultAsync(n => n.UserId == idUser);
            if (user == null)
            {
                throw new Exception("Отсутствует пользователь с данным id");
            }
            return user;
        }

        internal async Task<List<int>> GetUserFrendsAsync(int userId)
        {
            return await _dbContext.Friendships
                                   .Where(f => f.User1Id == userId && f.Handshake == 1)
                                   .Select(f => f.User2Id)
                                   .Union(_dbContext.Friendships
                                                    .Where(f => f.User2Id == userId && f.Handshake == 1)
                                                    .Select(f => f.User1Id))
                                   .ToListAsync();
        }

        internal async Task<int> CreateRequestAsync(Request request)
        {
            await _dbContext.Requests.AddAsync(request);
            await _dbContext.SaveChangesAsync();
            return request.id;
        }

        internal async Task UpdateRequestResultAsync(int idRequest, int status, string? result)
        {
            try
            {
                Request request = new Request { id = idRequest };
                _dbContext.Requests.Attach(request);
                request.status = status;
                request.result = result;
                _dbContext.Requests.Entry(request).Property(r => r.status).IsModified = true;
                _dbContext.Requests.Entry(request).Property(r => r.result).IsModified = true;

                await _dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при обновлении запроса: {ex.Message}");

            }
        }

        internal async Task<RequestPageData> GetAllRequestsAsync(int page)
        {
            RequestPageData data = new RequestPageData();
            data.requests = await _dbContext.Requests.OrderByDescending(a => a.id)
                                           .Skip((page - 1) * pageSize)
                                           .Take(pageSize)
                                           .Select(c => new RequestDTO
                                           {    
                                                id = c.id,
                                                date = c.date,
                                                type = c.type,
                                                status = c.status
                                           })
                                           .ToListAsync();
            int rowCount = await _dbContext.Requests.CountAsync();
            data.pageCount = (int)Math.Ceiling((double)rowCount / pageSize);

            return data;
        }

        internal async Task<string> GetUserNameAsync(int frendId)
        {
            return await _dbContext.Users
                                   .Where(u => u.UserId == frendId)
                                   .Select(u => u.Fio)
                                   .FirstOrDefaultAsync() ?? "Неизвестный пользователь";
        }

        internal async Task<string?> GetRequestResultAsync(int idRequest)
        {
            return await _dbContext.Requests
                                   .Where(r => r.id == idRequest)
                                   .Select(r => r.result)
                                   .FirstOrDefaultAsync();
        }
    }
}

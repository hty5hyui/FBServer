using Microsoft.EntityFrameworkCore;

namespace FBServer.Repo
{
    public class SystemInfoRepo(AppDbFBContext _dbContext)
    {
        public async Task<int> GetConnectionCount()
        {
            var result = await _dbContext.Database.ExecuteSqlRawAsync("SELECT count(*) FROM pg_stat_activity WHERE state = 'active';").ConfigureAwait(false);
            return (int)result;
        }
    }
}

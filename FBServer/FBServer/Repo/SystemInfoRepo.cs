using Microsoft.EntityFrameworkCore;

namespace FBServer.Repo
{
    public class SystemInfoRepo(AppDbFBContext _dbContext)
    {
        public async Task<int> GetConnectionCount()
        {
            using (var connection = _dbContext.Database.GetDbConnection())
            {
                await connection.OpenAsync().ConfigureAwait(false);

                using (var command = connection.CreateCommand())
                {
                    command.CommandText = "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';";

                    var result = await command.ExecuteScalarAsync().ConfigureAwait(false);
                    int activeConnectionsCount = Convert.ToInt32(result);
                    return activeConnectionsCount;
                }
            }
        }
    }
}

using FBServer.Entity;
using Microsoft.EntityFrameworkCore;

namespace FBServer.Repo.Data
{
    public class AppDbSqliteContext: DbContext
    {
       

        public DbSet<ScriptParam> Scripts { get; set; }

        public AppDbSqliteContext(DbContextOptions<AppDbSqliteContext> options) : base(options)
        {
            Database.EnsureCreated();
        }
    }
}

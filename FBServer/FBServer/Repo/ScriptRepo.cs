using FBServer.Entity;
using FBServer.Repo.Data;
using Microsoft.EntityFrameworkCore;

namespace FBServer.Repo
{
    public class ScriptRepo(AppDbSqliteContext _dbContext)
    {
        public async Task<List<ScriptParam>> GetAllScriptAsync()
        {
            return await _dbContext.Scripts.OrderBy(n => n.id).ToListAsync();
        }

        public async Task SetScriptAsync(ScriptParam param)
        {
            await _dbContext.Scripts.AddAsync(param);
            await _dbContext.SaveChangesAsync();
        }

        public async Task DeleteScriptAsync(ScriptParam param)
        {
            _dbContext.Scripts.Remove(param);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<ScriptParam> GetScriptParamAsync(int idScript)
        {
            ScriptParam? scriptParam = await _dbContext.Scripts.FirstOrDefaultAsync(n => n.id == idScript);
            if (scriptParam == null)
            {
                throw new Exception("Отсутствует скрипт с данными параметрами");
            }
            return scriptParam;
        }
    }
}

using System.Net.Http.Json;
using FBServer.Entity;
using FBServer.Repo;

namespace FBServer.Service
{
    public class ScriptService(ScriptRepo repo)
    {
        private static readonly HttpClient _httpClient = new HttpClient();

        public async Task<ScriptStatus> GetScriptStatusAsync(int id)
        {
            ScriptParam scriptParam = await repo.GetScriptParamAsync(id);
            ScriptStatus status = await _httpClient.GetFromJsonAsync<ScriptStatus>($"http://{scriptParam.ip}:{scriptParam.port}/status");

            return status;
        }

        public async Task StartScriptsAsync(int id, ScriptStartParam scriptStartParam)
        {
            ScriptParam scriptParam = await repo.GetScriptParamAsync(id);
            await _httpClient.PostAsJsonAsync($"http://{scriptParam.ip}:{scriptParam.port}/process", scriptStartParam);
        }

        public async Task StopScriptAsync(int id)
        {
            ScriptParam scriptParam = await repo.GetScriptParamAsync(id);
            await _httpClient.GetAsync($"http://{scriptParam.ip}:{scriptParam.port}/status");
        }

        public async Task<List<ScriptParam>> GetAllScriptParamsAsync()
        {
            return await repo.GetAllScriptAsync();
        }

        public async Task AddScriptAsync(ScriptParam scriptParam)
        {
            await repo.SetScriptAsync(scriptParam);
        }
    }
}

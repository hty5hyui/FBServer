using FBServer.Entity;
using FBServer.Repo;
using System;
using System.Diagnostics;
using System.Threading;

namespace FBServer.Service
{

    public class SystemStatusService(SystemInfoRepo repo)
    {
        
        public int GetCpuUsage()
        {
            PerformanceCounter cpuCounter = new PerformanceCounter("Processor Information", "% Processor Utility", "_Total");

            cpuCounter.NextValue(); // Первый замер всегда 0
            Thread.Sleep(1000);

            float currentCpuUsage = cpuCounter.NextValue();
            if (currentCpuUsage > 100)
            {
                currentCpuUsage = 100;
            }

            return (int)currentCpuUsage;
        }

        public int GetOzuUsage()
        {
            using (PerformanceCounter pc = new PerformanceCounter(
            categoryName: "Memory",
            counterName: "Available MBytes",
            instanceName: "",
            readOnly: true))
            {
                float availableMemoryMb = pc.NextValue();
                float totalMemoryMb = GetTotalMemoryInMb(); // См. метод ниже
                float usedMemoryMb = totalMemoryMb - availableMemoryMb;
                return (int)((usedMemoryMb / totalMemoryMb) * 100);
            }
        }

        private static float GetTotalMemoryInMb()
        {
            using (var searcher = new System.Management.ManagementObjectSearcher("SELECT TotalVisibleMemorySize FROM Win32_OperatingSystem"))
            {
                foreach (var obj in searcher.Get())
                {
                    ulong totalMemoryBytes = Convert.ToUInt64(obj["TotalVisibleMemorySize"]);
                    return totalMemoryBytes / 1024f; // Конвертация из KB в MB
                }
            }
            throw new Exception("Не удалось получить данные об ОЗУ");
        }

        public async Task<SystemInfo> GetSystemInfo()
        {
            SystemInfo systemInfo = new SystemInfo();
            systemInfo.cpuLoad = GetCpuUsage();
            systemInfo.ozuLoad = GetOzuUsage();
            systemInfo.dbConnection = await repo.GetConnectionCount();

            return systemInfo;
        }

      
    }
}

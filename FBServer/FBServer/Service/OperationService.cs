using FBServer.Entity;
using FBServer.Entity.db;
using FBServer.Repo;

namespace FBServer.Service
{
    public class OperationService(BaseRepo repo)
    {
        public async Task<int> CreateRequestAsync(string typeOperation)
        {
            Request request = new Request
            {
                date = DateTime.UtcNow,
                type = typeOperation,
                status = (int)RequestStatus.InProgress,
                result = null
            };
            int idRequest = await repo.CreateRequestAsync(request);
            return idRequest;
        }


        /// <summary>
        /// Метод для анализа друзей пользователей на заданную глубину. Находит общих друзей между пользователями.
        /// </summary>
        public async Task StartFrendsAnalyseAsync(List<int> idUsers, int depth, int idRequest)
        {

            try
            {
                List<FrendsOperationEntity> users = new List<FrendsOperationEntity>();

                // Инициализация пользователей с их идентификаторами
                foreach (int idUser in idUsers)
                {
                    users.Add(new FrendsOperationEntity
                    {
                        userId = idUser,
                        frendsId = new Dictionary<int, int> { { idUser, 0 } }
                    });
                }

                //Получаем полный список друзей для каждого пользователя на заданную глубину
                foreach (FrendsOperationEntity user in users.ToList())
                {
                    for (int i = 1; i <= depth; i++)
                    {
                        List<int> frendsIds = await repo.GetUserFrendsAsync(user.userId, i);

                        foreach (int frendId in frendsIds)
                        {
                            //Проверка на наличие друга в списке, чтобы не добавлять повторно
                            if (!user.frendsId.ContainsKey(frendId))
                            {
                                user.frendsId.Add(frendId, i);
                            }
                        }
                    }
                }

                //Инициализация результата анализа друзей
                List<FrendsOperationResultEntity> resultEntity = new List<FrendsOperationResultEntity>();
                Dictionary<int, string> userData = new Dictionary<int, string>();

                //Сравнение друзей между пользователями и поиск общих друзей
                foreach (FrendsOperationEntity user in users)
                {
                    List<FrendsEntity> userFrends = new List<FrendsEntity>();
                    foreach (FrendsOperationEntity user2 in users)
                    {
                        if (user.userId != user2.userId)
                        {
                            Dictionary<int, int> frendsList = new Dictionary<int, int>();
                            foreach (int frendsId in user.frendsId.OrderBy(d => d.Value).Where(z => z.Value == 1).Select(k => k.Key))
                            {
                                if (user2.frendsId.ContainsKey(frendsId))
                                {
                                    if (!frendsList.ContainsKey(frendsId))
                                    {
                                        frendsList.Add(frendsId, user2.frendsId[frendsId]);
                                    }
                                }
                            }
                            //Если есть общие друзья, то добавляем их в результат
                            if (frendsList.Count > 0)
                            {
                                //Добавляем пользователя с общими друзьями и самих общих друзей
                                userFrends.Add(new FrendsEntity
                                {
                                    userId = user2.userId,
                                    frendsId = frendsList
                                });
                                //Заполняем информацию о пользователях для результата
                                if (!userData.ContainsKey(user.userId))
                                {
                                    string userName = await repo.GetUserNameAsync(user.userId);
                                    userData.Add(user.userId, userName);
                                }

                                foreach (int frendId in frendsList.Keys)
                                {
                                    if (!userData.ContainsKey(frendId))
                                    {
                                        string userName = await repo.GetUserNameAsync(frendId);
                                        userData.Add(frendId, userName);
                                    }
                                }
                            }
                        }
                    }
                    //Если с каким-то пользователем есть пересечение, то добавляем его в список результата
                    if (userFrends.Count > 0)
                    {
                        resultEntity.Add(new FrendsOperationResultEntity
                        {
                            userSourceId = user.userId,
                            frends = userFrends
                        });
                    }
                }                

                if (resultEntity.Count == 0)
                {
                    await repo.UpdateRequestResultAsync(idRequest, (int)RequestStatus.Completed, null);
                }
                else
                {
                    FrendsOperationResultDataEntity frendsOperationResultDataEntity = new FrendsOperationResultDataEntity();
                    frendsOperationResultDataEntity.operationResult = resultEntity;
                    frendsOperationResultDataEntity.userData = userData;

                    string resultString = System.Text.Json.JsonSerializer.Serialize(frendsOperationResultDataEntity);
                    await repo.UpdateRequestResultAsync(idRequest, (int)RequestStatus.Completed, resultString);
                }
            }
            catch (Exception ex)
            {
                await repo.UpdateRequestResultAsync(idRequest, (int)RequestStatus.Failed, $"Ошибка выполнения операции: {ex.Message}");
            }
        }
    }
}

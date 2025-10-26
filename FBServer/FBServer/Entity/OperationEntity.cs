namespace FBServer.Entity
{
    public class FrendsOperationEntity
    {
        public int userId { get; set; }
        public Dictionary<int, int> frendsId { get; set; }
    }
    public class FrendsOperationResultEntity
    {
        //Id изначального пользователя
        public int userSourceId { get; set; }   
        public List<FrendsEntity>? frends { get; set; }
    }

    //Результат анализа общих друзей
    public class FrendsEntity
    {
        //Id с кем общие друзья
        public int userId { get; set; }
        //Id общих друзей и глубина поиска
        public Dictionary<int, int> frendsId { get; set; }
    }
}

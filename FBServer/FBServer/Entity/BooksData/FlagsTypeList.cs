namespace FBServer.Entity.BooksData
{
    public class FlagsTypeList
    {
        public static readonly List<string> Types = new List<string>
        {
            "Военный",
            "Экстремист",
            "МВД",
            "Наркотики",
            "Комментарий"
        };

        public static List<string> GetAllTypes()
        {
            return Types;
        }
    }
}

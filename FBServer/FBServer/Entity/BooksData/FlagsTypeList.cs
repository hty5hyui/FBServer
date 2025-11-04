namespace FBServer.Entity.BooksData
{
    public class FlagsTypeList
    {
        public static readonly List<string> Types = new List<string>
        {
            "Военнослужащий",
            "Полицейский",
            "Пограничник",
            "Разведчик",
            "Таможенник",
            "Госслужащий на руководящем посту",
            "Рядовой госслужащий",
            "Член НПО",
            "Член международной организации",
            "Террорист",
            "Доразведка",
            "Противоправка",
            "Наркотики",
            "Член правительства",
            "Комментарий"
        };

        public static List<string> GetAllTypes()
        {
            return Types;
        }
    }
}

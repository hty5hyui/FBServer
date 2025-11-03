using FBServer.Entity.db;

namespace FBServer.Service.Mapper
{
    public class FlagMapper
    {
        public static FlagsDTO ToFlagDTO(Flags flag)
        {
            if (flag == null)
            {
                throw new ArgumentNullException(nameof(flag));
            }

            return new FlagsDTO
            {
                id = flag.id,
                idUser = flag.idUser,
                date = flag.date,
                type = flag.type,
                flagText = flag.flagText,
                author = flag.author
            };
        }

        public static Flags ToFlags(FlagsDTO flag)
        {
            if (flag == null)
            {
                throw new ArgumentNullException(nameof(flag));
            }

            return new Flags
            {
                id = flag.id,
                idUser = flag.idUser,
                date = flag.date,
                type = flag.type,
                flagText = flag.flagText,
                author = flag.author
            };
        }
    }
}

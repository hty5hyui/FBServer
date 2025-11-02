using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace FBServer.Entity.db
{
    public class Flags
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int id { get; set; }
        [Column("idUser")]
        public int idUser { get; set; }
        [Column("date")]
        public DateTime date { get; set; }
        [Column("type")]
        public string type { get; set; }

        [Column("flagText")]
        public string? flagText { get; set; }

        [Column("author")]
        public string? author { get; set; }

        public virtual User? User { get; set; }
    }
}

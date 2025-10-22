using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FBServer.Entity
{
    public class ScriptStatus
    {
        public string? link {  get; set; }
        public bool started { get; set; } = false;
    }

    public class ScriptStartParam
    {
        public string? link { get; set; }
        public int depth { get; set; } = 0;
    }


    public class ScriptParam
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }
        public string? name { get; set; }
        public string ip { get; set; } = "127.0.0.1";
        public int port { get; set; } = 5000;
    }
}

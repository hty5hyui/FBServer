using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FBServer.Entity.db
{
    public class Request
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("id")]
        public int id { get; set; }
        [Column("date")]
        public DateTime date { get; set; }
        [Column("type")]
        public string type { get; set; }
        [Column("status")]
        public int status { get; set; }
        [Column("result")]
        public string? result { get; set; }
    }

    public class RequestDTO
    {
        public int id { get; set; }
        public DateTime date { get; set; }
        public string type { get; set; }
        public int status { get; set; }
    }

    public class RequestPageData
    {
        public int pageCount { get; set; }
        public List<RequestDTO> requests { get; set; }
    }

    public enum RequestStatus
    {
        InProgress = 0,
        Completed = 1,
        Failed = 2
    }
}

using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace FBServer.Entity
{
    public class Friendship
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("friendship_id")]
        public int FriendshipId { get; set; }

        [Column("user1_id")]
        public int User1Id { get; set; }

        [Column("user2_id")]
        public int User2Id { get; set; }

        [Column("handshake")]
        public int? Handshake { get; set; }

        [Column("zero_user")]
        public int? ZeroUser { get; set; }

        // Навигационные свойства
        [ForeignKey("User1Id")]
        public virtual User User1 { get; set; }

        [ForeignKey("User2Id")]
        public virtual User User2 { get; set; }
    }
}

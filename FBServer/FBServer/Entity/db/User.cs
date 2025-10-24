namespace FBServer.Entity.db
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;

    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("user_id")]
        public int UserId { get; set; }
            
        [Column("avatar")]
        public string? Avatar { get; set; }

        [Column("fio")]
        public string? Fio { get; set; }

        [Column("subscribers")]
        public string? Subscribers { get; set; }

        [Column("work")]
        public string? Work { get; set; }

        [Column("university")]
        public string? University { get; set; }

        [Column("school")]
        public string? School { get; set; }

        [Column("home")]
        public string? Home { get; set; }

        [Column("city")]
        public string? City { get; set; }

        [Column("another_city")]
        public string? AnotherCity { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("mobile")]
        public string? Mobile { get; set; }

        [Column("email")]
        public string? Email { get; set; }

        [Column("another_contact_info")]
        public string? AnotherContactInfo { get; set; }

        [Column("whatsapp")]
        public string? Whatsapp { get; set; }

        [Column("site")]
        public string? Site { get; set; }

        [Column("another_web_socialmedia")]
        public string? AnotherWebSocialmedia { get; set; }

        [Column("male")]
        public string? Male { get; set; }

        [Column("language")]
        public string? Language { get; set; }

        [Column("opening_hours")]
        public string? OpeningHours { get; set; }

        [Column("pronouns_in_the_system")]
        public string? PronounsInTheSystem { get; set; }

        [Column("another_basic_information")]
        public string? AnotherBasicInformation { get; set; }

        [Column("category")]
        public string? Category { get; set; }

        [Column("page_id")]
        public string? PageId { get; set; }

        [Column("date_of_creation")]
        public string? DateOfCreation { get; set; }

        [Column("reklama")]
        public string? Reklama { get; set; }

        [Column("info")]
        public string? Info { get; set; }

        [Column("another")]
        public string? Another { get; set; }

        [Column("link")]
        public string? Link { get; set; }

        [Column("work1")]
        public string? Work1 { get; set; }

        [Column("university1")]
        public string? University1 { get; set; }

        [Column("school1")]
        public string? School1 { get; set; }

        [Column("vk")]
        public string? Vk { get; set; }

        [Column("instagram")]
        public string? Instagram { get; set; }

        [Column("skype")]
        public string? Skype { get; set; }

        [Column("linkedin")]
        public string? Linkedin { get; set; }

        [Column("check_link")]
        public int? CheckLink { get; set; }

        [Column("spotify")]
        public string? Spotify { get; set; }

        [Column("kakaotalk")]
        public string? Kakaotalk { get; set; }

        [Column("youtube")]
        public string? Youtube { get; set; }

        [Column("x")]
        public string? X { get; set; }

        [Column("tiktok")]
        public string? Tiktok { get; set; }

        [Column("snapchat")]
        public string? Snapchat { get; set; }

        [Column("wechat")]
        public string? Wechat { get; set; }

        [Column("threads")]
        public string? Threads { get; set; }

        [Column("line")]
        public string? Line { get; set; }

        [Column("twitch")]
        public string? Twitch { get; set; }

        [Column("askfm")]
        public string? Askfm { get; set; }

        [Column("pinterest")]
        public string? Pinterest { get; set; }

        [Column("soundcloud")]
        public string? Soundcloud { get; set; }

        [Column("ok")]
        public string? Ok { get; set; }

        [Column("avatar_byte")]
        public byte[]? AvatarByte { get; set; }
    }


    public class UserDTO
    {
        public int UserId { get; set; }
        public string? Avatar { get; set; }
        public string? Fio { get; set; }
        public string? Subscribers { get; set; }
        public string? Work { get; set; }
        public string? University { get; set; }
        public string? School { get; set; }
        public string? Home { get; set; }
        public string? City { get; set; }
        public string? AnotherCity { get; set; }
        public string? Address { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
        public string? AnotherContactInfo { get; set; }
        public string? Whatsapp { get; set; }
        public string? Site { get; set; }
        public string? AnotherWebSocialmedia { get; set; }
        public string? Male { get; set; }
        public string? Language { get; set; }
        public string? OpeningHours { get; set; }
        public string? PronounsInTheSystem { get; set; }
        public string? AnotherBasicInformation { get; set; }
        public string? Category { get; set; }
        public string? PageId { get; set; }
        public string? DateOfCreation { get; set; }
        public string? Reklama { get; set; }
        public string? Info { get; set; }
        public string? Another { get; set; }
        public string? Link { get; set; }
        public string? Work1 { get; set; }
        public string? University1 { get; set; }
        public string? School1 { get; set; }
        public string? Vk { get; set; }
        public string? Instagram { get; set; }
        public string? Skype { get; set; }
        public string? Linkedin { get; set; }
        public int? CheckLink { get; set; }
        public string? Spotify { get; set; }
        public string? Kakaotalk { get; set; }
        public string? Youtube { get; set; }
        public string? X { get; set; }
        public string? Tiktok { get; set; }
        public string? Snapchat { get; set; }
        public string? Wechat { get; set; }
        public string? Threads { get; set; }
        public string? Line { get; set; }
        public string? Twitch { get; set; }
        public string? Askfm { get; set; }
        public string? Pinterest { get; set; }
        public string? Soundcloud { get; set; }
        public string? Ok { get; set; }
        public string? AvatarByte { get; set; }
    }

    public class UserPreview
    {
        public int UserId { get; set; }
        public string? Fio { get; set; }
        public string? Link { get; set; }
        public string? Subscribers { get; set; }
        public string? Mobile { get; set; }
        public string? Email { get; set; }
    }

    public class UserPreviewPageData
    {
        public int pageCount { get; set; }
        public List<UserPreview> userPreviews { get; set; }
    }
}

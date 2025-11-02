using FBServer.Entity.db;

namespace FBServer.Service
{
    public class UserMapper
    {
        public static UserDTO ToUserDTO(User user)
        {
            if (user == null)
            {
                throw new ArgumentNullException(nameof(user));
            }

            return new UserDTO
            {
                UserId = user.UserId,
                Fio = user.Fio,
                Subscribers = user.Subscribers,
                Work = user.Work,
                University = user.University,
                School = user.School,
                Home = user.Home,
                City = user.City,
                AnotherCity = user.AnotherCity,
                Address = user.Address,
                Mobile = user.Mobile,
                Email = user.Email,
                AnotherContactInfo = user.AnotherContactInfo,
                Whatsapp = user.Whatsapp,
                Site = user.Site,
                AnotherWebSocialmedia = user.AnotherWebSocialmedia,
                Male = user.Male,
                Language = user.Language,
                OpeningHours = user.OpeningHours,
                AnotherBasicInformation = user.AnotherBasicInformation,
                Category = user.Category,
                Reklama = user.Reklama,
                Info = user.Info,
                Another = user.Another,
                Link = user.Link,
                Work1 = user.Work1,
                University1 = user.University1,
                School1 = user.School1,
                Vk = user.Vk,
                Instagram = user.Instagram,
                Skype = user.Skype,
                Linkedin = user.Linkedin,
                Spotify = user.Spotify,
                Kakaotalk = user.Kakaotalk,
                Youtube = user.Youtube,
                X = user.X,
                Tiktok = user.Tiktok,
                Snapchat = user.Snapchat,
                Wechat = user.Wechat,
                Threads = user.Threads,
                Line = user.Line,
                Twitch = user.Twitch,
                Askfm = user.Askfm,
                Pinterest = user.Pinterest,
                Soundcloud = user.Soundcloud,
                Ok = user.Ok,
                PageId = user.PageId,
                DateOfCreation = user.DateOfCreation,
                PronounsInTheSystem = user.PronounsInTheSystem,
                CheckLink = user.CheckLink,
                AvatarByte = user.AvatarByte == null ? null : Convert.ToBase64String(user.AvatarByte)
            };
        }

        public static User ToUser(UserDTO dto)
        {
            if (dto == null)
            {
                throw new ArgumentNullException(nameof(dto));
            }

            return new User
            {
                UserId = dto.UserId,
                Fio = dto.Fio,
                Subscribers = dto.Subscribers,
                Work = dto.Work,
                University = dto.University,
                School = dto.School,
                Home = dto.Home,
                City = dto.City,
                AnotherCity = dto.AnotherCity,
                Address = dto.Address,
                Mobile = dto.Mobile,
                Email = dto.Email,
                AnotherContactInfo = dto.AnotherContactInfo,
                Whatsapp = dto.Whatsapp,
                Site = dto.Site,
                AnotherWebSocialmedia = dto.AnotherWebSocialmedia,
                Male = dto.Male,
                Language = dto.Language,
                OpeningHours = dto.OpeningHours,
                PronounsInTheSystem = dto.PronounsInTheSystem,
                AnotherBasicInformation = dto.AnotherBasicInformation,
                Category = dto.Category,
                PageId = dto.PageId,
                DateOfCreation = dto.DateOfCreation,
                Reklama = dto.Reklama,
                Info = dto.Info,
                Another = dto.Another,
                Link = dto.Link,
                Work1 = dto.Work1,
                University1 = dto.University1,
                School1 = dto.School1,
                Vk = dto.Vk,
                Instagram = dto.Instagram,
                Skype = dto.Skype,
                Linkedin = dto.Linkedin,
                CheckLink = dto.CheckLink,
                Spotify = dto.Spotify,
                Kakaotalk = dto.Kakaotalk,
                Youtube = dto.Youtube,
                X = dto.X,
                Tiktok = dto.Tiktok,
                Snapchat = dto.Snapchat,
                Wechat = dto.Wechat,
                Threads = dto.Threads,
                Line = dto.Line,
                Twitch = dto.Twitch,
                Askfm = dto.Askfm,
                Pinterest = dto.Pinterest,
                Soundcloud = dto.Soundcloud,
                Ok = dto.Ok,
                AvatarByte = string.IsNullOrEmpty(dto.AvatarByte) ? null : Convert.FromBase64String(dto.AvatarByte)
            };
        }
    }
}

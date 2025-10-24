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
                Avatar = user.Avatar,
                Fio = user.Fio,
                Subscribers = user.Subscribers,
                Work = user.Work,
                University = user.University,
                School = user.School,
                Home = user.Home,
                City = user.City,
                AnotherCity = user.AnotherCity,
                Address = user.Address,
                Mobile = user.Mobile == null ? null : user.Mobile.Trim(),
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
    }
}

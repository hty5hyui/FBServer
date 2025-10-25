namespace FBServer.Entity
{
    public class PageSearchEntity
    {
        public int page { get; set; } = 1;
        public string? searchQuery { get; set; } = null;
    }
}

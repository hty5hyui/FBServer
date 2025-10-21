using FBServer.Entity.db;
using Microsoft.EntityFrameworkCore;

public class AppDbFBContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Friendship> Friendships { get; set; }

    public AppDbFBContext(DbContextOptions<AppDbFBContext> options) : base(options)
    {
        Database.EnsureCreated();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        //Конфигурация для Users
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("users_pk");
            entity.ToTable("users", "public");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        //Конфигурация для Friendships
        modelBuilder.Entity<Friendship>(entity =>
        {
            entity.HasKey(e => e.FriendshipId).HasName("friendships_pkey");
            entity.ToTable("friendships", "public");

            entity.Property(e => e.FriendshipId).HasColumnName("friendship_id");
            entity.Property(e => e.User1Id).HasColumnName("user1_id");
            entity.Property(e => e.User2Id).HasColumnName("user2_id");
            entity.Property(e => e.Handshake).HasColumnName("handshake");
            entity.Property(e => e.ZeroUser).HasColumnName("zero_user");

            // Уникальные значения
            entity.HasIndex(e => new { e.User1Id, e.User2Id })
                  .IsUnique()
                  .HasDatabaseName("friendships_user1_id_user2_id_key");

            // Внешний ключ
            entity.HasOne(e => e.User1)
                  .WithMany()
                  .HasForeignKey(e => e.User1Id)
                  .HasConstraintName("friendships_user1_id_fkey")
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User2)
                  .WithMany()
                  .HasForeignKey(e => e.User2Id)
                  .HasConstraintName("friendships_user2_id_fkey")
                  .OnDelete(DeleteBehavior.Restrict);

            // Индекс
            entity.HasIndex(e => e.User2Id)
                  .HasDatabaseName("idx_friendships_user2_id");
        });
        //Под новый стиль (можно будет потом переписать все под такой)
        modelBuilder.Entity<Friendship>().ToTable(t => t.HasCheckConstraint("friendships_check", "user1_id < user2_id"));
    }
}
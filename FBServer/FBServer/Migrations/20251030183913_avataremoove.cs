using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FBServer.Migrations
{
    /// <inheritdoc />
    public partial class avataremoove : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "avatar",
                schema: "public",
                table: "users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "avatar",
                schema: "public",
                table: "users",
                type: "text",
                nullable: true);
        }
    }
}

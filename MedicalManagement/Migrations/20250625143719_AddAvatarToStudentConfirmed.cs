using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddAvatarToStudentConfirmed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "avatar",
                table: "Student",
                type: "varbinary(max)",
                nullable: true);
        }


        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}

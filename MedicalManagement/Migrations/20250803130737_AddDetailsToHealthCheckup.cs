using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicalManagement.Migrations
{
    /// <inheritdoc />
    public partial class AddDetailsToHealthCheckup : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cardiovascular",
                table: "Health_Checkup",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "dental_health",
                table: "Health_Checkup",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "height_cm",
                table: "Health_Checkup",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "vision",
                table: "Health_Checkup",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "weight_kg",
                table: "Health_Checkup",
                type: "float",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Blog_Post",
                columns: table => new
                {
                    blog_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Blog_Post", x => x.blog_id);
                });

            migrationBuilder.CreateTable(
                name: "Health_Document",
                columns: table => new
                {
                    document_id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    image_url = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_deleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Health_Document", x => x.document_id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Medical_Notification_student_id",
                table: "Medical_Notification",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Medical_Event_student_id",
                table: "Medical_Event",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Consent_student_id",
                table: "Consent",
                column: "student_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Consent_Student_student_id",
                table: "Consent",
                column: "student_id",
                principalTable: "Student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Medical_Event_Student_student_id",
                table: "Medical_Event",
                column: "student_id",
                principalTable: "Student",
                principalColumn: "student_id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Medical_Notification_Student_student_id",
                table: "Medical_Notification",
                column: "student_id",
                principalTable: "Student",
                principalColumn: "student_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consent_Student_student_id",
                table: "Consent");

            migrationBuilder.DropForeignKey(
                name: "FK_Medical_Event_Student_student_id",
                table: "Medical_Event");

            migrationBuilder.DropForeignKey(
                name: "FK_Medical_Notification_Student_student_id",
                table: "Medical_Notification");

            migrationBuilder.DropTable(
                name: "Blog_Post");

            migrationBuilder.DropTable(
                name: "Health_Document");

            migrationBuilder.DropIndex(
                name: "IX_Medical_Notification_student_id",
                table: "Medical_Notification");

            migrationBuilder.DropIndex(
                name: "IX_Medical_Event_student_id",
                table: "Medical_Event");

            migrationBuilder.DropIndex(
                name: "IX_Consent_student_id",
                table: "Consent");

            migrationBuilder.DropColumn(
                name: "cardiovascular",
                table: "Health_Checkup");

            migrationBuilder.DropColumn(
                name: "dental_health",
                table: "Health_Checkup");

            migrationBuilder.DropColumn(
                name: "height_cm",
                table: "Health_Checkup");

            migrationBuilder.DropColumn(
                name: "vision",
                table: "Health_Checkup");

            migrationBuilder.DropColumn(
                name: "weight_kg",
                table: "Health_Checkup");
        }
    }
}

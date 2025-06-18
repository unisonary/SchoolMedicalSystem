using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MedicalManagement.Migrations
{
    /// <inheritdoc />
    public partial class SyncManualChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    AppointmentId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StudentId = table.Column<int>(type: "int", nullable: false),
                    ParentId = table.Column<int>(type: "int", nullable: false),
                    NurseId = table.Column<int>(type: "int", nullable: true),
                    ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.AppointmentId);
                });


   

            migrationBuilder.CreateIndex(
                name: "IX_Health_Checkup_nurse_id",
                table: "Health_Checkup",
                column: "nurse_id");

            migrationBuilder.CreateIndex(
                name: "IX_Health_Record_nurse_id",
                table: "Health_Record",
                column: "nurse_id");

            migrationBuilder.CreateIndex(
                name: "IX_Medical_Event_nurse_id",
                table: "Medical_Event",
                column: "nurse_id");

            migrationBuilder.CreateIndex(
                name: "IX_Medication_nurse_id",
                table: "Medication",
                column: "nurse_id");

            migrationBuilder.CreateIndex(
                name: "IX_Medication_student_id",
                table: "Medication",
                column: "student_id");

            migrationBuilder.CreateIndex(
                name: "IX_Student_parent_id",
                table: "Student",
                column: "parent_id");

            migrationBuilder.CreateIndex(
                name: "IX_Vaccination_nurse_id",
                table: "Vaccination",
                column: "nurse_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Admin");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "Consent");

            migrationBuilder.DropTable(
                name: "Health_Checkup");

            migrationBuilder.DropTable(
                name: "Health_Record");

            migrationBuilder.DropTable(
                name: "Inventory");

            migrationBuilder.DropTable(
                name: "Manager");

            migrationBuilder.DropTable(
                name: "Medical_Condition");

            migrationBuilder.DropTable(
                name: "Medical_Event");

            migrationBuilder.DropTable(
                name: "Medical_Notification");

            migrationBuilder.DropTable(
                name: "Medication");

            migrationBuilder.DropTable(
                name: "PasswordResetOtp");

            migrationBuilder.DropTable(
                name: "User_Account");

            migrationBuilder.DropTable(
                name: "Vaccination");

            migrationBuilder.DropTable(
                name: "Student");

            migrationBuilder.DropTable(
                name: "School_Nurse");

            migrationBuilder.DropTable(
                name: "Parent");
        }
    }
}

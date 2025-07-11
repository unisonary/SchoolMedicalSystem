using ClosedXML.Excel;
using MedicalManagement.Data;
using MedicalManagement.Models.DTOs;
using MedicalManagement.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MedicalManagement.Services
{
    public class ReportService : IReportService
    {
        private readonly AppDbContext _context;

        public ReportService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<HealthCheckupReportDTO>> GetHealthCheckupReportAsync(HealthCheckupReportFilterDTO filter)
        {
            var query = from h in _context.HealthCheckups
                        join s in _context.Students on h.StudentId equals s.StudentId
                        where h.Date > DateTime.MinValue
                        select new
                        {
                            h.CheckupType,
                            s.Class,
                            h.Date,
                            h.FollowUpRequired
                        };

            if (!string.IsNullOrEmpty(filter.Grade))
                query = query.Where(x => x.Class == filter.Grade);

            if (filter.FromDate.HasValue)
                query = query.Where(x => x.Date >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(x => x.Date <= filter.ToDate.Value);

            var result = await query
                .GroupBy(x => new { x.CheckupType, x.Class })
                .Select(g => new HealthCheckupReportDTO
                {
                    CheckupType = g.Key.CheckupType,
                    Grade = g.Key.Class,
                    TotalCheckups = g.Count(),
                    AbnormalCount = g.Count(x => x.FollowUpRequired)
                })
                .OrderBy(x => x.Grade).ThenBy(x => x.CheckupType)
                .ToListAsync();

            return result;
        }

        public async Task<List<InventoryReportDTO>> GetInventoryReportAsync(InventoryReportFilterDTO filter)
        {
            var today = DateTime.Today;
            var thresholdDate = today.AddDays(30);

            var query = _context.Inventories
                .Where(i => i.IsActive)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter.ItemType))
                query = query.Where(i => i.ItemType == filter.ItemType);

            if (filter.FromExpiryDate.HasValue)
                query = query.Where(i => i.ExpiryDate >= filter.FromExpiryDate.Value);

            if (filter.ToExpiryDate.HasValue)
                query = query.Where(i => i.ExpiryDate <= filter.ToExpiryDate.Value);

            var result = await query
                .Select(i => new InventoryReportDTO
                {
                    ItemName = i.ItemName,
                    ItemType = i.ItemType,
                    Quantity = i.Quantity,
                    MinimumStockLevel = i.MinimumStockLevel,
                    ExpiryDate = i.ExpiryDate ?? DateTime.MinValue,
                    AlertStatus =
                        i.Quantity < i.MinimumStockLevel ? "LowStock" :
                        i.ExpiryDate <= thresholdDate ? "ExpirySoon" : "Normal"
                })
                .OrderBy(i => i.ItemName)
                .ToListAsync();

            return result;
        }

        public async Task<List<VaccinationReportDTO>> GetVaccinationReportAsync(VaccinationReportFilterDTO filter)
        {
            var query = from v in _context.Vaccinations
                        join s in _context.Students on v.StudentId equals s.StudentId
                        where v.Date > DateTime.MinValue
                        select new { v.VaccineName, s.Class, v.Date };

            if (!string.IsNullOrEmpty(filter.Grade))
                query = query.Where(x => x.Class == filter.Grade);

            if (!string.IsNullOrEmpty(filter.VaccineName))
                query = query.Where(x => x.VaccineName == filter.VaccineName);

            if (filter.FromDate.HasValue)
                query = query.Where(x => x.Date >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(x => x.Date <= filter.ToDate.Value);

            var result = await query
                .GroupBy(x => new { x.VaccineName, x.Class })
                .Select(g => new VaccinationReportDTO
                {
                    VaccineName = g.Key.VaccineName ?? "Không rõ",
                    Grade = g.Key.Class,
                    StudentCount = g.Count()
                })
                .OrderBy(x => x.Grade).ThenBy(x => x.VaccineName)
                .ToListAsync();

            return result;
        }

        public async Task<List<ParticipationReportDTO>> GetParticipationReportAsync(ParticipationReportFilterDTO filter)
        {
            var planQuery = _context.MedicalPlans.AsQueryable();

            if (filter.PlanId.HasValue)
            {
                planQuery = planQuery.Where(p => p.PlanId == filter.PlanId.Value);
            }

            var plans = await planQuery.ToListAsync();
            var result = new List<ParticipationReportDTO>();

            foreach (var plan in plans)
            {
                var consents = await _context.Consents
                    .Where(c => c.ConsentType == plan.PlanType && c.ReferenceId == plan.PlanId)
                    .ToListAsync();

                var approved = consents.Count(c => c.ConsentStatus == "Approved");
                var denied = consents.Count(c => c.ConsentStatus == "Denied");
                var total = consents.Count;

                result.Add(new ParticipationReportDTO
                {
                    PlanId = plan.PlanId,
                    PlanName = plan.PlanName,
                    PlanType = plan.PlanType,
                    TargetGrade = plan.TargetGrade,
                    TotalStudents = total,
                    ApprovedCount = approved,
                    DeniedCount = denied
                });
            }

            return result.OrderByDescending(r => r.ParticipationRate).ToList();
        }


        public async Task<byte[]> ExportParticipationReportToExcelAsync(ParticipationReportFilterDTO filter)
        {
            var data = await GetParticipationReportAsync(filter);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Participation Report");

            worksheet.Cell(1, 1).Value = "Plan ID";
            worksheet.Cell(1, 2).Value = "Plan Name";
            worksheet.Cell(1, 3).Value = "Type";
            worksheet.Cell(1, 4).Value = "Grade";
            worksheet.Cell(1, 5).Value = "Total Students";
            worksheet.Cell(1, 6).Value = "Approved";
            worksheet.Cell(1, 7).Value = "Denied";
            worksheet.Cell(1, 8).Value = "Participation Rate (%)";

            for (int i = 0; i < data.Count; i++)
            {
                var row = i + 2;
                worksheet.Cell(row, 1).Value = data[i].PlanId;
                worksheet.Cell(row, 2).Value = data[i].PlanName;
                worksheet.Cell(row, 3).Value = data[i].PlanType;
                worksheet.Cell(row, 4).Value = data[i].TargetGrade;
                worksheet.Cell(row, 5).Value = data[i].TotalStudents;
                worksheet.Cell(row, 6).Value = data[i].ApprovedCount;
                worksheet.Cell(row, 7).Value = data[i].DeniedCount;
                worksheet.Cell(row, 8).Value = data[i].ParticipationRate;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }





        public async Task<byte[]> ExportVaccinationReportToExcel(VaccinationReportFilterDTO filter)
        {
            var data = await GetVaccinationReportAsync(filter);
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Vaccination Report");

            worksheet.Cell(1, 1).Value = "Vaccine Name";
            worksheet.Cell(1, 2).Value = "Grade";
            worksheet.Cell(1, 3).Value = "Student Count";

            for (int i = 0; i < data.Count; i++)
            {
                worksheet.Cell(i + 2, 1).Value = data[i].VaccineName;
                worksheet.Cell(i + 2, 2).Value = data[i].Grade;
                worksheet.Cell(i + 2, 3).Value = data[i].StudentCount;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }


        public async Task<byte[]> ExportHealthCheckupReportToExcelAsync(HealthCheckupReportFilterDTO filter)
        {
            var data = await GetHealthCheckupReportAsync(filter);
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Health Checkup Report");

            worksheet.Cell(1, 1).Value = "Checkup Type";
            worksheet.Cell(1, 2).Value = "Grade";
            worksheet.Cell(1, 3).Value = "Total Checkups";
            worksheet.Cell(1, 4).Value = "Abnormal Count";

            for (int i = 0; i < data.Count; i++)
            {
                worksheet.Cell(i + 2, 1).Value = data[i].CheckupType;
                worksheet.Cell(i + 2, 2).Value = data[i].Grade;
                worksheet.Cell(i + 2, 3).Value = data[i].TotalCheckups;
                worksheet.Cell(i + 2, 4).Value = data[i].AbnormalCount;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public async Task<byte[]> ExportInventoryReportToExcelAsync(InventoryReportFilterDTO filter)
        {
            var data = await GetInventoryReportAsync(filter);
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Inventory Report");

            worksheet.Cell(1, 1).Value = "Item Name";
            worksheet.Cell(1, 2).Value = "Item Type";
            worksheet.Cell(1, 3).Value = "Quantity";
            worksheet.Cell(1, 4).Value = "Minimum Stock";
            worksheet.Cell(1, 5).Value = "Expiry Date";
            worksheet.Cell(1, 6).Value = "Alert Status";

            for (int i = 0; i < data.Count; i++)
            {
                worksheet.Cell(i + 2, 1).Value = data[i].ItemName;
                worksheet.Cell(i + 2, 2).Value = data[i].ItemType;
                worksheet.Cell(i + 2, 3).Value = data[i].Quantity;
                worksheet.Cell(i + 2, 4).Value = data[i].MinimumStockLevel;
                worksheet.Cell(i + 2, 5).Value = data[i].ExpiryDate.HasValue
                    ? data[i].ExpiryDate.Value.ToString("yyyy-MM-dd")
                    : string.Empty;
                worksheet.Cell(i + 2, 6).Value = data[i].AlertStatus;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }
}

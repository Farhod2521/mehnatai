export type EmployeeStatus = "YUQORI" | "O'RTA" | "RIVOJLANISH KERAK";

export interface Employee {
  id: string;
  initials: string;
  name: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  score: number;
  experience: string;
  projects: number;
  feedback: number;
  level: string;
  avatar?: string;
}

export const employees: Employee[] = [
  { id: "1", initials: "AF", name: "Azizbek Fayzullaev", position: "Senior Developer", department: "IT bo'limi", status: "YUQORI", score: 92, experience: "5 yil", projects: 18, feedback: 4.8, level: "Senior" },
  { id: "2", initials: "SK", name: "Shahlo Karimova", position: "HR Manager", department: "HR bo'limi", status: "O'RTA", score: 74, experience: "3 yil", projects: 8, feedback: 4.2, level: "Middle" },
  { id: "3", initials: "OR", name: "Otabek Rasulov", position: "Sales Agent", department: "Sotuv bo'limi", status: "RIVOJLANISH KERAK", score: 42, experience: "1 yil", projects: 4, feedback: 3.1, level: "Junior" },
  { id: "4", initials: "NM", name: "Nigora Mansurova", position: "Marketing Lead", department: "Marketing", status: "YUQORI", score: 85, experience: "4 yil", projects: 12, feedback: 4.6, level: "Lead" },
  { id: "5", initials: "JM", name: "Javohir Meliboev", position: "Junior Designer", department: "IT bo'limi", status: "O'RTA", score: 68, experience: "2 yil", projects: 6, feedback: 4.0, level: "Junior" },
  { id: "6", initials: "SA", name: "Sardor Aliev", position: "Head of Sales", department: "Sotuv bo'limi", status: "YUQORI", score: 95, experience: "7 yil", projects: 24, feedback: 4.9, level: "Lead" },
  { id: "7", initials: "AK", name: "Alisher Karimov", position: "Dasturchi", department: "IT bo'limi", status: "YUQORI", score: 84, experience: "3.5 yil", projects: 14, feedback: 4.9, level: "Middle" },
  { id: "8", initials: "DY", name: "Dilnoza Yusupova", position: "QA Engineer", department: "IT bo'limi", status: "O'RTA", score: 71, experience: "2.5 yil", projects: 9, feedback: 4.3, level: "Middle" },
  { id: "9", initials: "BT", name: "Bobur Toshmatov", position: "DevOps Engineer", department: "IT bo'limi", status: "YUQORI", score: 88, experience: "4 yil", projects: 11, feedback: 4.7, level: "Senior" },
  { id: "10", initials: "MN", name: "Malika Nazarova", position: "UX Designer", department: "IT bo'limi", status: "O'RTA", score: 77, experience: "3 yil", projects: 8, feedback: 4.5, level: "Middle" },
  { id: "11", initials: "KR", name: "Komil Razzaqov", position: "Sales Manager", department: "Sotuv bo'limi", status: "RIVOJLANISH KERAK", score: 55, experience: "1.5 yil", projects: 5, feedback: 3.5, level: "Junior" },
  { id: "12", initials: "ZI", name: "Zulfiya Ismoilova", position: "Content Manager", department: "Marketing", status: "O'RTA", score: 72, experience: "2 yil", projects: 7, feedback: 4.1, level: "Middle" },
];

export const kpiMetrics = [
  { name: "Vazifalar bajarish", target: 90, actual: 88, weight: 20 },
  { name: "Kod sifati", target: 85, actual: 91, weight: 15 },
  { name: "Muddatga rioya", target: 85, actual: 92, weight: 15 },
  { name: "Bug hal qilish", target: 24, actual: 18, weight: 10, unit: "soat" },
  { name: "Test qoplama", target: 80, actual: 85, weight: 10, unit: "%" },
  { name: "Qatnashish", target: 95, actual: 97, weight: 10, unit: "%" },
  { name: "Treninglar", target: 1, actual: 2, weight: 5, unit: "/oy" },
  { name: "360 Feedback", target: 4.0, actual: 4.9, weight: 5, unit: "/5" },
];
